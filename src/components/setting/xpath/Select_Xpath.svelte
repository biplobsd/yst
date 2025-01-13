<script lang="ts">
  import type { SettingSelected } from "src/utils/types";
  import { ChevronRightIcon } from "lucide-svelte";

  interface Props {
    selected: SettingSelected;
  }

  let { selected = $bindable() }: Props = $props();
</script>

<button class="btn w-full" onclick={() => (selected = "xpath")}
  ><div class="flex justify-between items-center w-full">
    <span class="text-sm">XPath</span>
    <ChevronRightIcon class="h-5 w-5" />
  </div>
</button>
