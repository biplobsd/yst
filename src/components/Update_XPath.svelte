<script lang="ts">
  import { xPathValuesWritable, modeWritable } from "src/utils/storage";
  import { onMount } from "svelte";
  import { slide } from "svelte/transition";
  import { get } from "svelte/store";
  import { fetchXPathUpdate } from "src/popup/helper";

  let isXPathUpdating = false;

  async function xpathUpdateHandler() {
    isXPathUpdating = true;
    await fetchXPathUpdate();
    isXPathUpdating = false;
  }

  onMount(async () => {
    const mode = get(modeWritable);
    const storedXPathValues = get(xPathValuesWritable);

    if (mode === "xpath" && !storedXPathValues.REMOTE_DISABLE) {
      await xpathUpdateHandler();
    }
  });
</script>

{#if isXPathUpdating}
  <div
    transition:slide
    class="h-fit py-1 w-full flex justify-center items-center gap-1"
  >
    <span class="loading loading-ring h-full" />
    <span class="animate-pulse">Updating xpath</span>
  </div>
{/if}
