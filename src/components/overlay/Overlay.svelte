<script lang="ts">
  import { storage } from "src/storage";
  import { APP_NAME, VERSION } from "src/utils/constants";
  import { onDestroy, onMount } from "svelte";
  import Footer from "../Footer.svelte";
  import Settings from "./Settings.svelte";

  let xPosition = 16;
  let yPosition = 16;
  const offsetX = 15;
  const offsetY = 10;
  let isMoving = false;
  let isWindowOpen = false;
  let closeIsloading = false;
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

  onDestroy(() => {
    storage.set({ isWindowOpen: false });
    storageRemoveListener();
  });
</script>

{#if isWindowOpen}
  <div
    class="fixed w-96 h-fit bg-transparent backdrop-blur-md ring-2 rounded-md transition-colors duration-500  ease-in-out"
    style="left: {xPosition - offsetX}px; top: {yPosition - offsetY}px;"
  >
    <div class="flex justify-between items-center">
      <div class="flex items-center">
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
        <span class="text-slate-100/70">
          <span class="tracking-wider font-semibold text-sm">
            {APP_NAME}
          </span>
          <span class="text-xs">{VERSION}</span>
        </span>
      </div>
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
    <Settings />
    <Footer />
  </div>
{/if}
