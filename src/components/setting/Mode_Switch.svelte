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
<div class="form-control !my-0 hover:bg-base-200 rounded-md">
  <label
    class="label cursor-pointer flex items-center justify-between w-full px-2 py-1.5"
    title={$xpathsWritable.XPATH_ENABLE
      ? undefined
      : "This feature is currently being maintained."}
  >
    <span class="label-text text-sm font-medium">XPath</span>
    <input
      type="radio"
      name="mode-select-radio"
      class="radio radio-xs radio-success"
      disabled={!$xpathsWritable.XPATH_ENABLE}
      checked={$workingModeWritable === "xpath"}
      onchange={() => {
        workingModeWritable.set("xpath");
      }}
    />
  </label>
</div>
<div class="form-control !my-0 hover:bg-base-200 rounded-md">
  <label
    class="label cursor-pointer flex items-center justify-between w-full px-2 py-1.5"
    title={isFirefox
      ? "This feature is not in Firefox. Available in Chrome/Edge/Opera browser"
      : $xpathsWritable.API_ENABLE
        ? undefined
        : "This feature is currently being maintained."}
  >
    <span class="label-text text-sm font-medium">API</span>
    <input
      type="radio"
      name="mode-select-radio"
      class="radio radio-xs radio-info"
      disabled={!$xpathsWritable.API_ENABLE || isFirefox}
      checked={$workingModeWritable === "api"}
      onchange={() => {
        workingModeWritable.set("api");
      }}
    />
  </label>
</div>
