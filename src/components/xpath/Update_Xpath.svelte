<script lang="ts">
  import { onMount } from "svelte";
  import type { XPathModel } from "src/utils/xpaths";
  import { type IStorage, storage } from "src/storage";
  import { addDate, fetchXPathUpdate } from "src/utils/helper";
  let xpathValuesString: string = "";
  let isLoading = false;
  let isError = false;

  async function saveXPathHandler() {
    const xpathValues = addDate(JSON.parse(xpathValuesString) as XPathModel);
    await storage.update({
      context: {
        data: { xpathValues },
      },
    });
    updateXpathValueString(xpathValues);
  }

  function updateXpathValueString(xpathValues: XPathModel) {
    xpathValuesString = JSON.stringify(xpathValues, null, 2);
  }

  async function fetchXPathUpdateHandler() {
    isLoading = true;
    isError = false;
    const res = await fetchXPathUpdate();
    if (res) {
      updateXpathValueString(res);
    } else {
      isError = true;
    }
    isLoading = false;
  }

  onMount(async () => {
    const iStorage: IStorage = await storage.get();
    const xpathValues = iStorage.context.data.xpathValues;

    updateXpathValueString(xpathValues);
  });
</script>

<div class="space-y-2">
  {#if isError}
    <div class="alert alert-error shadow-lg">
      <div>
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
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>

        <span>Update failed</span>
      </div>
    </div>
  {/if}
  <div class="form-control">
    <div class="label">
      <span class="label-text">All XPath</span>
    </div>
    <textarea
      bind:value={xpathValuesString}
      class="min-h-[18rem] textarea textarea-bordered h-24 text-xs whitespace-nowrap"
      placeholder="As Json"
    />
  </div>
  <button
    disabled={isLoading}
    on:click={saveXPathHandler}
    class={`${isLoading && "loading"} btn w-full`}>Save</button
  >
</div>
<button
  on:click={fetchXPathUpdateHandler}
  disabled={isLoading}
  class={`${isLoading && "loading"} btn w-full`}>Fetch Update</button
>
