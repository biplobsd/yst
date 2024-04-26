<script>
	import { slide } from 'svelte/transition';
  import { YoutubeIcon } from "lucide-svelte";
  let closingProgress = 0;

  // 5s to close the progress bar
  const interval = setInterval(() => {
    closingProgress += 20;
    if (closingProgress >= 100) {
      clearInterval(interval);
    }
  }, 1000);
</script>

{#if closingProgress !== 100}
  <div transition:slide class="py-2">
    <button
      style={`background-repeat: no-repeat; background-size: ${closingProgress}%`}
      class="btn btn-outline btn-block btn-sm progress-bar"
    >
      <YoutubeIcon class="h-5 w-5" />
      <span>Quick tutorial, 60 seconds.</span>
    </button>
  </div>
{/if}
