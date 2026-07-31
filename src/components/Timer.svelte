<script lang="ts">
  import { Tween } from "svelte/motion";
  import { blur } from "svelte/transition";

  interface Props {
    isRunning?: boolean;
  }

  let { isRunning = $bindable(false) }: Props = $props();

  let interval: NodeJS.Timeout | undefined = undefined;
  let original = 0;
  let timer = new Tween(original);

  $effect(() => {
    if (isRunning) {
      startTimer();
    } else {
      stopTimer();
    }
    return () => stopTimer();
  });

  function startTimer() {
    stopTimer();
    timer.set(original);
    interval = setInterval(() => {
      timer.set(timer.current + 1);
    }, 1000);
  }

  function stopTimer() {
    if (interval) {
      clearInterval(interval);
      interval = undefined;
    }
  }

  let minutes = $derived(Math.floor(timer.current / 60));
  let seconds = $derived(Math.floor(timer.current - minutes * 60));
</script>

<div class="flex gap-1">
  <p class="flex gap-0">
    {#key minutes}
      <span in:blur>{minutes}</span>
    {/key}
    m
  </p>
  <p class="flex gap-0">
    {#key seconds}
      <span in:blur>{seconds}</span>
    {/key}
    s
  </p>
</div>

