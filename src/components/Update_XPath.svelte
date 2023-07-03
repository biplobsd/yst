<script lang="ts">
  import { xPathValuesWritable } from "src/utils/storage";
  import { fetchXPathUpdate } from "../utils/helper";
  import { onMount } from "svelte";
  import { slide } from "svelte/transition";
  import { get } from "svelte/store";
  import toast from "svelte-french-toast";

  let isXPathUpdating = false;

  async function xpathUpdateHandler() {
    isXPathUpdating = true;
    await fetchXPathUpdate();
    isXPathUpdating = false;
  }

  onMount(async () => {
    const storedXPathValues = get(xPathValuesWritable);

    if (!storedXPathValues.REMOTE_DISABLE) {
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
