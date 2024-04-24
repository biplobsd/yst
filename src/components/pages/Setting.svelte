<script lang="ts">
  import APIDelay from "./../setting/api/API_Delay.svelte";
  import type { SettingSelected } from "src/utils/types";
  import UpdateXpath from "../setting/xpath/Update_Xpath.svelte";
  import { slide } from "svelte/transition";
  import SelectXpath from "../setting/xpath/Select_Xpath.svelte";
  import ModeSwitch from "../setting/Mode_Switch.svelte";
  import { ChevronLeftIcon } from "lucide-svelte";

  let selected: SettingSelected = "-1";
</script>

<div class="space-y-2 w-full">
  {#if selected !== "-1"}
    <div class="flex w-full gap-2">
      <button class="btn" on:click={() => (selected = "-1")}>
        <ChevronLeftIcon class="h-5 w-5" />
      </button>
      <div class="w-full">
        <div class="btn w-full hover:bg-base-100 bg-base-100">{selected}</div>
      </div>
    </div>
  {:else}
    <SelectXpath bind:selected />
    <div class="divider" />
    <ModeSwitch />
    <div class="divider" />
    <APIDelay />
  {/if}

  {#if selected === "xpath"}
    <div transition:slide>
      <UpdateXpath />
    </div>
  {/if}
</div>
