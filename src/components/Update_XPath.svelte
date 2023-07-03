<script lang="ts">
  import { xPathValuesWritable } from "src/utils/storage";
  import { fetchXPathUpdate } from "../utils/helper";
  import { onMount } from "svelte";
  import { slide } from "svelte/transition";
  import { get } from "svelte/store";

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
    class="h-fit py-1 bg-base-300 w-full flex justify-center"
  >
    <div class="btn btn-ghost loading m-0 p-0 text-xs !h-fit !min-h-fit">
      Updating xpath
    </div>
  </div>
{/if}
