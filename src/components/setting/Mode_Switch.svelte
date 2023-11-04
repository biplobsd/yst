<script lang="ts">
  import { MODE_DEFAULT } from "src/utils/default";
  import { docs } from "src/utils/docs";
  import { modeWritable, type MODE } from "src/utils/storage";
  import { onMount } from "svelte";
  import DocsLink from "../Docs_Link.svelte";

  let localMode: MODE = MODE_DEFAULT;

  onMount(() => {
    modeWritable.subscribe((mode) => {
      localMode = mode;
    });
  });
</script>

<div
  class="capitalize font-bold tracking-wider text-base !mt-0 flex items-center gap-1"
>
  Select Mode <DocsLink href={docs.selectMode} />
</div>
<div class="form-control !py-1 !my-0 hover:bg-base-200 rounded-md">
  <label class="label !py-0 cursor-pointer">
    <span class="label-text">XPath</span>
    <input
      type="radio"
      name="radio-10"
      class="radio radio-xs checked:bg-success"
      checked={localMode === "xpath"}
      on:change={() => {
        modeWritable.set("xpath");
      }}
    />
  </label>
</div>
<div class="form-control !py-1 !my-0 hover:bg-base-200 rounded-md">
  <label class="label !py-0 !my-0 cursor-pointer">
    <span class="label-text">API</span>
    <input
      type="radio"
      name="radio-10"
      class="radio radio-xs checked:bg-info"
      checked={localMode === "api"}
      on:change={() => {
        modeWritable.set("api");
      }}
    />
  </label>
</div>
