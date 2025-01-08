import xpathJson from "../../data/xpaths/v1.8.json";
import { z } from "zod";

export const XPathModelSchema = z.object({
  SUBSCRIPTIONS_SECTION: z.string().default(xpathJson.SUBSCRIPTIONS_SECTION),
  SUB_CHANNELS_EXPENDED_ITEMS: z
    .string()
    .default(xpathJson.SUB_CHANNELS_EXPENDED_ITEMS),
  IS_EXPENDEDABLE: z.string().default(xpathJson.IS_EXPENDEDABLE),
  IS_EXPENDEDABLE_EXPENDED: z
    .string()
    .default(xpathJson.IS_EXPENDEDABLE_EXPENDED),
  IS_EXPENDEDABLE_EXPENDED_BUTTON: z
    .string()
    .default(xpathJson.IS_EXPENDEDABLE_EXPENDED_BUTTON),
  THREE_LINES: z.string().default(xpathJson.THREE_LINES),
  DRAWER_OPENED: z.string().default(xpathJson.DRAWER_OPENED),
  ALREADY_SUBSCRIBE: z.string().default(xpathJson.ALREADY_SUBSCRIBE),
  SUBSCRIBE_BTN: z.string().default(xpathJson.SUBSCRIBE_BTN),
  UNSUB1: z.string().default(xpathJson.UNSUB1),
  UNSUB2: z.string().default(xpathJson.UNSUB2),
  UPDATE_DATE: z.string().optional(),
  REMOTE_DISABLE: z.boolean().optional().default(false),
  SEARCH_INPUT_QUERY: z.string().default(xpathJson.SEARCH_INPUT_QUERY),
  NAVIGATION_PROGRESS: z.string().default(xpathJson.NAVIGATION_PROGRESS),
  ALL_SUBSCRIPTIONS_BTN: z.string().default(xpathJson.ALL_SUBSCRIPTIONS_BTN),
  ALL_SUBSCRIPTIONS_ITEMS: z
    .string()
    .default(xpathJson.ALL_SUBSCRIPTIONS_ITEMS),
  XPATH_ENABLE: z.boolean().default(xpathJson.XPATH_ENABLE),
  API_ENABLE: z.boolean().default(xpathJson.API_ENABLE),
  EXPIRE_DATE: z.number().default(xpathJson.EXPIRE_DATE),
});

export type XPathModel = z.infer<typeof XPathModelSchema>;

export function XPathValues(): XPathModel {
  return xpathJson as XPathModel;
}

export const xpathValues = XPathValues();
