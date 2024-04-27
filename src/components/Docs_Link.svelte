<script lang="ts">
  import { HelpCircleIcon } from "lucide-svelte";

  export let href: string;
</script>

<span class="tooltip tooltip-right" data-tip="Read docs">
  <a class="link-hover" target="_blank" rel="noreferrer" {href}>
    <HelpCircleIcon class="h-3 w-3" />
  </a>
</span>
