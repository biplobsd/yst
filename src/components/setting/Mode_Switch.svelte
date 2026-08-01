<script lang="ts">
  import { docs } from "src/utils/docs";
  import DocsLink from "../Docs_Link.svelte";
  import { workingModeWritable, xpathsWritable } from "src/utils/storage";

  let isFirefox = import.meta.env.VITE_BROWSER_NAME === "firefox";
</script>

<div
  class="capitalize font-bold tracking-wider !mt-0 flex items-center gap-1 text-sm"
>
  Select Mode
  <DocsLink href={docs.selectMode} />
</div>
<div class="form-control !py-1 !my-0 hover:bg-base-200 rounded-md">
  <label class="label !py-0 cursor-pointer"
         title={
        $xpathsWritable.XPATH_ENABLE
              ? undefined
              : "This feature is currently being maintained."}>
    <span class="label-text">XPath</span>
    <input
      type="radio"
      name="radio-10"
      class="radio radio-xs checked:bg-success"
      disabled={!$xpathsWritable.XPATH_ENABLE}
      checked={$workingModeWritable === "xpath"}
      onchange={() => {
        workingModeWritable.set("xpath");
      }}
    />
  </label>
</div>
<div class="form-control !py-1 !my-0 hover:bg-base-200 rounded-md">
  <label class="label !py-0 !my-0 cursor-pointer"
         title={
          isFirefox
           ? "This feature is not in Firefox. Available in Chrome/Edge/Opera browser"
           : $xpathsWritable.API_ENABLE ? undefined : "This feature is currently being maintained."}>
    <span class="label-text">API</span>
    <input
      type="radio"
      name="radio-10"
      class="radio radio-xs checked:bg-info"
      disabled={!$xpathsWritable.API_ENABLE || isFirefox}
      checked={$workingModeWritable === "api"}
      onchange={() => {
        workingModeWritable.set("api");
      }}
    />
  </label>
</div>
