<script lang="ts">
  import { slide } from "svelte/transition";
  import { ExternalLinkIcon, X } from "lucide-svelte";
  import { closeTutorialWritable } from "src/utils/storage";
  import TutorialCard from "./Tutorial_Card.svelte";
  import { onMount } from "svelte";
  import { toast } from "svelte-sonner";

  interface Props {
    forceOpen?: boolean;
  }

  let { forceOpen = false }: Props = $props();
  let closingProgress = $state(0);
  let isSideBarOpen = $state(false);
  let isFirefox = import.meta.env.VITE_BROWSER_NAME === "firefox";

  const interval = setInterval(() => {
    closingProgress += 20;
    if (closingProgress >= 100) {
      clearInterval(interval);
    }
  }, 1000);

  onMount(async () => {
    if (isFirefox) {
      isSideBarOpen = await browser.sidebarAction.isOpen({
        windowId: browser.windows.WINDOW_ID_CURRENT,
      });
    } else {
      const sideBars = await chrome.runtime.getContexts({
        contextTypes: [chrome.runtime.ContextType.SIDE_PANEL],
      });

      for (const sidebar of sideBars) {
        if (sidebar.contextType === chrome.runtime.ContextType.SIDE_PANEL) {
          isSideBarOpen = true;
          break;
        }
      }
    }
  });
</script>

{#if closingProgress !== 100 || forceOpen}
  <div class="flex justify-center py-1">
    <div transition:slide class="indicator w-[16.5rem]">
      {#if !forceOpen}
        <button
          onclick={() => closeTutorialWritable.set(true)}
          class="indicator-item btn btn-circle btn-xs"
        >
          <X class=" w-4 h-4 " />
        </button>
      {/if}
      <TutorialCard bind:closingProgress />
    </div>
  </div>

  {#if !isSideBarOpen}
    <div class="flex justify-center my-2">
      <button
        title="Click to open in side bar"
        class="btn btn-info"
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
        <ExternalLinkIcon />
        Open in side bar</button
      >
    </div>
  {/if}
{/if}
