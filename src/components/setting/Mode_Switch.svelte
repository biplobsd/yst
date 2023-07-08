<script lang="ts">
  import { MODE_DEFAULT } from "src/utils/default";
  import { modeWritable, type MODE } from "src/utils/storage";
  import { onMount } from "svelte";
  import { detect } from "detect-browser";

  let localMode: MODE = MODE_DEFAULT;
  let isChrome = false;

  onMount(() => {
    modeWritable.subscribe((mode) => {
      localMode = mode;
    });

    const browser = detect();
    if (browser && browser.name === "chrome") {
      isChrome = true;
    }
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
    <span class="label-text"
      >API <span class="text-xs text-info">(Only for chrome browser)</span
      ></span
    >
    <input
      disabled={!isChrome}
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
