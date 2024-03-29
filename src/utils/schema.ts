import { z } from "zod";

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
      .map((y) => y.snippet.customUrl!)
  );

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
