import xpathJson from "../../data/xpaths/v1.8.5.json";
import { z } from "zod";

const LanguageSchema = z.record(z.string());

const SameAsSchema = z.object({
  __same__: z.string().nullable(),
});

const SupportedLangsSchema = z.record(
  z.string(),
  z.union([LanguageSchema, SameAsSchema])
);

export const XPathModelSchema = z.object({
  ALREADY_SUBSCRIBE: z.string().default(xpathJson.ALREADY_SUBSCRIBE),
  SUBSCRIBE_BTN: z.string().default(xpathJson.SUBSCRIBE_BTN),
  UNSUB1: z.string().default(xpathJson.UNSUB1),
  UNSUB2: z.string().default(xpathJson.UNSUB2),
  UPDATE_DATE: z.string().optional(),
  REMOTE_DISABLE: z.boolean().default(import.meta.env.DEV).optional(),
  SEARCH_INPUT_QUERY: z.string().default(xpathJson.SEARCH_INPUT_QUERY),
  NAVIGATION_PROGRESS: z.string().default(xpathJson.NAVIGATION_PROGRESS),
  ALL_SUBSCRIPTIONS_ITEMS: z
    .string()
    .default(xpathJson.ALL_SUBSCRIPTIONS_ITEMS),
  XPATH_ENABLE: z.boolean().default(xpathJson.XPATH_ENABLE),
  API_ENABLE: z.boolean().default(xpathJson.API_ENABLE),
  EXPIRE_DATE: z.number().default(xpathJson.EXPIRE_DATE),
  SUPPORTED_LANGS: SupportedLangsSchema.default(xpathJson.SUPPORTED_LANGS)
});

export type XPathModel = z.infer<typeof XPathModelSchema>;

export function XPathValues(): XPathModel {
  return xpathJson as XPathModel;
}

export const xpathValues = XPathValues();
