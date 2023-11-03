<script lang="ts">
  import DocsLink from "src/components/Docs_Link.svelte";
  import { API_REQ_DELAY_DEFAULT, MODE_DEFAULT } from "src/utils/default";
  import { docs } from "src/utils/docs";
  import { apiReqDelayWritable } from "src/utils/storage";
  import { modeWritable, type MODE } from "src/utils/storage";
  import { onMount } from "svelte";
  import toast from "svelte-french-toast";
  let localMode: MODE = MODE_DEFAULT;

  let delay = API_REQ_DELAY_DEFAULT;

  onMount(() => {
    apiReqDelayWritable.subscribe((value) => (delay = value));

    modeWritable.subscribe((mode) => {
      localMode = mode;
    });
  });
</script>

<div class="form-control w-full max-w-xs !my-0">
  <label class="label">
    <p class="flex items-center gap-1">
      <span class="label-text">API delay per request</span>
      <DocsLink href={docs.apiDelay} />
    </p>
    <input
      disabled={localMode !== "api"}
      type="number"
      placeholder="ms"
      value={delay}
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
