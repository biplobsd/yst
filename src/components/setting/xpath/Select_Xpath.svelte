<script lang="ts">
  import type { SettingSelected } from "src/utils/types";

  export let selected: SettingSelected;
</script>

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
