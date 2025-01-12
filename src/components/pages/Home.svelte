<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { STORIES_URL } from "src/utils/constants";
  import { delay, isRightSite } from "src/utils/helper";
  import { runtime, type RuntimeMessage } from "src/utils/communication";
  import { channelIDsWritable as channelIDs, closeTutorialWritable, xpathsWritable } from "src/utils/storage";
  import { blur, slide } from "svelte/transition";
  import log from "src/utils/logger";
  import { toast } from "svelte-sonner";
  import copy from "copy-text-to-clipboard";
  import Timer from "../Timer.svelte";
  import ZipReader from "../data/Zip_Reader.svelte";
  import DocsLink from "../Docs_Link.svelte";
  import { docs } from "src/utils/docs";
  import { CopyIcon, ExternalLinkIcon } from "lucide-svelte";
  import { channelIDsSchema } from "src/utils/schema";
  import Done from "../Done.svelte";
  import Tutorial from "../Tutorial.svelte";

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
  let lastChannelIDsTotal = 0;
  let failedCount = 0;
  let successCount = 0;
  let actionName = "";

  async function stopFun() {
    isStop = true;
    await runtime.send({
      to: "content",
      status: { msg: "Stop signal sent", code: "stop" }
    });
  }

  async function collectSubs() {
    if (isRunning) {
      return false;
    }
    reset();

    actionName = "Collect Channel";

    const isRequestSent = await runtime.send({
      to: "content",
      status: { msg: "Collecting channel ids", code: "collecting" }
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
    const currentSubs: string[] = $channelIDs;
    if (!(await collectAndWait())) {
      return;
    }

    if ($channelIDs !== currentSubs) {
      let notFoundList: string[];
      if (mode) {
        notFoundList = currentSubs.filter(
          (elem) => !$channelIDs.includes(elem.toLowerCase())
        );

        if (notFoundList.length === 0) {
          setStatus(
            "All those channels have already been subscribed to! There is no need to subscribe again."
          );
        }
      } else {
        notFoundList = currentSubs.filter((elem) =>
          $channelIDs.includes(elem.toLowerCase())
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

      if ($channelIDs.length === 0) {
        return;
      }

      isRunning = true;
      isSubRunning = true;

      const len = $channelIDs.length;
      lastChannelIDsTotal = len;
      const copyList = Object.assign([], $channelIDs);

      setStatus(`Starting to ${un}subscribe to the channels`);
      for (let indexMain = 0; indexMain < len; indexMain++) {
        // Sending webpage change action
        if(mode){
          ready = false;
        }
        if (mode &&
          !(await runtime.send({
            to: "content",
            status: { code: "changeChannelID", channelID: copyList[indexMain] }
          }))
        ) {
          setStatus("Unable to send messages to the client script", true);
          return;
        }

        if (mode &&
          (isStop ||
            (await waitingForResponseReady(
              `Waiting for the ready signal: ` + copyList[indexMain]
            )))
        ) {
          return;
        }
        // ------------------------------------

        // Sending subscribe, unsubscribe action
        ready = false;
        if (
          !(await runtime.send({
            to: "content",
            status: {
              channelID: (copyList[indexMain] as String).toLowerCase(),
              code: mode ? "subscribe" : "unsubscribe"
            }
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
          const parsedChannelIDs = await channelIDsSchema.parseAsync(l);
          channelIDs.set(parsedChannelIDs);

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

  async function parseData({ status, to }: RuntimeMessage) {
    if (to !== "option") {
      return;
    }

    setStatus("...");

    log.info(status);

    setStatus("msg" in status ? status.msg : status.code);

    lastStatusData = { status, to };

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
      case "channelIDs":
        setStatus("Channel IDs collected. Now saving...");
        saveChannelsIds(status.channelIDs);
        isRunning = false;
        setStatus("Channel IDs collected successfully.");
        return;
      case "langError":
        await stopFun();
        setStatus(status.msg, true);
        return;
      default:
        return;
    }
  }

  function channelsIdsString(listStr: string[]) {
    channelPathsText = listStr.join(", ");
    channelPathsCount = listStr.length;
  }

  function saveChannelsIds(list: string[]) {
    channelsIdsString(list);
    channelIDs.set(list);
  }

  function channelsIdsParse(listStr: string[]) {
    channelsIdsString(listStr);
    return listStr;
  }

  function channelsIdsStringSave(listStr: string = channelPathsText) {
    const toastId = toast.loading("Saving...");
    const l = channelsIdsParse(listStr.split(",").map(value => value.trim().toLowerCase()));
    if (l === undefined) {
      toast.error("Save unsuccessful", {
        id: toastId
      });
      return;
    }
    channelIDs.set(l);
    toast.success("Save successful", {
      id: toastId
    });
  }

  function channelsIdsTakeoutSave(cIds: string[]) {
    const toastId = toast.loading("Saving...");
    const l = channelsIdsParse(cIds);
    if (l === undefined) {
      toast.error("Save unsuccessful", {
        id: toastId
      });
      return;
    }
    channelIDs.set(l);
    toast.success("Save successful", {
      id: toastId
    });
  }

  async function readySignalSend() {
    // Ready signal
    await runtime.send({
      to: "content",
      status: {
        msg: "Is the content script ready?",
        code: "ready"
      }
    });
  }

  async function xpathSignalSend() {
    if (!$xpathsWritable) {
      setStatus(
        "Unable to send xPathValue signal to the content script...",
        true
      );
      return;
    }
    await runtime.send({
      to: "content",
      status: {
        code: "xpathValues",
        xpathValues: $xpathsWritable
      }
    });
  }

  onMount(async () => {
    storageRemoveListener = runtime.addListener(parseData);

    isRightSiteNow = await isRightSite();
    if (isRightSiteNow) {
      await readySignalSend();
    }

    channelsIdsParse($channelIDs);
  });

  onDestroy(() => {
    storageRemoveListener();
  });
</script>

{#if status.msg === "Done" && successCount / lastChannelIDsTotal >= 0.6}
  <Done />
{/if}

{#if !$closeTutorialWritable}
  <Tutorial />
{/if}

{#if isRightSiteNow}
  <div class="space-y-2 relative">
    <div class="font-bold flex gap-1 items-center text-sm">
      Data
      <DocsLink href={docs.dataSection} />
    </div>
    <div
      class="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box"
    >
      <input type="checkbox" class="peer !min-h-8" />
      <div
        class="!min-h-8 !py-0 after:!top-4 gap-1 flex items-center collapse-title text-sm tracking-wider font-sans"
      >
        Subscriptions:
        {#key channelPathsCount}
          <span in:blur>{channelPathsCount}</span>
        {/key}
      </div>
      <div class="collapse-content">
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
                class="btn btn-xs"
                on:click={() => {
                  const toastID = toast.loading(
                    "Copying channels IDs to clipboard...",
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
                }}><CopyIcon class="h-3 w-3" /></button
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
            required></textarea>
          {#if saveError}
            <div class="alert alert-error shadow-lg mb-4">
              <span>Make sure your input channels start with @</span>
            </div>
          {/if}
          <button disabled={!ready || isSubRunning} class="btn w-full"
          >Save
          </button
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
        <div class="flex items-start gap-1 h-full text-sm">
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
                on:click={stopFun}
              >
                <span class="loading loading-infinity"></span>
                <span class="animate-pulse label-text">
                  {#if isStop}
                    <div transition:slide>Wait</div>
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
            class="text-base-content/70 font-normal flex gap-1 text-xs"
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
        style={`background-repeat: no-repeat; background-size: ${lastChannelIDsTotal !== 0 ? ((successCount + failedCount) / lastChannelIDsTotal) * 100 : 0}%`}
        class="border-blue-500/50 border-2 w-full py-2 px-2 rounded-md text-xs tracking-wider progress-bar"
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
        <div class="font-bold flex items-center gap-1 text-sm">
          Actions
          <DocsLink href={docs.action} />
        </div>
        {#if actionName !== ""}
          <div
            transition:blur
            class="font-normal text-base-content/70 flex gap-1 text-xs"
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
        on:click={collectSubs}>Collect channel
      </button
      >
      <button
        disabled={(!channelPathsCount) ||
          isSubRunning ||
          !ready ||
          isRunning}
        class="subscribe-btn"
        on:click={() => subUnSub(true)}>Subscribe
      </button
      >
      <button
        disabled={(!channelPathsCount) ||
          isSubRunning ||
          !ready ||
          isRunning}
        class="unsubscribe-btn"
        on:click={() => subUnSub(false)}>Unsubscribe
      </button
      >
    </div>
  </div>
{:else}
  <div
    class="text-justify space-y-2 justify-center flex flex-col items-center w-full h-36"
  >
    <a
      title="Click to open YouTube.com in a new tab"
      class="btn btn-success"
      target="_blank"
      rel="noreferrer"
      href={STORIES_URL[0]}
      on:click={()=>window.close()}
    >
      <ExternalLinkIcon />
      Open Youtube</a
    >
    <span class="text-xs">
      This page is not a YouTube page. Click the button above to open
      YouTube.com in a new tab. Then reopen this extension for options.
    </span>
  </div>
{/if}
