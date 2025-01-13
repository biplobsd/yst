<script lang="ts">
  import { slide } from "svelte/transition";
  import { X } from "lucide-svelte";
  import { closeTutorialWritable } from "src/utils/storage";
  import TutorialCard from "./Tutorial_Card.svelte";

  interface Props {
    forceOpen?: boolean;
  }

  let { forceOpen = false }: Props = $props();
  let closingProgress = $state(0);

  const interval = setInterval(() => {
    closingProgress += 20;
    if (closingProgress >= 100) {
      clearInterval(interval);
    }
  }, 1000);
</script>

{#if closingProgress !== 100 || forceOpen}
  <div class="flex justify-center py-1">
    <div transition:slide class="indicator w-[16.5rem]">
      {#if !forceOpen}
      <button
        onclick={() => closeTutorialWritable.set(true)}
        class="indicator-item btn btn-circle btn-xs"
      >
        <X class=" w-4 h-4 " />
      </button>
      {/if}
      <TutorialCard bind:closingProgress />
    </div>
  </div>
{/if}
