<script>
  import { slide } from "svelte/transition";
  import { X } from "lucide-svelte";
  import { closeTutorialWritable } from "src/utils/storage";
  import TutorialCard from "./Tutorial_Card.svelte";
  let closingProgress = 0;

  const interval = setInterval(() => {
    closingProgress += 20;
    if (closingProgress >= 100) {
      clearInterval(interval);
    }
  }, 1000);
</script>

{#if closingProgress !== 100}
  <div class="flex justify-center py-1">
    <div transition:slide class="indicator w-[16.5rem]">
      <button
        on:click={() => closeTutorialWritable.set(true)}
        class="indicator-item btn btn-circle btn-xs"
      >
        <X class=" w-4 h-4 " />
      </button>
      <TutorialCard bind:closingProgress />
    </div>
  </div>
{/if}
