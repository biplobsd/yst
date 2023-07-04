<script lang="ts">
  import { APP_NAME, VERSION } from "src/utils/constants";
  import icon48 from "src/assets/icons/icon128.png";
  import ThemeSwitch from "./Theme_Switch.svelte";
</script>

<div class="flex items-center gap-1 mb-3 tracking-wider font-extrabold text-xl">
  <div class="flex justify-center items-center gap-1">
    <img src={icon48} alt="Logo" class="w-8 h-8 mx-auto" />
    <span class="text-sm">{APP_NAME}</span>
  </div>
  <div class="flex flex-col items-center">
    <span class="text-xs">{VERSION}</span>
    <ThemeSwitch />
  </div>
</div>
