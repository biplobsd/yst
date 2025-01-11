<script lang="ts">
  import DocsLink from "src/components/Docs_Link.svelte";
  import { docs } from "src/utils/docs";
  import { apiReqDelayWritable, workingModeWritable } from "src/utils/storage";
  import { toast } from "svelte-sonner";
</script>

<div class="form-control w-full max-w-xs !my-0">
  <label class="label">
    <p class="flex items-center gap-1">
      <span class="text-sm">API delay per request</span>
      <DocsLink href={docs.apiDelay} />
    </p>
    <input
      disabled={$workingModeWritable !== "api"}
      type="number"
      placeholder="ms"
      value={$apiReqDelayWritable}
      min="0"
      on:change={(e) => {
        const delay = +e.currentTarget.value;
        toast.success("Delay : " + delay);
        apiReqDelayWritable.set(delay);
      }}
      class="input input-xs input-bordered w-20"
    />
  </label>
</div>
