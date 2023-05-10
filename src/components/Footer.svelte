<script lang="ts">
  import { REPO_URL } from "src/utils/constants";
  import { GITHUB_LOGO } from "src/utils/large_strings";
  import CoffeeIcon from "./Coffee_Icon.svelte";
</script>

<div class="my-2 space-y-1">
  <div
    class="mt-5 flex items-center dark:text-slate-100/50 text-slate-700/50 gap-2 justify-center"
  >
    <img class="w-5 h-5" src={GITHUB_LOGO} alt="Github logo" /><a
      class="link link-hover link-info"
      target="_blank"
      rel="noreferrer"
      href={REPO_URL}>Fork now</a
    >
  </div>
  <p class="text-xs mb-1 dark:text-slate-100/50 text-slate-700/50 text-center">
    <a
      class="link link-hover flex gap-2 items-center"
      target="_blank"
      rel="noreferrer"
      href="https://www.buymeacoffee.com/biplobsd"
    >
      <CoffeeIcon />
      Buy me a coffee</a
    >
  </p>
</div>
