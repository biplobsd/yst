<script lang="ts">
  import "src/options/styles.css";
  import { onDestroy, onMount } from "svelte";
  import { APP_NAME, STORIES_URL, VERSION } from "src/utils/constants";
  import Footer from "./Footer.svelte";
  import { delay, isRightSite } from "src/utils/helper";
  import { runtime, storage, type IStorage } from "src/storage";

  export let channelPaths: string[] = [];
  let isLoading = true;
  let ready = false;
  let isStoriesSite = false;
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
      context: {
        actionType: "content",
        data: {
          status: { msg: "Stop", code: "stop" },
        },
      },
    });
  }

  async function collectSubs() {
    if (isLoading) {
      return;
    }
    await runtime.send({
      context: {
        actionType: "status",
        data: {
          status: { msg: "Collecting links", code: "collecting" },
        },
      },
    });
  }

  async function collectAndwait() {
    await collectSubs();
    for (let index = 0; index < 30; index++) {
      await delay(500);
      if (!isLoading) {
        return true;
      }
    }
    setStatus("Unable to get sub list from content client", true);
    return false;
  }

  async function filterUnSubs(mode = true) {
    const currentSubs: string[] = channelPaths;
    if (!(await collectAndwait())) {
      return;
    }
    if (channelPaths !== currentSubs) {
      let notFoundList: string[];
      if (mode) {
        notFoundList = currentSubs.filter(
          (elem) => !channelPaths.includes(elem)
        );
      } else {
        notFoundList = currentSubs.filter((elem) =>
          channelPaths.includes(elem)
        );
      }

      saveChannelsIds(notFoundList);
    }
    return;
  }

  async function subUnSub(mode = true) {
    const un = !mode && "un";
    if (isLoading) {
      return;
    }
    try {
      setStatus("Getting current channels");
      await filterUnSubs(mode);

      isLoading = true;
      isSubLoading = true;

      setStatus(`Staring ${un}subscribe channel`);
      for (let indexMain = 0; indexMain < channelPaths.length; indexMain++) {
        await runtime.send({
          context: {
            actionType: "status",
            data: {
              status: { msg: channelPaths[indexMain], code: "changepage" },
            },
          },
        });

        let timeout = true;
        for (let index = 0; index < 10; index++) {
          setStatus(
            "Wating for ready signal:" + channelPaths[indexMain] + " T-" + index
          );
          if (ready) {
            timeout = false;
            break;
          }
          if (isStop) {
            return;
          }
          await delay(1000);
        }
        if (isStop) {
          return;
        }

        if (timeout) {
          break;
        }

        await runtime.send({
          context: {
            actionType: "status",
            data: {
              status: {
                msg: `${un}subscribe now`,
                code: `${un}subscribe`,
              },
            },
          },
        });

        let timeoutSub = true;
        for (let index = 0; index < 10; index++) {
          setStatus(
            `Wating for ${un}subscribe signal: ` +
              channelPaths[indexMain] +
              " T-" +
              index
          );
          if (ready) {
            timeoutSub = false;
            break;
          }
          if (isStop) {
            return;
          }
          await delay(1000);
        }
        if (isStop) {
          return;
        }

        if (timeoutSub) {
          break;
        }

        const sCList = channelPathsText.split(", ");
        sCList.splice(0, 1);

        const l = channelsIdsParse(sCList);

        await storage.set({
          context: {
            actionType: "save",
            data: {
              channelPaths: l,
            },
          },
        });
      }
    } finally {
      setStatus("Done");
      isSubLoading = false;
      isLoading = false;
      channelsIdsStringSave();
    }
  }

  function setStatus(msg: string, isError = false) {
    status = { isError, msg };
  }

  function parseData(dataLocal: IStorage) {
    setStatus("...");
    if (dataLocal.context.actionType === "status") {
      const msg = dataLocal.context.data.status.msg;
      setStatus(msg);
      switch (dataLocal.context.data.status.code) {
        case "loading":
          isLoading = true;
          return;
        case "collecting":
          isLoading = true;
          return;
        case "stop":
          isLoading = false;
          isStop = false;
          isSubLoading = false;
          return;
        case "ready":
          isLoading = false;
          ready = true;
          return;
        case "changepage":
          isLoading = true;
          ready = false;
          return;
        case "subscribe":
          isLoading = true;
          ready = false;
          return;
        case "unsubscribe":
          isLoading = true;
          ready = false;
          return;
        case "error":
          setStatus(msg, true);
          isLoading = false;
          ready = true;
          return;
        default:
          isLoading = false;
          return;
      }
    } else if (dataLocal.context.actionType === "option") {
      setStatus("Data collect successfully");
      isLoading = false;
      saveChannelsIds(dataLocal.context.data.channelPaths);
    }
  }

  function saveChannelsIds(list?: string[]) {
    channelsIdsString(list);
    channelPaths = list;
    storage.set({
      context: {
        actionType: "save",
        data: {
          channelPaths: list,
        },
      },
    });
  }

  function channelsIdsString(listStr: string[]) {
    channelPathsText = listStr.join(", ");
    channelPathsCount = listStr.length;
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
    channelPaths = l;
    storage.set({
      context: {
        actionType: "save",
        data: {
          channelPaths: l,
        },
      },
    });
  }

  async function readySignalSend() {
    // Ready signal
    await runtime.send({
      context: {
        actionType: "content",
        data: {
          status: {
            msg: "Is content script ready",
            code: "ready",
          },
        },
      },
    });
  }

  onMount(async () => {
    runtime.fromOption = true;
    runtime.selfParseData = parseData;

    isStoriesSite = await isRightSite();
    storageRemoveListener = runtime.addListener(parseData);

    await readySignalSend();

    channelsIdsParse(channelPaths);
  });

  onDestroy(() => {
    storageRemoveListener();
  });
