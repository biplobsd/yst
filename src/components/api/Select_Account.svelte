<script lang="ts">
  import { runtime } from "src/utils/communication";
  import { delay } from "src/utils/helper";
  import log from "src/utils/logger";
  import { blur } from "svelte/transition";
  import {
    firstOAuthKeyWritable,
    secondOAuthKeyWritable,
    firstUserWritable,
    secondUserWritable,
    primaryChannelWritable,
  } from "src/utils/storage";
  import Item from "./Item.svelte";
  import axios from "axios";
  import DocsLink from "../Docs_Link.svelte";
  import { docs } from "src/utils/docs";
  import { SETTINGS_DEFAULT as ud } from "src/utils/default";

  export let isRunning: boolean;
  export let isReady: boolean;
  export let isStop: boolean;
  export let setStatus: (msg: string, isError?: boolean) => void;

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
      await runtime.send({
        to: "background",
        status: { code: "ready", msg: "Get ready status" },
      });
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

  async function connectDisconnect(btnNo: "0" | "1") {
    isRunning = true;
    primaryChannelWritable.set(btnNo);
    try {
      if (btnNo === "0") {
        if ($firstOAuthKeyWritable) {
          await revokeToken($firstOAuthKeyWritable);
          firstOAuthKeyWritable.set("");
          firstUserWritable.set(ud.firstUser);
          return;
        }
      } else {
        if ($secondOAuthKeyWritable) {
          await revokeToken($secondOAuthKeyWritable);
          secondOAuthKeyWritable.set("");
          secondUserWritable.set(ud.secondUser);
          return;
        }
      }

      await runtime.send({
        to: "background",
        status: { code: "getAuthToken", msg: "OAuth token get" },
      });

      await waitingForResponseReady(`Waiting for the OAuth Token `, 30);
    } catch (error) {
      log.info(error);
      $primaryChannelWritable = "-1";
    } finally {
      isRunning = false;
    }
  }

  $: {
    if ($primaryChannelWritable === "0" && $firstUserWritable?.given_name) {
      primaryChannelName = $firstUserWritable.given_name;
    } else if (
      $primaryChannelWritable === "1" &&
      $secondUserWritable?.given_name
    ) {
      primaryChannelName = $secondUserWritable.given_name;
    } else {
      primaryChannelName = "Choose an account";
      if (!isRunning) {
        primaryChannelWritable.set("-1");
      }
    }
  }
</script>

<div class="font-bold flex items-center gap-1">
  Account <DocsLink href={docs.connectAccount} />
</div>
<div
  class="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box"
>
  <input type="checkbox" class="peer !min-h-8" />
  <div
    class="!min-h-8 !py-0 flex items-center collapse-title after:!top-4 text-sm tracking-wider font-sans font-semibold"
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
          <th></th>
          <th>Name</th>
          <th class="text-center">Status</th>
        </tr>
      </thead>
      <tbody>
        <Item id={"0"} bind:isRunning {connectDisconnect} />
        <Item id={"1"} bind:isRunning {connectDisconnect} />
      </tbody>
    </table>
  </div>
</div>
