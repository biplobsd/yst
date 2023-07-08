import { runtime } from "src/utils/communication";
import { parseData } from "./background";

let storageRemoveListener = () => {};

console.log("OnInstalled...");
runtime.isOptionsPage = false;
storageRemoveListener = runtime.addListener(parseData);

chrome.runtime.onSuspend.addListener(function () {
  console.log("Unloading.");
  storageRemoveListener();
});
