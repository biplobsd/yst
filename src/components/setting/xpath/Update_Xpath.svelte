<script lang="ts">
  import { slide } from "svelte/transition";
  import {
    addDate,
    promisedParseJSON,
    promisedStringifyJSON,
  } from "src/utils/helper";
  import log from "src/utils/logger";
  import toast from "svelte-french-toast";
  import { XPathModelSchema, type XPathModel } from "src/utils/xpaths";
  import { xpathsWritable } from "src/utils/storage";
  import { fetchXPathUpdate } from "src/background/helper";
  import { onMount } from "svelte";
  import { RefreshCcwDotIcon } from "lucide-svelte";
  import DocsLink from "src/components/Docs_Link.svelte";
  import { docs } from "src/utils/docs";
  import ExternalLink from "src/components/External_Link.svelte";
  let isLoadingSave = false;
  let isErrorSave = false;

  let isLoadingFetch = false;
  let isErrorFetch = false;

  let userInput = "";

  async function update(xPaths: XPathModel) {
    const xpathsString = (await promisedStringifyJSON(xPaths)) as string;
    userInput = xpathsString;
    xpathsWritable.set(xPaths);
  }

  async function saveXPathHandler() {
    const toastId = toast.loading("Saving...");
    isLoadingSave = true;
    isErrorSave = false;
    isErrorFetch = false;
    try {
      const xPathValueResult = await XPathModelSchema.safeParseAsync(
        await promisedParseJSON(userInput),
      );
      if (xPathValueResult.success) {
        const xpathValues = addDate(xPathValueResult.data);
        await update(xpathValues);
        toast.success("Save success", { id: toastId });
      } else {
        isErrorSave = true;
        toast.error("Save error", { id: toastId });
      }
    } catch (error) {
      log.error(error);
      isErrorSave = true;
      toast.error("Save error", { id: toastId });
    } finally {
      isLoadingSave = false;
    }
  }

  async function fetchXPathUpdateHandler() {
    const tostId = toast.loading("Fetching...");
    isLoadingFetch = true;
    isErrorSave = false;
    isErrorFetch = false;
    const res = await fetchXPathUpdate();
    if (res) {
      await update(res);
      toast.success("Fetch and save success", { id: tostId });
    } else {
      isErrorFetch = true;
      toast.error("Save error", { id: tostId });
    }
    isLoadingFetch = false;
  }

  onMount(() => {
    xpathsWritable.subscribe((v) => {
      userInput = JSON.stringify(v, null, 2);
    });
  });
</script>

<a href={docs.updateXPathValue} target="_blank" class="my-2">
  <ExternalLink>
    <div class="flex gap-1 items-center">
      <DocsLink href={docs.updateXPathValue} />
      <span>Read docs about xpath</span>
    </div>
  </ExternalLink>
</a>

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
          <div transition:slide>Invalid XPaths values</div>
        {/if}
      </div>
    </div>
  {/if}
  <div class="form-control">
    <textarea
      bind:value={userInput}
      class="min-h-[14.5rem] scrollbar-style textarea textarea-bordered h-24 text-xs whitespace-nowrap"
      placeholder="XPaths"
    />
  </div>
</div>
<div class="flex justify-center">
  <div class="join mt-2">
    <button
      disabled={isLoadingSave || isLoadingFetch}
      on:click={saveXPathHandler}
      class="btn join-item"
    >
      <span class={isLoadingSave ? "loading loading-ring" : ""} />
      Save</button
    >
    <button
      on:click={fetchXPathUpdateHandler}
      disabled={isLoadingSave || isLoadingFetch}
      class="btn-success btn join-item"
    >
      <span class={isLoadingSave ? "loading loading-ring" : ""} />
      Fetch Update</button
    >
  </div>
</div>
