<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { blur } from "svelte/transition";

  let {
    steps = [
      "This page is not the YouTube subscriptions page",
      "Click the button above to open it in a new tab",
      "Then reopen this extension for options",
    ],
    stepDuration = 3000,
  }: {
    steps?: string[];
    stepDuration?: number;
  } = $props();

  let currentStep = $state(0);
  let stepInterval: ReturnType<typeof setInterval> | null = null;
  let isPaused = $state(false);

  function startInterval() {
    if (stepInterval) clearInterval(stepInterval);
    stepInterval = setInterval(() => {
      if (!isPaused) {
        currentStep = (currentStep + 1) % steps.length;
      }
    }, stepDuration);
  }

  function stopInterval() {
    if (stepInterval) {
      clearInterval(stepInterval);
      stepInterval = null;
    }
  }

  function handleStepClick(index: number) {
    currentStep = index;
    startInterval();
  }

  function handleMouseEnter() {
    isPaused = true;
  }

  function handleMouseLeave() {
    isPaused = false;
  }

  onMount(() => {
    startInterval();
  });

  onDestroy(() => {
    stopInterval();
  });
</script>

<div class="flex flex-col items-center gap-3 w-full">
  <div
    class="flex gap-2"
    role="group"
    onmouseenter={handleMouseEnter}
    onmouseleave={handleMouseLeave}
  >
    {#each steps as _, index}
      <button
        class="relative w-12 h-12 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-300"
        onclick={() => handleStepClick(index)}
        type="button"
      >
        <svg
          class="absolute inset-0 w-full h-full -rotate-90"
          viewBox="0 0 48 48"
        >
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="text-base-300"
          />
          {#if index === currentStep}
            {#key currentStep}
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="text-success transition-all"
                stroke-linecap="round"
                style="animation-play-state: {isPaused ? 'paused' : 'running'};"
                class:circular-progress={true}
              />
            {/key}
          {/if}
        </svg>
        <span
          class="relative z-10 text-sm font-semibold transition-colors duration-300"
          class:text-success={index === currentStep}
          class:text-base-content={index !== currentStep}
          class:opacity-50={index !== currentStep}
        >
          {index + 1}
        </span>
      </button>
    {/each}
  </div>

  <div
    class="relative h-12 w-full overflow-hidden"
    role="group"
    onmouseenter={handleMouseEnter}
    onmouseleave={handleMouseLeave}
  >
    {#key currentStep}
      <p
        class="text-xs text-base-content/80 text-center absolute w-full"
        in:blur={{ duration: 300 }}
      >
        {steps[currentStep]}
      </p>
    {/key}
  </div>
</div>

<style>

  .circular-progress {
    stroke-dasharray: 125.6;
    animation: circular-progress 3s linear forwards;
  }

  @keyframes circular-progress {
    from {
      stroke-dashoffset: 125.6;
    }
    to {
      stroke-dashoffset: 0;
    }
  }
</style>
