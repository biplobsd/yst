<script>
  import { docs } from "src/utils/docs";
  import { apiKeyWritable, clientIDWritable } from "src/utils/storage";
  import { toast } from "svelte-sonner";
  import DocsLink from "../Docs_Link.svelte";
</script>

<div
  class="capitalize font-bold tracking-wider !mt-0 flex items-center gap-1 text-sm"
>
  Google API console keys <DocsLink href={docs.apiConsoleKey} />
</div>

<label class="form-control w-full !my-0">
  <div class="label">
    <span class="label-text">Client ID</span>
  </div>
  <input
    onchange={() => toast.success("Client ID saved!")}
    bind:value={$clientIDWritable}
    type="text"
    placeholder="Your Google project OAuth2 client ID"
    class="input input-bordered w-full input-xs"
  />
</label>
<label class="form-control w-full !my-0">
  <div class="label">
    <span class="label-text">API key</span>
  </div>
  <input
    onchange={() => toast.success("API key saved!")}
    bind:value={$apiKeyWritable}
    type="text"
    placeholder="Your Google project API key"
    class="input input-bordered w-full input-xs"
  />
</label>
