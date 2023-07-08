<script lang="ts">
  import APIDelay from "./../setting/api/API_Delay.svelte";
  import type { SettingSelected } from "src/utils/types";
  import UpdateXpath from "../setting/xpath/Update_Xpath.svelte";
  import { slide } from "svelte/transition";
  import SelectXpath from "../setting/xpath/Select_Xpath.svelte";
  import ModeSwitch from "../setting/Mode_Switch.svelte";
  let selected: SettingSelected = "-1";
</script>

<div class="space-y-2 w-full">
  {#if selected !== "-1"}
    <div class="flex w-full gap-2">
      <button class="btn" on:click={() => (selected = "-1")}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          class="w-5 h-5"
        >
          <path
            fill-rule="evenodd"
            d="M7.793 2.232a.75.75 0 01-.025 1.06L3.622 7.25h10.003a5.375 5.375 0 010 10.75H10.75a.75.75 0 010-1.5h2.875a3.875 3.875 0 000-7.75H3.622l4.146 3.957a.75.75 0 01-1.036 1.085l-5.5-5.25a.75.75 0 010-1.085l5.5-5.25a.75.75 0 011.06.025z"
            clip-rule="evenodd"
          />
        </svg>
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
