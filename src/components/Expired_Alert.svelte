<script lang="ts">
  import ExternalLink from "src/components/External_Link.svelte";
  import { docs } from "src/utils/docs";
  import { xpathsWritable } from "src/utils/storage";
  import { onMount } from "svelte";
  import { SETTINGS_DEFAULT } from "src/utils/default";

  const today = new Date();
  let epochDate = new Date(SETTINGS_DEFAULT.XPaths.EXPIRE_DATE);
  let isTodayAfterEpoch = today > epochDate;


  function checkExpireDate(value: number) {
    epochDate = new Date(value);
    isTodayAfterEpoch = today > epochDate;
  }

  onMount(() => {
    xpathsWritable.subscribe((value) => {
      checkExpireDate(value.EXPIRE_DATE);
    });
  });
</script>

{#if isTodayAfterEpoch}
  <div class="mt-2 flex justify-center">
    <ExternalLink>
      <a
        class="normal-case h-8"
        target="_blank"
        rel="noreferrer"
        href={docs.issuesLink}
        title="YST expected working date has expired. If you encounter any errors, please create an issue by clicking here.">
        <div role="alert" class="alert alert-warning flex h-8">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>Date has expired. Report issues.</span>
        </div>
      </a>
    </ExternalLink>
  </div>
{/if}