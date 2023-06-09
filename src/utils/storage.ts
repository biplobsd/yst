import { writable } from "svelte/store";

import {
  API_REQ_DELAY,
  CHANNEL_PATHS_KEY,
  FIRST_USER_KEY,
  MODE_KEY,
  PRIMARY_CHANNEL,
  SECOND_USER_KEY,
  SUBSCRIPTIONS_KEY,
  THEME_MODE_KEY,
  XPATH_VALUES_KEY,
} from "./constants";
import { z } from "zod";
import log from "./logger";
import { XPathModelSchema, xpathValues } from "./xpaths";
import {
  SubscriptionsListSchema,
  UserSchema,
  channelPathsSchema,
} from "./schema";
import type { PrimaryChannel } from "./types";
import { MODE_DEFAULT, THEME_MODE_DEFAULT } from "./default";

export async function promisedParseJSON(json: string | null): Promise<any> {
  if (!json) {
    return null;
  }
  return new Promise((resolve, reject) => {
    try {
      resolve(JSON.parse(json));
    } catch (e) {
      reject(e);
    }
  });
}

export async function promisedStringifyJSON(value: any) {
  return new Promise((resolve, reject) => {
    try {
      resolve(JSON.stringify(value, null, 2));
    } catch (e) {
      reject(e);
    }
  });
}

const storedChannelPathsRaw = localStorage.getItem(CHANNEL_PATHS_KEY);

let jsonParseChannelPathsRaw = null;
if (storedChannelPathsRaw) {
  try {
    jsonParseChannelPathsRaw = JSON.parse(storedChannelPathsRaw);
  } catch (error) {
    log.error(error);
  }
}

const storedChannelPaths = channelPathsSchema.safeParse(
  jsonParseChannelPathsRaw
);
export const channelPathsWritable = writable(
  storedChannelPaths.success ? storedChannelPaths.data : []
);
channelPathsWritable.subscribe(async (value) => {
  try {
    const stringValue = (await promisedStringifyJSON(value)) as string;
    localStorage.setItem(CHANNEL_PATHS_KEY, stringValue);
  } catch (error) {
    log.error(error);
    return;
  }
});

const storedXPathValuesRaw = localStorage.getItem(XPATH_VALUES_KEY);
let jsonParsedXPathValuesRaw = null;
if (storedXPathValuesRaw) {
  try {
    jsonParsedXPathValuesRaw = JSON.parse(storedXPathValuesRaw);
  } catch (error) {
    log.error(error);
  }
}
const storedXPathValues = XPathModelSchema.safeParse(jsonParsedXPathValuesRaw);
export const xPathValuesWritable = writable(
  storedXPathValues.success ? storedXPathValues.data : xpathValues
);
xPathValuesWritable.subscribe(async (value) => {
  try {
    const stringValue = (await promisedStringifyJSON(value)) as string;
    localStorage.setItem(XPATH_VALUES_KEY, stringValue);
  } catch (error) {
    log.error(error);
    return;
  }
});

const themeSchema = z.enum(["dark", "light"]).default(THEME_MODE_DEFAULT);
const storedThemeRaw = localStorage.getItem(THEME_MODE_KEY);
const storedThemeValidated = themeSchema.safeParse(storedThemeRaw);
export const isDarkThemeWritable = writable(
  storedThemeValidated.success ? storedThemeValidated.data : THEME_MODE_DEFAULT
);

isDarkThemeWritable.subscribe(async (value) => {
  try {
    localStorage.setItem(THEME_MODE_KEY, value);
    document.documentElement.setAttribute("data-theme", value);
  } catch (error) {
    log.error(error);
    return;
  }
});

const modeSchema = z.enum(["xpath", "api"]).default(MODE_DEFAULT);
export type MODE = z.infer<typeof modeSchema>;
const storedModeRaw = localStorage.getItem(MODE_KEY);
const storedModeValidated = modeSchema.safeParse(storedModeRaw);
export const modeWritable = writable(
  storedModeValidated.success ? storedModeValidated.data : MODE_DEFAULT
);

