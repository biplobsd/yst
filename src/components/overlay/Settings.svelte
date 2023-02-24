<script lang="ts">
  import { delay } from "src/content";
  import "src/content/styles.css";
  import { DEFAULT_STATUS_MSG, REACTS_ARIA_LABELS } from "src/utils/constants";
  import { isStorySite, isXPathExpressionExists } from "src/utils/helper";
  import {
    STORY_ARRAW,
    STORY_LIST,
    STORY_LOAD,
    STORY_REACTIONS,
    STORY_TO_OPEN,
  } from "src/utils/xpaths";

  let countdown = 5;
  let isNotrunning = true;
  let countDowning = false;
  let breakRunning = false;
  let reactAmount = 1;
  let statusMsg = DEFAULT_STATUS_MSG;

  function setStatusMsg(msg = DEFAULT_STATUS_MSG) {
    statusMsg = msg;
  }

  async function setStatusMsgAsync(
    msg = DEFAULT_STATUS_MSG,
    delayMs: number = 500
  ) {
    statusMsg = msg;
    await delay(delayMs);
  }

  async function isStoryLoaded() {
    for (let index = 1; index <= 10; index++) {
      await setStatusMsgAsync(`Waiting for story load... T-${index}`, 500);
      if (
        !isXPathExpressionExists(STORY_LOAD) &&
        isXPathExpressionExists(STORY_REACTIONS) &&
        isXPathExpressionExists(STORY_ARRAW)
      ) {
        return true;
      }
    }
    return false;
  }

  async function isCardOpen() {
    await setStatusMsgAsync("Checking... is story open.");

    if (isXPathExpressionExists(STORY_TO_OPEN)) {
      await setStatusMsgAsync("Story is not open.");
      await setStatusMsgAsync("Checking... is any story card in this page.");
      const storieElements = document.evaluate(
        STORY_LIST,
        document,
        null,
        XPathResult.ANY_TYPE,
        null
      );

      const firstStoryCardElement = storieElements.iterateNext();
      if (firstStoryCardElement instanceof HTMLElement) {
        await setStatusMsgAsync("Click... first story");
        firstStoryCardElement.click();
        await setStatusMsgAsync("Waiting for stories card open...", 1000 * 2);
        await setStatusMsgAsync("Checking... is story open.");
        if (isXPathExpressionExists(STORY_TO_OPEN)) {
          await setStatusMsgAsync("Error story not opening...");
          breakRunning = true;
          await setStatusMsgAsync("Stopping ...");
        }
      }
    }
  }

  async function runCound() {
    if (!isNotrunning || countDowning) {
      console.log("Already running...");
      return;
    }

    countdown = 5;
    countDowning = true;
    for (countdown; countdown > 0; countdown--) {
      setStatusMsg(`Start in ${countdown}s`);
      await delay(1000);
    }
    countDowning = false;

    try {
      isNotrunning = false;
      await isCardOpen();
      await addReactLoop();
    } finally {
      countdown = 5;
      isNotrunning = true;
      breakRunning = false;
      setStatusMsg();
    }
  }

  function getLeftRight() {
    setStatusMsg("Searching left & right arrows...");
    const arraw = document.evaluate(
      STORY_ARRAW,
      document,
      null,
      XPathResult.ANY_TYPE,
      null
    );
    const nodeLeft = arraw.iterateNext();
    const nodeRight = arraw.iterateNext();
    if (nodeLeft instanceof HTMLElement && nodeRight instanceof HTMLElement) {
      return { right: nodeRight, left: nodeLeft };
    } else {
      return undefined;
    }
  }

  function reactNode(ariaLabel: string) {
    setStatusMsg(`Searching ${ariaLabel} react buttons...`);
    const dom = document.evaluate(
      `//div[@aria-label="${ariaLabel}"]`,
      document,
      null,
      XPathResult.ANY_TYPE,
      null
    );
    const reactNode = dom.iterateNext();
    if (reactNode instanceof HTMLElement) {
      return reactNode;
    }
    return undefined;
  }

  function getAllReact() {
    setStatusMsg("Searching react buttons...");
    const listReacts: HTMLElement[] = [];
    for (let ariaLabel of REACTS_ARIA_LABELS) {
      const reactEle = reactNode(ariaLabel);
      if (reactEle) {
        listReacts.push(reactEle);
      }
    }
    return listReacts;
  }

  async function addReactLoop() {
    let node = getLeftRight();
    while (true) {
      if (!(await isStorySite(false))) {
        await setStatusMsgAsync(
          "Error page url changed... Stoping...",
          1000 * 2
        );
        break;
      }

      if (!(await isStoryLoaded())) {
        await setStatusMsgAsync(
          "Error story not opened... Stoping...",
          1000 * 2
        );
        break;
      }
      const reactNodes = getAllReact();
      if (reactNodes.length > 0) {
        await setStatusMsgAsync("Clicking react buttons...");
        for (let index = 1; index <= reactAmount; index++) {
          await setStatusMsgAsync(`Clicking react buttons... ${index}x`, 100);
          reactNodes[0].click();
        }
      }

      await setStatusMsgAsync(`Next stories >>>`);
      // await delay(1000 * 3);
      node = getLeftRight();
      if (node && !breakRunning) {
        await setStatusMsgAsync(`Next stories >>> right arrow...`);
        node.right.click();
      } else {
        break;
      }
    }
  }
</script>

<div class="mx-5 my-2">
  <div class="text-slate-200 text-xl">Options</div>
  <div class="divider my-1" />
  <div class="text-slate-200 tracking-wider flex items-center">
    <span>React amount: {reactAmount + "x"}</span>
    <div class="mx-2 space-x-1">
      <button
        disabled={!isNotrunning || countDowning}
        on:click={() => {
          reactAmount++;
        }}
        class="btn btn-circle btn-sm">+</button
      ><button
        disabled={!isNotrunning || countDowning}
        on:click={() => {
          if (reactAmount > 0) reactAmount--;
        }}
        class="btn btn-circle btn-sm ">-</button
      >
    </div>
  </div>
  <div class="divider mt-5" />
  <div class="alert shadow-lg bg-slate-700/25">
    <div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        class="stroke-info flex-shrink-0 w-6 h-6"
        ><path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        /></svg
      >
      <span class="text-slate-100/70"
        >After clicking the start button, please point your mouse to the any
        reaction icon (👍💖😀😲🥲😒)</span
      >
    </div>
  </div>
  <div class="text-xs font-semibold text-slate-100/50 tracking-wider mt-4">
    Status
  </div>
  <div
    class="h-9 w-full rounded-xl ring-1 ring-slate-200/10 my-2 mb-4 flex justify-center items-center"
  >
    <p class="text-slate-200/50 text-center">{statusMsg}</p>
  </div>
  {#if !breakRunning && isNotrunning}
    <button class="btn w-full" disabled={countDowning} on:click={runCound}
      >Start</button
    >
  {:else}
    <button
      disabled={breakRunning}
      class="btn w-full"
      on:click={() => {
        breakRunning = true;
        setStatusMsg("Stopping ...");
      }}>Stop</button
    >
  {/if}
</div>
