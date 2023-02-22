<script lang="ts">
  import { delay } from "src/content";
  import "src/content/styles.css";
  import { storage } from "src/storage";
  import { REACTS_ARIA_LABELS } from "src/utils/constants";
  import { onDestroy, onMount } from "svelte";
  import Footer from "./Footer.svelte";

  let countdown = 5;
  let isNotrunning = true;
  let countDowning = false;
  let breakRunning = false;
  let xPosition = 16;
  let yPosition = 16;
  const offsetX = 15;
  const offsetY = 10;
  let isMoving = false;
  let isWindowOpen = false;
  let closeIsloading = false;
  let reactAmount = 1;
  let storageRemoveListener: () => void;

  const getTooltipPosition = ({ clientX, clientY }: MouseEvent) => {
    xPosition = clientX;
    yPosition = clientY;
  };

  const addListener = () => {
    if (!isMoving) {
      isMoving = true;
      window.addEventListener("mousemove", getTooltipPosition);
    }
  };

  const removeListener = () => {
    window.removeEventListener("mousemove", getTooltipPosition);
    isMoving = false;
  };

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

  function closeHandeler() {
    if (closeIsloading) {
      return;
    }
    closeIsloading = true;
    storage.set({ isWindowOpen: false });
    closeIsloading = false;
  }

  onMount(() => {
    storageRemoveListener = storage.addListener((change) => {
      isWindowOpen = change.isWindowOpen;
    });
  });

  onDestroy(storageRemoveListener);
</script>

{#if isWindowOpen}
  <div
    class="fixed w-96 h-fit bg-transparent backdrop-blur ring-2 rounded-md"
    style="left: {xPosition - offsetX}px; top: {yPosition - offsetY}px;"
  >
    <div class="flex justify-between">
      <span class="tooltip tooltip-right" data-tip="Move window">
        <button
          on:mousedown={addListener}
          on:mouseup={removeListener}
          class="btn btn-ghost btn-circle text-slate-100/50 ml-1 "
        >
          {#if isMoving}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-5 h-5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25"
              />
            </svg>
          {:else}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-5 h-5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
              />
            </svg>
          {/if}
        </button>
      </span>
      <span class="tooltip tooltip-left" data-tip="Close">
        <button
          on:click={closeHandeler}
          class="{closeIsloading
            ? 'loading'
            : ''} btn btn-ghost btn-circle text-slate-100/50 ml-1"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-6 h-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </span>
    </div>
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
      <Footer />
    </div>
  </div>
{/if}
