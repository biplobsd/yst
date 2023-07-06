<script>
  import { tweened } from "svelte/motion";
  import { blur } from "svelte/transition";

  let original = 0;
  let timer = tweened(original);
  let interval = 0;

  export let isRunning = false;

  $: {
    if (isRunning) {
      startTimer();
    } else {
      stopTimer();
    }
  }

  function startTimer() {
    timer.set(original);
    interval = setInterval(() => {
      timer.set($timer + 1);
    }, 1000);
  }

  function stopTimer() {
    clearInterval(interval);
  }

  let minutes = 0;
  let seconds = 0;

  $: {
    minutes = Math.floor($timer / 60);
    seconds = Math.floor($timer - minutes * 60);
  }
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
