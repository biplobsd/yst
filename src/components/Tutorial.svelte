<script>
  import { slide } from "svelte/transition";
  import { X, YoutubeIcon } from "lucide-svelte";
  import { closeTutorialWritable } from "src/utils/storage";
  import { TUTORIAL_LINK } from "src/utils/constants";
  let closingProgress = 0;

  const interval = setInterval(() => {
    closingProgress += 20;
    if (closingProgress >= 100) {
      clearInterval(interval);
    }
  }, 1000);
</script>

{#if closingProgress !== 100}
  <div class="flex justify-center py-1">
    <div transition:slide class="indicator w-[16.5rem]">
      <button
        on:click={() => closeTutorialWritable.set(true)}
        class="indicator-item btn btn-circle btn-xs"
      >
        <X class=" w-4 h-4 " />
      </button>
      <a
        href={TUTORIAL_LINK}
        target="_blank"
        rel="noreferrer"
        style={`background-repeat: no-repeat; background-size: ${closingProgress}%`}
        class="btn btn-outline btn-block btn-sm progress-bar"
      >
        <YoutubeIcon class="h-5 w-5" />
        <span>Quick tutorial, 60 seconds.</span>
      </a>
    </div>
  </div>
{/if}
