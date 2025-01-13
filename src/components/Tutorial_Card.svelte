<script lang="ts">
  import { YoutubeIcon } from "lucide-svelte";
  import { API_MODE_VIDEO_TUTORIAL_LINK, TUTORIAL_LINK } from "src/utils/constants";
  import { workingModeWritable } from "src/utils/storage";
  import { onMount } from "svelte";

  interface Props {
    closingProgress?: number;
  }

  let { closingProgress = $bindable(0) }: Props = $props();
  let isAPI = $state(false);

  onMount(() => {
    workingModeWritable.subscribe((value) => {
      isAPI = value === "api";
    });
  });
</script>

<a
  title="Click to open 60s YST tutorial video on Youtube."
  href={isAPI ? API_MODE_VIDEO_TUTORIAL_LINK: TUTORIAL_LINK}
  target="_blank"
  rel="noreferrer"
  style={`background-repeat: no-repeat; background-size: ${closingProgress}%`}
  class="btn btn-outline btn-block btn-sm progress-bar"
>
  <YoutubeIcon class="h-5 w-5" />
  <span>{isAPI ? "Watch tutorial on API mode" : "Quick tutorial, 60 seconds."}</span>
</a>
