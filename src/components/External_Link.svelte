<script lang="ts">
    import { ExternalLinkIcon } from "lucide-svelte";
  </script>
  
  <div class="indicator group">
    <ExternalLinkIcon
      class="indicator-item badge badge-xs invisible group-hover:visible"
    />
    <div class="place-items-center">
      <slot />
    </div>
  </div>