<script lang="ts">
  import { themeModeWritable } from "src/utils/storage";
  import { onMount } from "svelte";
  import { MoonIcon, SunIcon } from "lucide-svelte";
  import { SETTINGS_DEFAULT } from "src/utils/default";
  import log from "src/utils/logger";
  import { createThemeTransition } from "src/utils/themeTransition";

  let isLight = $state(false);
  let themeMode = $state(SETTINGS_DEFAULT.themeMode);
  let buttonElement: HTMLButtonElement;

  const toggleThemeMode = (modeValue: string) =>
    modeValue === "dark" ? "light" : "dark";

  const { toggleThemeWithAnimation } = createThemeTransition({
    isLightFun: () => isLight,
    toggleTheme: () => themeModeWritable.update(toggleThemeMode),
  });

  const handleThemeToggle = () => {
    if (buttonElement) {
      toggleThemeWithAnimation(buttonElement);
    } else {
      themeModeWritable.update(toggleThemeMode);
    }
  };

  onMount(() => {
    themeModeWritable.subscribe((modeValue) => {
      isLight = modeValue === "light";
      themeMode = modeValue;

      try {
        document.documentElement.setAttribute("data-theme", modeValue);
      } catch (error) {
        log.error(error);
        return;
      }
    });
  });
</script>

<abbr title={`Switch to ${toggleThemeMode(themeMode)} theme`}>
  <button
    bind:this={buttonElement}
    onclick={handleThemeToggle}
    class={`${
      isLight ? "swap-active" : ""
    } swap-rotate btn btn-xs btn-ghost btn-circle swap`}
  >
    <SunIcon class="w-4 h-4 swap-on" />
    <MoonIcon class="w-4 h-4 swap-off" />
  </button>
</abbr>
<div id="rainbow-ripple-svg"></div>

<style>
  ::view-transition-group(root) {
    animation-duration: 800ms;
    animation-timing-function: ease-in-out;
  }

  ::view-transition-image-pair(root) {
    isolation: auto;
  }

  :root {
    --transition-z-index-new: 999;
    --transition-z-index-old: 998;
  }

  ::view-transition-old(root) {
    animation: none;
    mix-blend-mode: normal;
    z-index: var(--transition-z-index-old);
    display: block;
  }

  ::view-transition-new(root) {
    animation: none;
    mix-blend-mode: normal;
    z-index: var(--transition-z-index-new);
    display: block;
  }
</style>
