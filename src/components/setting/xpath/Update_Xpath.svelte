<script lang="ts">
  import { slide } from "svelte/transition";
  import { onMount } from "svelte";
  import { XPathModelSchema, type XPathModel } from "src/utils/xpaths";
  import { addDate } from "src/utils/helper";
  import {
    promisedParseJSON,
    xPathValuesWritable,
    promisedStringifyJSON,
  } from "src/utils/storage";
  import { get } from "svelte/store";
  import log from "src/utils/logger";
  import toast from "svelte-french-toast";
  import { fetchXPathUpdate } from "src/popup/helper";
  import DocsLink from "src/components/Docs_Link.svelte";
  import { docs } from "src/utils/docs";
  import { RefreshCcwDotIcon } from "lucide-svelte";

  let xpathValuesString: string = "";
  let isLoadingSave = false;
  let isErrorSave = false;

  let isLoadingFetch = false;
  let isErrorFetch = false;

  async function saveXPathHandler() {
    isLoadingSave = true;
    isErrorSave = false;
    isErrorFetch = false;
    try {
      const xPathValueResult = await XPathModelSchema.safeParseAsync(
        await promisedParseJSON(xpathValuesString)
      );
      if (xPathValueResult.success) {
        const xpathValues = addDate(xPathValueResult.data);
        xPathValuesWritable.set(xpathValues);
        await updateXpathValueString(xpathValues);
        toast.success("Save success");
      } else {
        isErrorSave = true;
      }
    } catch (error) {
      log.error(error);
      isErrorSave = true;
      toast.error("Save error");
    } finally {
      isLoadingSave = false;
    }
  }

  async function updateXpathValueString(xpathValues: XPathModel) {
    xpathValuesString = (await promisedStringifyJSON(xpathValues)) as string;
  }

  async function fetchXPathUpdateHandler() {
    isLoadingFetch = true;
    isErrorSave = false;
    isErrorFetch = false;
    const res = await fetchXPathUpdate();
    if (res) {
      await updateXpathValueString(res);
      toast.success("Fetch and save success");
    } else {
      isErrorFetch = true;
      toast.error("Save error");
    }
    isLoadingFetch = false;
  }

  onMount(async () => {
    const storedXPathValues = get(xPathValuesWritable);
    updateXpathValueString(storedXPathValues);
  });
</script>

<div class="space-y-2">
  {#if isErrorFetch || isErrorSave}
    <div
      transition:slide
      class="alert alert-error shadow-lg flex justify-center text-left"
    >
      <RefreshCcwDotIcon class="h-4 w-4" />
      <div>
        {#if isErrorFetch}
          <div transition:slide>Update failed</div>
        {/if}
        {#if isErrorSave}
          <div transition:slide>Invalid XPath values</div>
        {/if}
      </div>
    </div>
  {/if}
  <div class="form-control">
    <div class="label">
      <span class="label-text flex items-center gap-1"
        >All XPath <DocsLink href={docs.updateXPathValue} /></span
      >
    </div>
    <textarea
      bind:value={xpathValuesString}
      class="min-h-[18rem] scrollbar-style textarea textarea-bordered h-24 text-xs whitespace-nowrap"
      placeholder="As Json"
    />
  </div>
  <button
    disabled={isLoadingSave || isLoadingFetch}
    on:click={saveXPathHandler}
    class="btn w-full"
  >
    <span class={isLoadingSave ? "loading loading-ring" : ""} />
    Save</button
  >
</div>
<button
  on:click={fetchXPathUpdateHandler}
  disabled={isLoadingSave || isLoadingFetch}
  class="mt-4 btn-success btn w-full"
>
  <span class={isLoadingSave ? "loading loading-ring" : ""} />
  Fetch Update</button
>
