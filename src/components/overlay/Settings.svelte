<script lang="ts">
  import { delay } from "src/content";
  import "src/content/styles.css";
  import { REACTS_ARIA_LABELS } from "src/utils/constants";

  let countdown = 5;
  let isNotrunning = true;
  let countDowning = false;
  let breakRunning = false;
  let reactAmount = 1;

  async function runCound() {
    if (!isNotrunning || countDowning) {
      console.log("Already running...");
      return;
    }

    countdown = 5;
    countDowning = true;
    for (countdown; countdown > 0; countdown--) {
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
    }
  }

  function getLeftRight() {
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
        for (let ll of l) {
          for (let index = 0; index < reactAmount; index++) {
            ll.click();
            await delay(150);
          }
        }
      }
      await delay(1000 * 3);
      node = getLeftRight();
      if (node && !breakRunning) {
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
  <div class="h-9 w-full">
    {#if countDowning}
      <p class="text-red-300 text-center my-2 ">Start in {countdown}</p>
    {/if}
  </div>
  {#if !breakRunning && isNotrunning}
    <button class="btn w-full" disabled={countDowning} on:click={runCound}
      >Start</button
    >
  {:else if breakRunning}
    <span class=" text-yellow-200">Stopping...</span>
  {:else}
    <button class="btn w-full" on:click={() => (breakRunning = true)}
      >Stop</button
    >
  {/if}
</div>