modeWritable.subscribe(async (value) => {
  try {
    localStorage.setItem(MODE_KEY, value);
  } catch (error) {
    log.error(error);
    return;
  }
});

// OAuth token
export const channel0OAuthTokenWritable = writable<null | string>(null);
chrome.storage.session.get(["firstOAuthKey"]).then((result) => {
  if (result && typeof result === "string") {
    channel0OAuthTokenWritable.set(result);
  }
});
channel0OAuthTokenWritable.subscribe(async (value) => {
  await chrome.storage.session.set({ firstOAuthKey: value ? value : "" });
});

export const channel1OAuthTokenWritable = writable<null | string>(null);
chrome.storage.session.get(["secondOAuthKey"]).then((result) => {
  if (result && typeof result === "string") {
    channel1OAuthTokenWritable.set(result);
  }
});
channel1OAuthTokenWritable.subscribe(async (value) => {
  await chrome.storage.session.set({ secondOAuthKey: value ? value : "" });
});

// UserData
const storedFirstUserRaw = localStorage.getItem(FIRST_USER_KEY);
let jsonParsedFirstUserRaw = null;
if (storedFirstUserRaw) {
  try {
    jsonParsedFirstUserRaw = JSON.parse(storedFirstUserRaw);
  } catch (error) {
    log.error(error);
  }
}
const storedFirstUser = UserSchema.safeParse(jsonParsedFirstUserRaw);
export const firstUserWritable = writable(
  storedFirstUser.success ? storedFirstUser.data : null
);
firstUserWritable.subscribe(async (value) => {
  try {
    const stringValue = value
      ? ((await promisedStringifyJSON(value)) as string)
      : "";
    localStorage.setItem(FIRST_USER_KEY, stringValue);
  } catch (error) {
    log.error(error);
    return;
  }
});

const storedSecondUserRaw = localStorage.getItem(SECOND_USER_KEY);
let jsonParsedSecondUserRaw = null;
if (storedSecondUserRaw) {
  try {
    jsonParsedSecondUserRaw = JSON.parse(storedSecondUserRaw);
  } catch (error) {
    log.error(error);
  }
}
const storedSecondUser = UserSchema.safeParse(jsonParsedSecondUserRaw);
export const secondUserWritable = writable(
  storedSecondUser.success ? storedSecondUser.data : null
);
secondUserWritable.subscribe(async (value) => {
  try {
    const stringValue = value
      ? ((await promisedStringifyJSON(value)) as string)
      : "";
    localStorage.setItem(SECOND_USER_KEY, stringValue);
  } catch (error) {
    log.error(error);
    return;
  }
});

const storedSubscriptionsRaw = localStorage.getItem(SUBSCRIPTIONS_KEY);
let jsonParsedSubscriptionsRaw = null;
if (storedSubscriptionsRaw) {
  try {
    jsonParsedSubscriptionsRaw = JSON.parse(storedSubscriptionsRaw);
  } catch (error) {
    log.error(error);
  }
}
const storedSubscriptions = SubscriptionsListSchema.safeParse(
  jsonParsedSubscriptionsRaw
);
export const subscriptionsWritable = writable(
  storedSubscriptions.success ? storedSubscriptions.data : []
);
subscriptionsWritable.subscribe(async (value) => {
  try {
    const stringValue = (await promisedStringifyJSON(value)) as string;
    localStorage.setItem(SUBSCRIPTIONS_KEY, stringValue);
  } catch (error) {
    log.error(error);
    return;
  }
});

const primaryChannelRaw = localStorage.getItem(PRIMARY_CHANNEL);
export const primaryChannelWritable = writable(
  (primaryChannelRaw ? +primaryChannelRaw : -1) as PrimaryChannel
);
primaryChannelWritable.subscribe((value) => {
  localStorage.setItem(PRIMARY_CHANNEL, String(value));
});

const apiReqDelayRaw = localStorage.getItem(API_REQ_DELAY);
export const apiReqDelayWritable = writable(
  apiReqDelayRaw ? +apiReqDelayRaw : 500
);
apiReqDelayWritable.subscribe((value) => {
  localStorage.setItem(API_REQ_DELAY, String(value));
});
