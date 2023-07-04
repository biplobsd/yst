<script lang="ts">
  import "src/options/styles.css";
  import { onDestroy, onMount } from "svelte";
  import { STORIES_URL } from "src/utils/constants";
  import { delay, isRightSite } from "src/utils/helper";
  import {
    runtime,
    runtimeMessageSchema,
    type RuntimeMessage,
  } from "src/utils/communication";
  import type { XPathModel } from "src/utils/xpaths";
  import {
    channelPathsSchema,
    channelPathsWritable,
    xPathValuesWritable,
  } from "src/utils/storage";
  import { get } from "svelte/store";

  let channelPaths: string[] = [];
  let xpathValues: XPathModel | undefined = undefined;
  let lastStatusData: RuntimeMessage | undefined = undefined;

  let isLoading = true;
  let ready = false;
  let isRightSiteNow = false;
  let status: { isError: boolean; msg?: string } = { isError: false };
  let storageRemoveListener: () => void;
  let channelPathsText = "";
  let saveError = false;
  let isStop = false;
  let isSubLoading = false;
  let channelPathsCount = 0;

  async function stop() {
    isStop = true;
    await runtime.send({
      type: "status",
      status: { msg: "Stop signal sended", code: "stop" },
    });
  }

  async function collectSubs() {
    if (isLoading) {
      return false;
    }
    const isRequestSent = await runtime.send({
      type: "status",
      status: { msg: "Collecting links", code: "collecting" },
    });
    if (isRequestSent) {
      return true;
    } else {
      setStatus("Unable to sent collect signal to the content script", true);
      return false;
    }
  }

  async function collectAndWait() {
    await collectSubs();

    for (let index = 0; index < 30; index++) {
      await delay(500);
      if (!isLoading) {
        return true;
      }
    }
    setStatus(
      "Unable to get the subscriptions list from the content client",
      true
    );
    return false;
  }

  async function filterUnSubs(mode = true) {
    const currentSubs: string[] = channelPaths;
    if (!(await collectAndWait())) {
      return;
    }

    if (channelPaths !== currentSubs) {
      let notFoundList: string[];
      if (mode) {
        notFoundList = currentSubs.filter(
          (elem) => !channelPaths.includes(elem)
        );

        if (notFoundList.length === 0) {
          setStatus(
            "Already all those channel are subscribed! No need to again subscribe"
          );
        }
      } else {
        notFoundList = currentSubs.filter((elem) =>
          channelPaths.includes(elem)
        );

        if (notFoundList.length === 0) {
          setStatus(
            "No channel match with your current subscriptions channel list! NO need to unsubscribe"
          );
        }
      }

      saveChannelsIds(notFoundList);
    }
    return;
  }

  async function waitingForResponse(msg: string, sec = 10, delaySec = 1000) {
    let timeoutSub = true;
    ready = false;
    for (let index = 0; index < sec; index++) {
      setStatus(msg + " T-" + index);
      if (ready) {
        timeoutSub = false;
        break;
      }
      if (isStop) {
        return true;
      }
      await delay(delaySec);
    }

    if (!ready) {
      await readySignalSend();
    }

    return timeoutSub || isStop;
  }

  async function subUnSub(mode = true) {
    const un = !mode && "un";
    if (isLoading) {
      return;
    }
    reset();
    try {
      setStatus("Getting current channels");
      await filterUnSubs(mode);

      if (channelPaths.length === 0) {
        return;
      }

      isLoading = true;
      isSubLoading = true;

      setStatus(`Starting to ${un}subscribe to the channels`);
      for (let indexMain = 0; indexMain < channelPaths.length; indexMain++) {
        // Sending webpage change action
        await runtime.send({
          type: "status",
          status: { msg: channelPaths[indexMain], code: "changePage" },
        });

        if (
          await waitingForResponse(
            `Waiting for the ready signal: ` + channelPaths[indexMain]
          )
        ) {
          return;
        }
        // ------------------------------------

        // Sending subscribe, unsubscribe action
        await runtime.send({
          type: "statusContent",
          status: {
            msg: channelPaths[indexMain],
            code: mode ? "subscribe" : "unsubscribe",
          },
        });
        if (
          await waitingForResponse(
            `Waiting for the ${un}subscribe signal: ` + channelPaths[indexMain]
          )
        ) {
          return;
        }
        // ------------------------------------

        // Checking is subscribe, unsubscribe action successful
        if (
          lastStatusData &&
          lastStatusData.status.code ===
            (mode ? "subscribeSuccessful" : "unsubscribeSuccessful")
        ) {
          const sCList = channelPathsText.split(", ");
          sCList.splice(0, 1);

          const l = channelsIdsParse(sCList);
          const parsedChannelPaths = await channelPathsSchema.parseAsync(l);
          channelPathsWritable.set(parsedChannelPaths);
        }
      }

      setStatus("Done");
    } finally {
      isSubLoading = false;
      isLoading = false;
      // channelsIdsStringSave();
    }
  }

  function setStatus(msg: string, isError = false) {
    status = { isError, msg };
  }

  function reset() {
    isLoading = false;
    isStop = false;
    isSubLoading = false;
  }

  async function parseData(dataLocal: RuntimeMessage) {
    setStatus("...");

    const validationResult = await runtimeMessageSchema.safeParseAsync(
      dataLocal
    );

    if (!validationResult.success) {
      setStatus("Error when parsing data", true);
      lastStatusData = undefined;
      return;
    }

    lastStatusData = validationResult.data;

    if (
      lastStatusData.type === "status" ||
      lastStatusData.type === "statusOption"
    ) {
      const status = lastStatusData.status;
      setStatus(status.msg);
      switch (status.code) {
        case "loading":
        case "collecting":
          isLoading = true;
          return;
        case "stop":
          reset();
          return;
        case "ready":
          ready = true;
          await xpathSignalSend();
          return;
        case "unsubscribeSuccessful":
        case "subscribeSuccessful":
        case "accept":
          ready = true;
          isLoading = false;
          return;
        case "error":
          setStatus(status.msg, true);
          isLoading = false;
          ready = true;
          return;
        default:
          return;
      }
    } else if (dataLocal.type === "dataOption") {
      isLoading = false;
      setStatus("Data collected successfully");
      saveChannelsIds(dataLocal.channelPaths);
    }
  }

  function channelsIdsString(listStr: string[]) {
    channelPathsText = listStr.join(", ");
    channelPathsCount = listStr.length;
  }

  function saveChannelsIds(list: string[]) {
    channelsIdsString(list);
    channelPaths = list;

    channelPathsWritable.set(list);
  }

  function channelsIdsParse(listStr: string[]) {
    const l: string[] = [];
    for (let i of listStr) {
      const iTrim = i.trim();
      if (!iTrim.startsWith("@")) {
        if (iTrim.startsWith("channel/")) {
          l.push(iTrim);
          continue;
        }
        saveError = true;
        return;
      }
      l.push(iTrim);
    }
    channelsIdsString(l);
    return l;
  }

  function channelsIdsStringSave(listStr: string = channelPathsText) {
    const l = channelsIdsParse(listStr.split(","));
    if (l === undefined) {
      setStatus("Unable to channels IDs string saving...", true);
      return;
    }
    channelPaths = l;
    channelPathsWritable.set(l);
  }

  async function readySignalSend() {
    // Ready signal
    await runtime.send({
      type: "statusContent",
      status: {
        msg: "Is the content script ready?",
        code: "ready",
      },
    });
  }

  async function xpathSignalSend() {
    if (!xpathValues) {
      setStatus(
        "Unable to send xPathValue signal to the content script...",
        true
      );
      return;
    }
    await runtime.send({
      type: "dataContent",
      status: {
        msg: "Sending XPath values",
        code: "xpath",
      },
      xpathValues,
    });
  }

  onMount(async () => {
    xpathValues = get(xPathValuesWritable);
    const storedChannelPaths = get(channelPathsWritable);
    channelPaths = storedChannelPaths;
    channelsIdsParse(storedChannelPaths);

    storageRemoveListener = runtime.addListener(parseData);

    isRightSiteNow = await isRightSite();
    if (isRightSiteNow) {
      await readySignalSend();
    }
  });

  onDestroy(() => {
    storageRemoveListener();
  });
