<script lang="ts">
  import type { SettingSelected } from "src/utils/types";
  import { ChevronRightIcon } from "lucide-svelte";

  export let selected: SettingSelected;
</script>

<button on:click={() => (selected = "xpath")} class="btn w-full"
  ><div class="flex justify-between items-center w-full">
    <span class="text-sm">XPath</span>
    <ChevronRightIcon class="h-5 w-5" />
  </div>
</button>
