<script lang="ts">
  import { readySignalSend } from "src/background/helper";
  import { runtime } from "src/utils/communication";
  import { delay } from "src/utils/helper";
  import log from "src/utils/logger";
  import type { User } from "src/utils/schema";
  import { blur } from "svelte/transition";
  import {
    channel0OAuthTokenWritable,
    channel1OAuthTokenWritable,
    firstUserWritable,
    secondUserWritable,
  } from "src/utils/storage";
  import { onMount } from "svelte";
  import Item from "./Item.svelte";
  import axios from "axios";
  import type { PrimaryChannel } from "src/utils/types";

  export let primaryChannel: PrimaryChannel;
  export let isRunning: boolean;
  export let isReady: boolean;
  export let isStop: boolean;
  export let setStatus: (msg: string, isError?: boolean) => void;

  let channel0OAuthToken: string | null = null;
  let channel1OAuthToken: string | null = null;

  let firstUser: User | null = null;
  let secondUser: User | null = null;

  let primaryChannelName: string;

  async function waitingForResponse(msg: string, sec: number, ms: number) {
    isReady = false;
    for (let index = sec; index >= 0; index--) {
      if (isReady || isStop) {
        return true;
      }
      setStatus(msg + " T-" + index);
      await delay(ms);
    }

    return false;
  }

  async function waitingForResponseReady(msg: string, sec = 10, ms = 1000) {
    if (await waitingForResponse(msg, sec, ms)) {
      return false;
    }

    if (!isReady) {
      await readySignalSend();
    } else {
      return false;
    }

    if (await waitingForResponse("[Retry wait] " + msg, sec, ms)) {
      return false;
    }

    setStatus("Error: Background script did not responding", true);

    return true;
  }

  async function revokeToken(token: string) {
    try {
      await axios.get(`https://accounts.google.com/o/oauth2/revoke`, {
        params: {
          token,
        },
      });
    } catch (error) {
      log.error(error);
    }
  }

  async function connectDisconnect(btnNo: 0 | 1) {
    isRunning = true;
    primaryChannel = btnNo;
    try {
      if (btnNo === 0) {
        if (channel0OAuthToken) {
          await revokeToken(channel0OAuthToken);
          channel0OAuthTokenWritable.set(null);
          firstUserWritable.set(null);
          return;
        }
      } else {
        if (channel1OAuthToken) {
          await revokeToken(channel1OAuthToken);
          channel1OAuthTokenWritable.set(null);
          secondUserWritable.set(null);
          return;
        }
      }

      await runtime.send({
        type: "statusBackground",
        status: { code: "authToken", msg: "OAuth token get" },
      });

      await waitingForResponseReady(`Waiting for the OAuth Token `, 30);
    } catch (error) {
      log.info(error);
    } finally {
      isRunning = false;
    }
  }

  onMount(() => {
    firstUserWritable.subscribe((value) => (firstUser = value));
    secondUserWritable.subscribe((value) => (secondUser = value));

    channel0OAuthTokenWritable.subscribe(
      (value) => (channel0OAuthToken = value)
    );

    channel1OAuthTokenWritable.subscribe(
      (value) => (channel1OAuthToken = value)
    );
  });

  $: {
    if (primaryChannel === 0 && firstUser) {
      primaryChannelName = firstUser.given_name;
    } else if (primaryChannel === 1 && secondUser) {
      primaryChannelName = secondUser.given_name;
    } else {
      primaryChannelName = "Choose an account";
      if (!isRunning) {
        primaryChannel = -1;
      }
    }
  }
</script>

<div class="font-bold">Account</div>
<div
  class="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box"
>
  <input type="checkbox" class="peer !min-h-8" />
  <div
    class="!min-h-8 !py-0 flex items-center collapse-title text-sm tracking-wider font-sans font-semibold"
  >
    {#key primaryChannelName}
      <span in:blur>{primaryChannelName}</span>
    {/key}
  </div>
  <div
    class="scrollbar-style overflow-hidden collapse-content peer-checked:pb-2 w-full"
  >
    <table class="table table-xs w-full">
      <thead>
        <tr>
          <th />
          <th>Name</th>
          <th class="text-center">Status</th>
        </tr>
      </thead>
      <tbody>
        <Item
          id={0}
          isConnect={channel0OAuthToken ? true : false}
          bind:isRunning
          bind:primaryChannel
          bind:user={firstUser}
          {connectDisconnect}
        />
        <Item
          id={1}
          isConnect={channel1OAuthToken ? true : false}
          bind:isRunning
          bind:primaryChannel
          bind:user={secondUser}
          {connectDisconnect}
        />
      </tbody>
    </table>
  </div>
</div>
