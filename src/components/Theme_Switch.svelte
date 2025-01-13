<script lang="ts">
  import { themeModeWritable } from "src/utils/storage";
  import { onMount } from "svelte";
  import { MoonIcon, SunIcon } from "lucide-svelte";
  import { SETTINGS_DEFAULT } from "src/utils/default";
  import log from "src/utils/logger";

  let isLight = $state(false);
  let themeMode = $state(SETTINGS_DEFAULT.themeMode);
  const toggleThemeMode = (modeValue: string) =>
    modeValue === "dark" ? "light" : "dark";

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
    onclick={() => themeModeWritable.update(toggleThemeMode)}
    class={`${
      isLight ? "swap-active" : ""
    } swap-rotate btn btn-xs btn-ghost btn-circle swap`}
  >
    <SunIcon class="w-4 h-4 swap-on" />
    <MoonIcon class="w-4 h-4 swap-off" />
  </button>
</abbr>
