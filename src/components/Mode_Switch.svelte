<script lang="ts">
  import { MODE_DEFAULT, modeWritable, type MODE } from "src/utils/storage";
  import { onMount } from "svelte";

  let localMode: MODE = MODE_DEFAULT;

  onMount(() => {
    modeWritable.subscribe((mode) => {
      localMode = mode;
    });
  });
</script>

<div class="capitalize font-bold tracking-wider text-base !mt-0">
  Select Mode
</div>
<div class="form-control !py-1 !my-0 hover:bg-base-200 rounded-md">
  <label class="label !py-0 cursor-pointer">
    <span class="label-text">XPath</span>
    <input
      type="radio"
      name="radio-10"
      class="radio radio-xs checked:bg-red-500"
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
      class="radio radio-xs checked:bg-blue-500"
      checked={localMode === "api"}
      on:change={() => {
        modeWritable.set("api");
      }}
    />
  </label>
</div>
