<script>
  import { blur } from "svelte/transition";
  import Confetti from "svelte-confetti";
  import SliderTips from "./tips/Slider_Tips.svelte";
  import { XIcon } from "lucide-svelte";

  let open = true;
</script>

{#if open}
  <div
    style="
position: fixed;
top: -50px;
left: 0;
height: 100vh;
width: 100vw;
display: flex;
justify-content: center;
overflow: hidden;
pointer-events: none;
z-index: 1000;
"
  >
    <Confetti
      x={[-5, 5]}
      y={[0, 0.1]}
      delay={[0, 1000]}
      duration={3000}
      amount={1000}
      fallDistance="100vh"
    />
  </div>
  <div
    transition:blur
    class="backdrop-blur-[2px] absolute w-full h-full z-10 rounded-md"
  >
    <div
      class="flex justify-center items-center h-full w-full flex-col gap-1 -mt-4"
    >
      <div class="flex justify-between items-end w-full">
        <span class="ml-2 text-info font-bold">Last run was successful.</span>
        <button
          title="Close support popup"
          on:click={() => (open = false)}
          class="btn btn-xs btn-circle btn-outline"
          ><XIcon class="w-4 h-4" /></button
        >
      </div>
      <SliderTips />
    </div>
  </div>
{/if}
