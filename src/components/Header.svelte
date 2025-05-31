<script lang="ts">
  import icon48 from "src/assets/icons/icon128.png";
  import ThemeSwitch from "./Theme_Switch.svelte";
  import { blur } from "svelte/transition";
  import { workingModeWritable } from "src/utils/storage";
  import { ExternalLinkIcon } from "lucide-svelte";
  import { toast } from "svelte-sonner";
  import { onMount } from "svelte";
  import { isSidePanelOpen } from "../utils/sidePanel";

  const { name, version } = chrome.runtime.getManifest();
  let isFirefox = import.meta.env.VITE_BROWSER_NAME === "firefox";
  let isSideBarOpen = $state(false);
  onMount(async () => {
    isSideBarOpen = await isSidePanelOpen(isFirefox);
  });
</script>

<div class="flex items-center gap-1 mb-3 tracking-wider font-extrabold text-xl">
  <div class="flex justify-center items-center gap-1">
    <div class="w-12 h-full flex justify-center items-center flex-col">
      <img src={icon48} alt="Logo" class="mx-auto" />
      <abbr
        title={`Working mode. Learn more by pressing the "Learn more" button below.`}
      >
        {#key $workingModeWritable}
          <div
            in:blur
            class="h-fit text-[8px]/[8px] text-center uppercase font-mono"
          >
            {$workingModeWritable}
          </div>
        {/key}
      </abbr>
    </div>
    <span class="text-sm">{name}</span>
  </div>
  <div class="flex flex-col items-center">
    <span class="text-xs">{version}</span>
    <div class="flex items-center">
      <ThemeSwitch />
      {#if !isSideBarOpen}
        <abbr title="Open in side panel/bar" class="tooltip tooltip-bottom">
          <button
            class="btn btn-xs btn-ghost btn-circle"
            onclick={async () => {
              if (isFirefox) {
                browser.sidebarAction.open();
              } else {
                const [tab] = await chrome.tabs.query({
                  active: true,
                  currentWindow: true,
                });

                if (!tab.id) {
                  toast.error("No active tab found to open the side panel.");
                  return;
                }

                chrome.sidePanel.open({
                  tabId: tab.id,
                });
              }
              window.close();
            }}
          >
            <ExternalLinkIcon class="h-4 w-4" />
          </button>
        </abbr>
      {/if}
    </div>
  </div>
</div>

<style>
  abbr[title] {
    border-bottom: none !important;
    cursor: inherit !important;
    text-decoration: none !important;
  }
</style>
