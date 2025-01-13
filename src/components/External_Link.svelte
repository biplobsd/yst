<script lang="ts">
  import { ExternalLinkIcon } from "lucide-svelte";

  interface Props {
      children?: import("svelte").Snippet;
    }

    let { children }: Props = $props();
  </script>
  
  <div class="indicator group">
    <ExternalLinkIcon
      class="indicator-item badge badge-xs invisible group-hover:visible"
    />
    <div class="place-items-center">
      {@render children?.()}
    </div>
  </div>