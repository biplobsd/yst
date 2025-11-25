import { delay } from "./helper";
import log from "./logger";
import { fromMsgSchema, runtimeMessageSchema } from "./protocol";
import { z } from "zod";

export type FromMsg = z.infer<typeof fromMsgSchema>;
export type RuntimeMessage = z.infer<typeof runtimeMessageSchema>;

interface RetryOptions {
  ms?: number;
  count?: number;
}

interface RuntimeModel {
  fromMsg: FromMsg;
  tabId?: number;
  sendOnce: (runtimeMessage: RuntimeMessage) => Promise<boolean>;
  send: (
    runtimeMessage: RuntimeMessage,
    options?: RetryOptions,
  ) => Promise<boolean>;
  addListener: (
    handleFunction: (
      runtimeMessage: RuntimeMessage,
      sender?: chrome.runtime.MessageSender,
    ) => void,
  ) => () => void;
}

export const runtime: RuntimeModel = {
  fromMsg: "none",
  sendOnce: async function (runtimeMessage) {
    try {
      if (runtimeMessage.to === "content") {
        let tabId = runtimeMessage.tabId || this.tabId;
        if (!tabId) {
          const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true,
          });
          tabId = tab.id;
        }

        if (tabId) {
          await chrome.tabs.sendMessage(tabId, {
            ...runtimeMessage,
            from: this.fromMsg,
          });
          return true;
        }
      } else {
        await chrome.runtime.sendMessage({
          ...runtimeMessage,
          from: this.fromMsg,
        });
        return true;
      }
    } catch (error) {
      // console.log(error);
      log.error(error);
      log.info({ fromMsg: this.fromMsg }, "isOptionsPage Runtime Error: ");
      log.error(chrome.runtime.lastError);
    }
    return false;
  },
  send: async function (runtimeMessage, options = {}) {
    const { count = 3, ms = 1000 } = options;

    for (let index = 0; index < count; index++) {
      if (await this.sendOnce(runtimeMessage)) {
        return true;
      }
      try {
        await delay(ms);
      } catch (error) {
        log.error(error);
        return false;
      }
    }
    return false;
  },

  addListener: (handleFunction) => {
    chrome.runtime.onMessage.addListener(handleFunction);
    return () => chrome.runtime.onMessage.removeListener(handleFunction);
  },
};