</script>

<div class="w-full items-center flex flex-col justify-center gap-2">
  {#if isRightSiteNow}
    <div class="mb-4">
      <div class="mb-1"><span class="font-bold">Data</span></div>
      <div
        class="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box"
      >
        <input type="checkbox" class="peer" />
        <div
          class="collapse-title text-sm bg-success/70 text-black/70 tracking-wider font-sans"
        >
          Subscriptions: {channelPathsCount}
        </div>
        <div class="collapse-content bg-success/60 peer-checked:py-2">
          <span class="text-xs text-slate-800 space-y-2">
            <p>
              Enter only channel IDs. Channel IDs start with the <span
                class="font-bold">@</span
              >
              symbol.
            </p>
            <p>
              Example:
              <span class="font-bold">@youtube</span>,
              <span class="font-bold">@google</span>
            </p>
          </span>
          <form
            on:submit={(e) => {
              e.preventDefault();
              saveError = false;
              channelsIdsStringSave();
            }}
          >
            <textarea
              bind:value={channelPathsText}
              class="textarea textarea-accent w-full text-xs scrollbar-style"
              placeholder="@google, @youtube"
              required
            />
            {#if saveError}
              <div class="alert alert-error shadow-lg mb-4">
                <span>Make sure your input channels start with @</span>
              </div>
            {/if}
            <button disabled={!ready || isSubLoading} class="btn w-full"
              >Save</button
            >
          </form>
        </div>
      </div>
    </div>
  {/if}

  <div class="flex flex-col items-center gap-1 w-full">
    {#if isRightSiteNow}
      {#if status.msg}
        <div class="font-bold flex items-center w-full gap-1">
          Status
          {#if isLoading || !ready || isSubLoading}
            <div class="tooltip tooltip-info" data-tip="Stop now">
              <button class="btn btn-xs flex" on:click={stop}>
                <span class="loading loading-infinity" />
                <span class="animate-pulse">Stop</span>
              </button>
            </div>
          {/if}
        </div>
        <div class="ring w-full py-2 px-2 my-2 rounded-md">
          <span
            class={`${status.isError && "text-red-500"} ${
              isLoading && "animate-bounce"
            } text-xs tracking-wider mb-2 w-full`}>{status.msg}</span
          >
        </div>
      {/if}
      {#if !ready && !isSubLoading}
        <span class="animate-bounce text-xs tracking-wider"
          >Waiting for the content scripts ready signal ...</span
        >
      {/if}

      <div class="w-[17rem] space-y-2">
        <div><span class="font-bold">Actions</span></div>
        <button
          disabled={!isRightSiteNow || !ready || isSubLoading}
          class="btn btn-success w-full rounded-full"
          on:click={collectSubs}
          >{!ready && !isSubLoading
            ? "Not ready yet"
            : "Collect channel"}</button
        >
        <button
          disabled={(channelPathsCount ? false : true) ||
            isSubLoading ||
            !ready}
          class="w-full btn btn-ghost dark:bg-slate-100 bg-slate-800 dark:text-slate-900 text-slate-300 rounded-full hover:bg-slate-600 tsd"
          on:click={() => subUnSub(true)}
          >{!ready && !isSubLoading ? "Not ready yet" : "Subscribe"}</button
        >
        <button
          disabled={(channelPathsCount ? false : true) ||
            isSubLoading ||
            !ready}
          class="w-full btn btn-ghost dark:bg-slate-700/80 bg-slate-200/80 dark:text-slate-300/80 rounded-full hover:bg-slate-500/80 tsd"
          on:click={() => subUnSub(false)}
          >{!ready && !isSubLoading ? "Not ready yet" : "Unsubscribe"}</button
        >
      </div>
    {/if}
    {#if !isRightSiteNow}
      <div>This page is not a YouTube page</div>
      <a
        class="link link-hover text-blue-500 btn"
        target="_blank"
        rel="noreferrer"
        href={STORIES_URL[0]}>Open Youtube</a
      >
    {/if}
  </div>
</div>
