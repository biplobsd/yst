import { z } from "zod";
import { XPathModelSchema } from "./xpaths";

export const StatusCodeSchema = z.enum([
  "loading",
  "error",
  "stop",
  "ready",
  "accept",
  "collecting",
  "subscribeSuccessful",
  "unsubscribeSuccessful",
  "getAuthToken",
  "langError",
  "tabChanged",
  "windowClose"
]);

export const StatusSchema = z.object({
  msg: z.string(),
  code: StatusCodeSchema,
});

export const fromMsgSchema = z
  .enum(["background", "content", "option", "none"])
  .optional();

export const runtimeMessageSchema = z.discriminatedUnion("to", [
  z.object({
    tabId: z.number().optional(),
    from: fromMsgSchema,
    to: z.literal("background"),
    status: z.discriminatedUnion("code", [StatusSchema]),
  }),
  z.object({
    tabId: z.number().optional(),
    from: fromMsgSchema,
    to: z.literal("content"),
    status: z.discriminatedUnion("code", [
      StatusSchema,
      z.object({
        code: z.literal("xpathValues"),
        xpathValues: XPathModelSchema,
      }),
      z.object({
        code: z.literal("changeChannelID"),
        channelID: z.string(),
      }),
      z.object({
        code: z.enum(["subscribe", "unsubscribe"]),
        channelID: z.string(),
      }),
    ]),
  }),
  z.object({
    tabId: z.number().optional(),
    from: fromMsgSchema,
    to: z.literal("option"),
    status: z.discriminatedUnion("code", [
      z.object({
        code: z.literal("channelIDs"),
        channelIDs: z.string().array(),
      }),
      z.object({
        code: z.literal("authToken"),
        authToken: z.string(),
      }),
      StatusSchema,
    ]),
  }),
  z.object({
    tabId: z.number().optional(),
    from: fromMsgSchema,
    to: z.literal("none"),
    status: z.discriminatedUnion("code", [StatusSchema]),
  }),
]);
