<script lang="ts">
  import { onMount } from "svelte";
  import { slide } from "svelte/transition";
  import { fetchXPathUpdate } from "src/popup/helper";
  import { xpathsWritable } from "src/utils/storage";
  import { delay } from "src/utils/helper";

  let isXPathUpdating = $state(false);

  async function xpathUpdateHandler() {
    isXPathUpdating = true;
    await fetchXPathUpdate();
    isXPathUpdating = false;
  }

  onMount(async () => {
    await delay(1000);
    if (!$xpathsWritable.REMOTE_DISABLE) {
      await xpathUpdateHandler();
    }
  });
</script>

{#if isXPathUpdating}
  <div
    transition:slide
    class="h-fit py-1 w-full flex justify-center items-center gap-1"
  >
    <span class="loading loading-ring h-full"></span>
    <span class="animate-pulse">Updating xpath</span>
  </div>
{/if}
