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
  import { channelPathsWritable, xPathValuesWritable } from "src/utils/storage";
  import { get } from "svelte/store";
  import { blur, slide } from "svelte/transition";
  import log from "src/utils/logger";
  import ExternalLinkIcon from "../icons/External_Link_Icon.svelte";
  import toast from "svelte-french-toast";
  import ClipboardCopyIcon from "../icons/Clipboard_Copy_Icon.svelte";
  import copy from "copy-text-to-clipboard";
  import Timer from "../Timer.svelte";
  import { channelPathsSchema } from "src/utils/schema";
  import ZipReader from "../data/Zip_Reader.svelte";

  let channelPaths: string[] = [];
  let xpathValues: XPathModel | undefined = undefined;
  let lastStatusData: RuntimeMessage | undefined = undefined;

  let isRunning = true;
  let ready = false;
  let isRightSiteNow = false;
  let status: { isError: boolean; msg?: string } = { isError: false };
  let storageRemoveListener: () => void;
  let channelPathsText = "";
  let saveError = false;
  let isStop = false;
  let isSubRunning = false;
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
    if (isRunning) {
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
      if (!isRunning) {
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
          (elem) => !channelPaths.includes(elem.toLowerCase())
        );

        if (notFoundList.length === 0) {
          setStatus(
            "All those channels have already been subscribed to! There's no need to subscribe again."
          );
        }
      } else {
        notFoundList = currentSubs.filter((elem) =>
          channelPaths.includes(elem.toLowerCase())
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

  async function waitingForResponse(msg: string, sec: number, ms: number) {
    let timeoutSub = true;
    ready = false;
    for (let index = sec; index >= 0; index--) {
      setStatus(msg + " T-" + index);
      if (ready) {
        timeoutSub = false;
        break;
      }
      if (isStop) {
        return true;
      }
      await delay(ms);
    }

    return timeoutSub;
  }

  async function waitingForResponseReady(msg: string, sec = 10, ms = 1000) {
    if (await waitingForResponse(msg, sec, ms)) {
      return false;
    }

    if (!ready) {
      await readySignalSend();
    } else {
      return false;
    }

    if (await waitingForResponse("[Retry wait] " + msg, sec, ms)) {
      return false;
    }

    setStatus("Error: Content script did not responding", true);

    return true;
  }

  async function subUnSub(mode = true) {
    const un = !mode && "un";
    if (isRunning) {
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

      isRunning = true;
      isSubRunning = true;

      const len = channelPaths.length;
      const copyList = Object.assign([], channelPaths);

      setStatus(`Starting to ${un}subscribe to the channels`);
      for (let indexMain = 0; indexMain < len; indexMain++) {
        // Sending webpage change action
        if (
          !(await runtime.send({
            type: "statusContent",
            status: { msg: copyList[indexMain], code: "changePage" },
          }))
        ) {
          setStatus("Unable to send messages to the client script", true);
          return;
        }

        if (
          isStop ||
          (await waitingForResponseReady(
            `Waiting for the ready signal: ` + copyList[indexMain]
          ))
        ) {
          return;
        }
        // ------------------------------------

        // Sending subscribe, unsubscribe action
        if (
          !(await runtime.send({
            type: "statusContent",
            status: {
              msg: copyList[indexMain],
              code: mode ? "subscribe" : "unsubscribe",
            },
          }))
        ) {
          setStatus("Unable to send messages to the client script", true);
          return;
        }
        if (
          isStop ||
          (await waitingForResponseReady(
            `Waiting for the ${un}subscribe signal: ` + copyList[indexMain]
          ))
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
    } catch (error) {
      setStatus("Error: " + error, true);
      return;
    } finally {
      isSubRunning = false;
      isRunning = false;
      // channelsIdsStringSave();
    }
  }

  function setStatus(msg: string, isError = false) {
    status = { isError, msg };
  }

  function reset() {
    isRunning = false;
    isStop = false;
    isSubRunning = false;
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
          isRunning = true;
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
          isRunning = false;
          return;
        case "error":
          setStatus(status.msg, true);
          isRunning = false;
          ready = true;
          return;
        default:
          return;
      }
    } else if (dataLocal.type === "dataOption") {
      setStatus("Channel IDs collected. Now saving...");
      saveChannelsIds(dataLocal.channelPaths);
      isRunning = false;
      setStatus("Channel IDs collected successfully.");
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
      const iTrim = i.trim().toLowerCase();
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

  function channelsIdsTakeoutSave(channelIDs: string[]) {
    const toastId = toast.loading("Saving...");
    const l = channelsIdsParse(channelIDs);
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
      <input type="checkbox" class="peer !min-h-8 !py-0" />
      <div
        class="!min-h-8 !py-0 gap-1 flex items-center collapse-title text-sm tracking-wider font-sans"
      >
        Subscriptions:
        {#key channelPathsCount}
          <span in:blur>{channelPathsCount}</span>
        {/key}
      </div>
      <div class="collapse-content peer-checked:py-2">
        <span class="text-xs space-y-2">
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
          <button disabled={!ready || isSubRunning} class="btn w-full"
            >Save</button
          >
        </form>
        <ZipReader {channelsIdsTakeoutSave} />
      </div>
    </div>
    <div>
      <div
        transition:slide
        class="font-bold flex items-center justify-between w-full h-6 mb-[2px]"
      >
        <div class="flex items-start gap-1 h-full">
          Status
          {#if isRunning || !ready || isSubRunning}
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
              {#key failedCount}
                <div in:blur class="text-error/80">{failedCount}</div>
              {/key}
            </div>
            <div class="flex gap-1 h-full">
              Success :
              {#key successCount}
                <div in:blur class="text-success/80">
                  {successCount}
                </div>
              {/key}
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
        {:else if !ready && !isSubRunning}
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
          <div
            transition:blur
            class="font-normal text-base-content/70 flex gap-1"
          >
            {#if !(isRunning || !ready || isSubRunning)}
              <span transition:blur>Last run:</span>
            {/if}
            <Timer bind:isRunning={isSubRunning} />
            <div>{actionName}</div>
          </div>
        {/if}
      </div>
      <button
        disabled={!isRightSiteNow || !ready || isSubRunning || isRunning}
        class="collect-channel-btn"
        on:click={collectSubs}>Collect channel</button
      >
      <button
        disabled={(channelPathsCount ? false : true) ||
          isSubRunning ||
          !ready ||
          isRunning}
        class="subscribe-btn"
        on:click={() => subUnSub(true)}>Subscribe</button
      >
      <button
        disabled={(channelPathsCount ? false : true) ||
          isSubRunning ||
          !ready ||
          isRunning}
        class="unsubscribe-btn"
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
