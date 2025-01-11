<script lang="ts">
  import { Wrench } from "lucide-svelte";
  import { docs } from "src/utils/docs";
  import ExternalLink from "src/components/External_Link.svelte";
  import { workingModeWritable } from "src/utils/storage";
  import { toast } from "svelte-sonner";

  export let featureName = "";
</script>

<div class="card bg-base-100 shadow-lg max-w-lg mx-auto">
  <div class="card-body items-center text-center">
    <Wrench class="w-12 h-12 text-base-content mb-2" />

    <h3 class="card-title text-base-content">{featureName} {featureName ? "Feature" : ""} Under Maintenance</h3>

    <p class="text-base-content/70">
      {featureName ? "This feature" : "YST"} is currently being
      maintained. {featureName ? "Please try one of the following options:" : "Please wait"}
    </p>

    <div class="flex flex-col gap-2 w-full max-w-sm mt-2">
      {#if featureName === "XPath"}
        <button
          class="btn btn-outline btn-info"
          on:click={() => {
            toast.success("Switching API mode");
            workingModeWritable.set("api");
          }}>
          Try API Mode
        </button>
      {:else if featureName === "API"}
        <button
          class="btn btn-outline btn-info"
          on:click={() => {
            toast.success("Switching XPath mode");
            workingModeWritable.set("xpath");
          }}>
          Try XPath Mode
        </button>
      {/if}

      <a href={docs.issuesLink}
         rel="noreferrer"
         target="_blank"
         title="If you encounter any errors, please create an issue by clicking here."
      >
        <ExternalLink>
          <button class="btn btn-ghost">
            Create an Issue
          </button>
        </ExternalLink>
      </a>
    </div>
  </div>
</div>