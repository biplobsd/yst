import { z } from "zod";

export const UserSchema = z.object({
  email: z.string(),
  email_verified: z.boolean(),
  family_name: z.string(),
  given_name: z.string(),
  hd: z.string().optional(),
  locale: z.string(),
  name: z.string(),
  picture: z.string(),
  sub: z.string(),
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

export const SubscriptionsListSchema = z
  .object({
    id: z.string(),
    channelId: z.string(),
    title: z.string(),
  })
  .array()
  .default([]);

export const channelPathsSchema = z.string().array().default([]);

export type User = z.infer<typeof UserSchema>;
export type SubscriptionsList = z.infer<typeof SubscriptionsListSchema>;
