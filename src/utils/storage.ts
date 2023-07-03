import { writable } from "svelte/store";
import { CHANNEL_PATHS_KEY, XPATH_VALUES_KEY } from "./constants";
import { z } from "zod";
import log from "./logger";
import { XPathModelSchema, xpathValues } from "./xpaths";

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

export const channelPathsSchema = z.string().array().default([]);

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
