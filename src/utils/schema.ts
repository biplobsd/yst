import { z } from "zod";
import { XPathModelSchema } from "./xpaths";

export const themeMode = z.enum(["dark", "light"]);
export const channelIDsSchema = z.string().array().default([]);

export const UserSchema = z.object({
  email: z.string().optional(),
  email_verified: z.boolean().optional(),
  family_name: z.string().optional(),
  given_name: z.string(),
  hd: z.string().optional(),
  locale: z.string().optional(),
  name: z.string().optional(),
  picture: z.string(),
  sub: z.string().optional(),
});

export const SubscriptionsRawSchema = z.object({
  nextPageToken: z.string().optional(),
  items: z
    .object({
      id: z.string(),
      snippet: z.object({
        title: z.string(),
        resourceId: z.object({
          channelId: z.string(),
        }),
      }),
    })
    .array(),
});

export const ChannelRawSchema = z
  .object({
    items: z
      .object({
        snippet: z.object({
          customUrl: z.string().optional(),
        }),
      })
      .array(),
  })
  .transform((x) =>
    x.items
      .filter((y) => y.snippet.customUrl !== undefined)
      .map((y) => y.snippet.customUrl!),
  );

export const SubscriptionsListSchema = z
  .object({
    id: z.string().nullable().optional(),
    channelId: z.string(),
    title: z.string(),
  })
  .array()
  .default([]);

export const SettingsSchema = z.object({
  themeMode,
  channelIDs: channelIDsSchema,
  XPaths: XPathModelSchema,
  workingMode: z.enum(["xpath", "api"]).default("xpath"),
  firstOAuthKey: z.string().optional(),
  secondOAuthKey: z.string().optional(),
  firstUser: UserSchema,
  secondUser: UserSchema,
  subscriptionsList: SubscriptionsListSchema,
  primaryChannel: z.enum(["0", "1", "-1"]).default("-1"),
  apiReqDelay: z.number().default(500),
  closeTutorial: z.boolean().default(false),
  clientID: z.string().optional(),
  apiKey: z.string().optional(),
});

export type User = z.infer<typeof UserSchema>;
export type SubscriptionsList = z.infer<typeof SubscriptionsListSchema>;
export type Settings = z.infer<typeof SettingsSchema>;
export const STORAGE_KEYS = SettingsSchema.keyof().Enum;
