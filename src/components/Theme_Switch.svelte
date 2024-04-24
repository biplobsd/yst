<script lang="ts">
  import { THEME_MODE_DEFAULT } from "src/utils/default";
  import { isDarkThemeWritable } from "src/utils/storage";
  import { onMount } from "svelte";
  import { MoonIcon, SunIcon } from "lucide-svelte";

  let isLight = false;
  let themeMode = THEME_MODE_DEFAULT;
  const toggleThemeMode = (modeValue: string) =>
    modeValue === "dark" ? "light" : "dark";

  onMount(() => {
    isDarkThemeWritable.subscribe((modeValue) => {
      isLight = modeValue === "light";
      themeMode = modeValue;
    });
  });
</script>

<abbr title={`Switch to ${toggleThemeMode(themeMode)} theme`}>
  <button
    on:click={() => isDarkThemeWritable.update(toggleThemeMode)}
    class={`${
      isLight ? "swap-active" : ""
    } swap-rotate btn btn-xs btn-ghost btn-circle swap`}
  >
    <SunIcon class="w-4 h-4 swap-on" />
    <MoonIcon class="w-4 h-4 swap-off" />
  </button>
</abbr>
