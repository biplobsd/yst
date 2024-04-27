<script>
  import { YoutubeIcon } from "lucide-svelte";
  import { TUTORIAL_LINK } from "src/utils/constants";
  export let closingProgress = 0;
</script>

<a
  title="Click to open 60s YST tutorial video on Youtube."
  href={TUTORIAL_LINK}
  target="_blank"
  rel="noreferrer"
  style={`background-repeat: no-repeat; background-size: ${closingProgress}%`}
  class="btn btn-outline btn-block btn-sm progress-bar"
>
  <YoutubeIcon class="h-5 w-5" />
  <span>Quick tutorial, 60 seconds.</span>
</a>
