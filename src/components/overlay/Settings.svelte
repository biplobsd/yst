<script lang="ts">
  import { delay } from "src/content";
  import "src/content/styles.css";
  import { DEFAULT_STATUS_MSG, REACTS_ARIA_LABELS } from "src/utils/constants";

  let countdown = 5;
  let isNotrunning = true;
  let countDowning = false;
  let breakRunning = false;
  let reactAmount = 1;
  let statusMsg = DEFAULT_STATUS_MSG;

  function setStatusMsg(msg = DEFAULT_STATUS_MSG) {
    statusMsg = msg;
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

      await addReact();
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
      '//div[@style="height: 100%; width: 50%;"]/div',
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
    const listReacts = [];
    for (let ariaLabel of REACTS_ARIA_LABELS) {
      console.log(ariaLabel);
      const reactEle = reactNode(ariaLabel);
      if (reactEle) {
        listReacts.push(reactEle);
      }
    }
    return listReacts;
  }

  async function addReact() {
    let node = getLeftRight();
    while (true) {
      const l = getAllReact();
      if (l.length > 0) {
        setStatusMsg("Clicking react buttons...");
        for (let ll of l) {
          for (let index = 1; index <= reactAmount; index++) {
            setStatusMsg(`Clicking react buttons... ${index}x`);
            ll.click();
            await delay(150);
          }
        }
      }

      setStatusMsg(`Next stories >>>`);
      await delay(1000 * 3);
      node = getLeftRight();
      if (node && !breakRunning) {
        setStatusMsg(`Next stories >>> right arrow...`);
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
        >After start button click then point your mouse to react icon.</span
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
