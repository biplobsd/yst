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

  export let primaryChannel: 0 | 1;
  export let isRunning: boolean;
  export let isReady: boolean;
  export let isStop: boolean;
  export let setStatus: (msg: string, isError?: boolean) => void;

  let channel0OAuthToken: string | null = null;
  let channel1OAuthToken: string | null = null;

  $: {
    console.log(
      channel1OAuthToken && channel1OAuthToken?.length !== 0 ? true : false
    );
    console.log(channel0OAuthToken);
  }

  let firstUser: User | null = null;
  let secondUser: User | null = null;

  let primaryChannelName: string;

  async function waitingForResponse(msg: string, sec: number, ms: number) {
    let timeoutSub = true;
    isReady = false;
    for (let index = sec; index >= 0; index--) {
      if (isReady) {
        timeoutSub = false;
        break;
      }
      if (isStop) {
        return true;
      }
      setStatus(msg + " T-" + index);
      await delay(ms);
    }

    return timeoutSub;
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

  async function connectDisconnect(btnNo: 0 | 1) {
    isRunning = true;
    primaryChannel = btnNo;
    try {
      if (btnNo === 0) {
        if (channel0OAuthToken) {
          channel0OAuthTokenWritable.set(null);
          firstUserWritable.set(null);
          return;
        }
      } else {
        if (channel1OAuthToken) {
          channel1OAuthTokenWritable.set(null);
          secondUserWritable.set(null);
          return;
        }
      }

      await runtime.send({
        type: "statusBackground",
        status: { code: "authToken", msg: "OAuth token get" },
      });

      if (await waitingForResponseReady(`Waiting for the OAuth Token `, 30)) {
        return;
      }
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
    if (primaryChannel === 0) {
      if (firstUser) {
        primaryChannelName = firstUser.given_name;
      } else {
        primaryChannelName = "Channel 1";
      }
    } else {
      if (secondUser) {
        primaryChannelName = secondUser.given_name;
      } else {
        primaryChannelName = "Channel 2";
      }
    }
  }
</script>

<div>Select Account</div>
<div
  class="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box"
>
  <input type="checkbox" class="peer" />
  <div class="collapse-title text-sm tracking-wider font-sans font-semibold">
    {#key primaryChannelName}
      <span in:blur>{primaryChannelName}</span>
    {/key}
  </div>
  <div
    class="scrollbar-style overflow-hidden collapse-content peer-checked:pb-2 peer-checked:!-mt-5 w-full"
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
