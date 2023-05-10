<script lang="ts">
  import type { SettingSelected } from "src/utils/types";
  import UpdateXpath from "../xpath/Update_Xpath.svelte";
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
    <button on:click={() => (selected = "xpath")} class="btn w-full"
      ><div class="flex justify-between items-center w-full">
        <span>XPath</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-6 h-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M8.25 4.5l7.5 7.5-7.5 7.5"
          />
        </svg>
      </div>
    </button>
  {/if}

  {#if selected === "xpath"}
    <UpdateXpath />
  {/if}
</div>
