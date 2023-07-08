import { runtime } from "src/utils/communication";
import { parseData } from "./background";
import log from "src/utils/logger";

let storageRemoveListener = () => {};

log.info("OnInstalled...");
runtime.isOptionsPage = false;
storageRemoveListener = runtime.addListener(parseData);

chrome.runtime.onSuspend.addListener(function () {
  log.info("Unloading.");
  storageRemoveListener();
});
