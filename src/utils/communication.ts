import log from "./logger";
import { XPathModelSchema } from "./xpaths";
import { z } from "zod";

const StatusCodeSchema = z.enum([
  "loading",
  "collecting",
  "subscribe",
  "subscribeSuccessful",
  "unsubscribe",
  "unsubscribeSuccessful",
  "changePage",
  "error",
  "stop",
  "ready",
  "accept",
  "xpath",
  "channelIDs",
  "contentScriptDestroy",
  "message",
]);

const StatusSchema = z.object({
  msg: z.string(),
  code: StatusCodeSchema,
});

export const runtimeMessageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("dataOption"),
    status: StatusSchema,
    channelPaths: z.string().array(),
  }),
  z.object({
    type: z.literal("dataContent"),
    status: StatusSchema,
    xpathValues: XPathModelSchema,
  }),
  z.object({
    type: z.enum(["status", "statusOption", "statusContent"]),
    status: StatusSchema,
  }),
]);

export type RuntimeMessage = z.infer<typeof runtimeMessageSchema>;

interface RuntimeModel {
  isOptionsPage: boolean;
  send: (runtimeMessage: RuntimeMessage) => Promise<boolean>;
  addListener: (
    handleFunction: (runtimeMessage: RuntimeMessage) => void
  ) => () => void;
}

export const runtime: RuntimeModel = {
  isOptionsPage: false,
  send: async function (runtimeMessage) {
    try {
      if (this.isOptionsPage) {
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });
        if (tab.id) {
          const response = await chrome.tabs.sendMessage(
            tab.id,
            runtimeMessage
          );
          log.info(response);
          return true;
        }
      } else {
        const response = await chrome.runtime.sendMessage(runtimeMessage);
        log.info(response);
        return true;
      }
    } catch (error) {
      log.error(error);
      log.info("isOptionsPage", this.isOptionsPage, "Runtime Error: ");
      log.error(chrome.runtime.lastError);
    }
    return false;
  },
  addListener: (handleFunction) => {
    chrome.runtime.onMessage.addListener(handleFunction);
    return () => chrome.runtime.onMessage.removeListener(handleFunction);
  },
};
