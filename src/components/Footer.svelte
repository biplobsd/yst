<script lang="ts">
  import { REPO_URL } from "src/utils/constants";
  import CoffeeIcon from "./icons/Coffee_Icon.svelte";
  import { isDarkThemeWritable } from "src/utils/storage";
  import { onMount } from "svelte";
  import GithubMark from "src/assets/icons/github-mark.png";
  import GithubMarkWhite from "src/assets/icons/github-mark-white.png";
  import { docs } from "src/utils/docs";

  let isLight = false;

  onMount(() => {
    isDarkThemeWritable.subscribe((modeValue) => {
      isLight = modeValue === "light";
    });
  });
</script>

<div class="my-2 gap-2 flex justify-center items-center mb-3">
  <a
    class="btn btn-xs normal-case"
    target="_blank"
    rel="noreferrer"
    href={docs.README}
  >
    <img
      class="w-4 h-4"
      src={isLight ? GithubMark : GithubMarkWhite}
      alt="Github logo"
    />

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
