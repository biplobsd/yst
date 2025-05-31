// src/utils/sidePanel.ts
// Helper to detect if the side panel is open in Chrome or Firefox, with error handling

export async function isSidePanelOpen(isFirefox: boolean): Promise<boolean> {
  try {
    if (isFirefox) {
      // Firefox API
      if (typeof browser !== 'undefined' && browser.sidebarAction && browser.windows) {
        return await browser.sidebarAction.isOpen({
          windowId: browser.windows.WINDOW_ID_CURRENT,
        });
      }
    } else {
      // Chrome API
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getContexts) {
        const sideBars = await chrome.runtime.getContexts({
          contextTypes: [chrome.runtime.ContextType.SIDE_PANEL],
        });
        for (const sidebar of sideBars) {
          if (sidebar.contextType === chrome.runtime.ContextType.SIDE_PANEL) {
            return true;
          }
        }
      }
    }
  } catch (err) {
    // Optionally log error
    console.error('Error detecting side panel:', err);
  }
  return false;
}
