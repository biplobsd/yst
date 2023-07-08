<script lang="ts">
  import { blur } from "svelte/transition";
  export let subscriptionCount: number;
</script>

<div class="font-bold">Data</div>
<div
  class="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box"
>
  <input type="checkbox" class="peer !min-h-8" />
  <div
    class="!min-h-8 !py-0 flex items-center collapse-title text-sm bg-success/70 text-black/70 tracking-wider font-sans"
  >
    Subscriptions:
    {#key subscriptionCount}
      <span in:blur>{subscriptionCount}</span>
    {/key}
  </div>
  <div class="collapse-content bg-success/60 peer-checked:py-2">
    Data will show here
  </div>
</div>
