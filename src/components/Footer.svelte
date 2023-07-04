<script lang="ts">
  import { REPO_URL } from "src/utils/constants";
  import { GITHUB_LOGO } from "src/utils/large_strings";
  import CoffeeIcon from "./Coffee_Icon.svelte";
</script>

<div class="my-2 gap-2 flex justify-center items-center mb-3">
  <a
    class="btn btn-xs normal-case"
    target="_blank"
    rel="noreferrer"
    href={REPO_URL}
  >
    <img class="w-4 h-4" src={GITHUB_LOGO} alt="Github logo" />
    Learn more
  </a>
  <a
    class="btn btn-xs normal-case"
    target="_blank"
    rel="noreferrer"
    href="https://www.buymeacoffee.com/biplobsd"
  >
    <CoffeeIcon />
    Buy me a coffee</a
  >
</div>
