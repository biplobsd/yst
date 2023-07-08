<script lang="ts">
  import { API_REQ_DELAY_DEFAULT } from "src/utils/default";
  import { apiReqDelayWritable } from "src/utils/storage";
  import { onMount } from "svelte";
  import toast from "svelte-french-toast";

  let delay = API_REQ_DELAY_DEFAULT;

  onMount(() => {
    apiReqDelayWritable.subscribe((value) => (delay = value));
  });
</script>

<div class="form-control w-full max-w-xs !my-0">
  <label class="label">
    <span class="label-text">API delay per request</span>
    <input
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
