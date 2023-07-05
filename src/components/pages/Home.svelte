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
  import { blur, slide } from "svelte/transition";
  import log from "src/utils/logger";
  import ExternalLinkIcon from "../icons/External_Link_Icon.svelte";
  import toast from "svelte-french-toast";
  import ClipboardCopyIcon from "../icons/Clipboard_Copy_Icon.svelte";
  import copy from "copy-text-to-clipboard";

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
  let failedCount = 0;
  let successCount = 0;
  let actionName = "";

  async function stop() {
    isStop = true;
    runtime.send({
      type: "status",
      status: { msg: "Stop signal sended", code: "stop" },
    });
  }

  async function collectSubs() {
    if (isLoading) {
      return false;
    }
    reset();

    actionName = "Collect Channel";

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
            "All those channels have already been subscribed to! There's no need to subscribe again."
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
      actionName = `${mode ? "" : "un"}subscribe`;

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

          successCount++;
        } else {
          failedCount++;
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
    saveError = false;
    failedCount = 0;
    successCount = 0;
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

    log.info(lastStatusData);

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
    const toastId = toast.loading("Saving...");
    const l = channelsIdsParse(listStr.split(","));
    if (l === undefined) {
      toast.error("Save unsuccessful", {
        id: toastId,
      });
      return;
    }
    channelPaths = l;
    channelPathsWritable.set(l);
    toast.success("Save successful", {
      id: toastId,
    });
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

{#if isRightSiteNow}
  <div class="space-y-2">
    <div class="font-bold">Data</div>
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
          <div class="flex justify-between items-center pb-1">
            <p>
              Example:
              <span class="font-bold">@youtube</span>,
              <span class="font-bold">@google</span>
            </p>
            <span
              class="tooltip tooltip-left"
              data-tip="Copy channel IDs to clipboard"
            >
              <button
                class="btn btn-xs !px-1"
                on:click={() => {
                  const toastID = toast.loading(
                    "Copying channels IDs to clipboard..."
                  );
                  if (channelPathsText === "") {
                    toast.error("Empty channel IDs list", {
                      id: toastID,
                    });
                  } else if (copy(channelPathsText)) {
                    toast.success("Copied!", {
                      id: toastID,
                    });
                  } else {
                    toast.error("Failed copy to clipboard!", {
                      id: toastID,
                    });
                  }
                }}><ClipboardCopyIcon /></button
              ></span
            >
          </div>
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
    <div>
      <div
        transition:slide
        class="font-bold flex items-center justify-between w-full h-6 mb-[2px]"
      >
        <div class="flex items-start gap-1 h-full">
          Status
          {#if isLoading || !ready || isSubLoading}
            <div
              transition:blur
              class="tooltip tooltip-info"
              data-tip={isStop ? "Please wait..." : "Click to Stop now"}
            >
              <button
                disabled={isStop}
                class="btn btn-xs flex normal-case"
                on:click={stop}
              >
                <span class="loading loading-infinity" />
                <span class="animate-pulse">
                  {#if isStop}
                    <div transition:slide>Stopping...</div>
                  {:else}
                    <div transition:slide>Stop</div>
                  {/if}
                </span>
              </button>
            </div>
          {/if}
        </div>
        {#if failedCount !== 0 || successCount !== 0}
          <div
            transition:slide
            class="text-base-content/70 font-normal flex gap-1"
          >
            <div class="flex gap-1 h-full">
              Failed :
              <div transition:slide class="text-error/80">{failedCount}</div>
            </div>
            <div class="flex gap-1 h-full">
              Success :
              <div transition:slide class="text-success/80">
                {successCount}
              </div>
            </div>
          </div>
        {/if}
      </div>
      <div
        class="border-blue-500/50 border-2 w-full py-2 px-2 rounded-md text-xs tracking-wider"
      >
        {#if status.msg}
          <div class={status.isError ? "text-red-500" : undefined}>
            {status.msg}
          </div>
        {:else if !ready && !isSubLoading}
          <div transition:slide class="animate-bounce">
            Waiting for the content scripts ready signal ...
          </div>
        {/if}
      </div>
    </div>
    <div class="w-[17rem] space-y-2">
      <div class="capitalize flex justify-between">
        <div class="font-bold">Actions</div>
        {#if actionName !== ""}
          <div transition:blur class="text-base-content/70 font-semibold">
            {#if !(isLoading || !ready || isSubLoading)}
              <span transition:blur>Last run:</span>
            {/if}
            <span> {actionName}</span>
          </div>
        {/if}
      </div>
      <button
        disabled={!isRightSiteNow || !ready || isSubLoading || isLoading}
        class="btn btn-success w-full rounded-full"
        on:click={collectSubs}>Collect channel</button
      >
      <button
        disabled={(channelPathsCount ? false : true) ||
          isSubLoading ||
          !ready ||
          isLoading}
        class="w-full btn btn-ghost dark:bg-slate-100 bg-slate-800 dark:text-slate-900 text-slate-300 rounded-full hover:bg-slate-600 tsd"
        on:click={() => subUnSub(true)}>Subscribe</button
      >
      <button
        disabled={(channelPathsCount ? false : true) ||
          isSubLoading ||
          !ready ||
          isLoading}
        class="w-full btn btn-ghost dark:bg-slate-700/80 bg-slate-200/80 dark:text-slate-300/80 rounded-full hover:bg-slate-500/80 tsd"
        on:click={() => subUnSub(false)}>Unsubscribe</button
      >
    </div>
  </div>
{:else}
  <div
    class="text-justify space-y-2 justify-center flex flex-col items-center w-full h-36"
  >
    <a
      class="btn btn-success"
      target="_blank"
      rel="noreferrer"
      href={STORIES_URL[0]}
    >
      <ExternalLinkIcon />
      Open Youtube</a
    >
    <div>
      This page is not a YouTube page. Click the button above to open
      YouTube.com in a new tab. Then reopen this extension for options.
    </div>
  </div>
{/if}