</script>

<div class="w-72 pt-4 px-2 items-center flex flex-col justify-center gap-2">
  <p class="mb-3 tracking-wider font-extrabold text-xl">
    {APP_NAME} <span class="text-xs">{VERSION}</span>
  </p>
  {#if isStoriesSite}
    <div class="mb-4">
      <div class="mb-1"><span class="font-bold">Data</span></div>
      <div
        class="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box"
      >
        <input type="checkbox" class="peer" />
        <div class="collapse-title text-sm bg-success/70 text-white/80">
          Subscriptions: {channelPathsCount}
        </div>
        <div class="collapse-content bg-success/60 peer-checked:py-2">
          <span class="text-xs text-slate-200"
            >Enter only ids. Ids start with <span class="text-red-100 font-bold"
              >@</span
            >
            symbol. Example
            <span class="text-red-200 font-bold">@youtube</span>,
            <span class="text-red-200 font-bold">@google</span></span
          >
          <form
            on:submit={(e) => {
              e.preventDefault();
              saveError = false;
              channelsIdsStringSave();
            }}
          >
            <textarea
              bind:value={channelPathsText}
              class="textarea textarea-accent w-full text-xs"
              placeholder="@google, @youtube"
              required
            />
            {#if saveError}
              <div class="alert alert-error shadow-lg mb-4 ">
                <span>Make sure your input channels is start with @</span>
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
    {#if isStoriesSite}
      {#if status.msg}
        <div class="font-bold flex items-center gap-1 w-[17rem] ">
          Status
          {#if isLoading || !ready || isSubLoading}
            <button class="btn btn-xs" on:click={stop}
              ><div class="btn btn-xs loading pr-1">Stop</div></button
            >
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
          >Wait for content script ready signal...</span
        >
      {/if}

      <div class="w-[17rem] space-y-2">
        <div><span class="font-bold">Actions</span></div>
        <button
          disabled={!isStoriesSite || !ready || isSubLoading}
          class="btn btn-success w-full"
          on:click={collectSubs}
          >{!ready && !isSubLoading
            ? "Not ready yet"
            : "Collect channel"}</button
        >
        <button
          disabled={(channelPathsCount ? false : true) ||
            isSubLoading ||
            !ready}
          class="w-full btn btn-ghost bg-slate-100 text-slate-900 rounded-full hover:rounded-lg hover:bg-slate-100/80 tsd"
          on:click={() => subUnSub(true)}
          >{!ready && !isSubLoading ? "Not ready yet" : "Subscribe"}</button
        >
        <button
          disabled={(channelPathsCount ? false : true) ||
            isSubLoading ||
            !ready}
          class="w-full btn btn-ghost bg-slate-700/80 text-slate-300/80 rounded-full hover:rounded-lg hover:bg-slate-500/80 tsd"
          on:click={() => subUnSub(false)}
          >{!ready && !isSubLoading ? "Not ready yet" : "Unsubscribe"}</button
        >
      </div>
    {/if}
    {#if !isStoriesSite}
      <div>
        This page is not facebook stories page. <a
          class="link link-hover text-blue-500"
          target="_blank"
          rel="noreferrer"
          href={STORIES_URL[0]}>Open stories page</a
        >
      </div>
    {/if}
  </div>
  <Footer />
</div>
