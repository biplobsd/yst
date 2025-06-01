import { runtime } from "src/utils/communication";
import { parseData } from "./background";
import log from "src/utils/logger";

let storageRemoveListener = () => { };

log.info("OnInstalled...");
runtime.fromMsg = 'background';
storageRemoveListener = runtime.addListener(parseData);

chrome.runtime.onSuspend.addListener(function () {
  log.info("Unloading.");
  storageRemoveListener();
});


chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (!changeInfo.url) {
    return;
  }
  await runtime.send({
    tabId,
    to: "option",
    status: {
      code: "tabChanged",
      msg: "Tab URL changed",
    },
  });
});