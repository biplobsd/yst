<script lang="ts">
  import { onMount } from "svelte";
  import { isInSidebarContext, isSidePanelOpen } from "../utils/sidePanel";
  import { toast } from "svelte-sonner";
  import { runtime } from "src/utils/communication";

  let isSideBarOpen = $state(false);
  let isFirefox = import.meta.env.VITE_BROWSER_NAME === "firefox";
  let isinSidebar = isInSidebarContext();


  onMount(async () => {
    isSideBarOpen = await isSidePanelOpen(isFirefox);
  });
</script>

{#if isSideBarOpen && !isinSidebar}
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50">
    <div class="flex justify-center items-center h-full px-4">
      <div role="alert" class="alert bg-base-300/80 backdrop-blur-sm shadow-lg shadow-base-100/50">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          class="stroke-red-500 h-6 w-6 shrink-0">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span>Close the sidebar to open the popup/option menu.</span>
        <div>
          <button class="btn btn-sm" onclick={
        async () => {
           window.close();
      }}>Okay
          </button>
          <button class="btn btn-sm btn-success" onclick={
        async () => {
          if (isFirefox) {
            await browser.sidebarAction.close();
          } else {
            const [tab] = await chrome.tabs.query({
              active: true,
              currentWindow: true,
            });

            if (!tab.id) {
              toast.error("No active tab found to close the side panel.");
              return;
            }

            await runtime.send({
              to: "option",
              status: {
                code: "windowClose",
                msg: "Closing sidebar",
              },
            });
          }
          window.close();
        }
      }>Close
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}
