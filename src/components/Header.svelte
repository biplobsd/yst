<script lang="ts">
  import { APP_NAME, VERSION } from "src/utils/constants";
  import icon48 from "src/assets/icons/icon128.png";
  import ThemeSwitch from "./Theme_Switch.svelte";

  import { modeWritable, type MODE } from "src/utils/storage";
  import { onMount } from "svelte";
  import { blur } from "svelte/transition";
  import { MODE_DEFAULT } from "src/utils/default";

  let localMode: MODE = MODE_DEFAULT;

  onMount(() => {
    modeWritable.subscribe((mode) => {
      localMode = mode;
    });
  });
</script>

<div class="flex items-center gap-1 mb-3 tracking-wider font-extrabold text-xl">
  <div class="flex justify-center items-center gap-1">
    <div class="w-12 h-full flex justify-center items-center flex-col">
      <img src={icon48} alt="Logo" class="mx-auto" />
      <abbr
        title={`Working mode. Learn more by pressing the "Learn more" button below.`}
      >
        {#key localMode}
          <div
            in:blur
            class="h-fit text-[8px]/[8px] text-center uppercase font-mono"
          >
            {localMode}
          </div>
        {/key}
      </abbr>
    </div>
    <span class="text-sm">{APP_NAME}</span>
  </div>
  <div class="flex flex-col items-center">
    <span class="text-xs">{VERSION}</span>
    <ThemeSwitch />
  </div>
</div>

<style>
  abbr[title] {
    border-bottom: none !important;
    cursor: inherit !important;
    text-decoration: none !important;
  }
</style>
