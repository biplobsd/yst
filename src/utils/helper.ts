import { STORIES_URL as SELECTED_URLS } from "./constants";
import { type XPathModel } from "./xpaths";

export type SupportedLangs = Record<string, Record<string, string> | { __same__: string | null }>;

export function isXPathExpressionExists(expression: string): boolean {
  const result = document.evaluate(
    expression,
    document,
    null,
    XPathResult.ANY_TYPE,
    null,
  );
  return result.iterateNext() !== null;
}

export async function delay(ms: number) {
  return await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function isRightSite(isOptions = true) {
  let url: string;
  if (isOptions) {
    const [tab] = await chrome.tabs.query({
      active: true,
      lastFocusedWindow: true,
    });
    if (tab && tab.url) {
      url = tab.url;
    } else {
      url = "";
    }
  } else {
    url = window.location.href;
  }

  if (url.length === 0) {
    return false;
  }

  return SELECTED_URLS.includes(url.slice(0, 24));
}

export function getXpathFromElement(xpath: string) {
  const dom = document.evaluate(
    xpath,
    document,
    null,
    XPathResult.ANY_TYPE,
    null,
  );
  const reactNode = dom.iterateNext();
  if (reactNode && reactNode instanceof HTMLElement) {
    return reactNode;
  } else {
    return undefined;
  }
}

export function getXpathFromElements(xpath: string) {
  const dom = document.evaluate(
    xpath,
    document,
    null,
    XPathResult.ANY_TYPE,
    null,
  );

  const listNodes: HTMLElement[] = [];
  let reactNode = dom.iterateNext();
  while (reactNode) {
    if (reactNode instanceof HTMLElement) {
      listNodes.push(reactNode);
    }
    reactNode = dom.iterateNext();
  }

  if (listNodes.length) {
    return listNodes;
  }

  return undefined;
}

export function addDate(xpathValues: XPathModel) {
  const currentDate = new Date();
  return {
    ...xpathValues,
    UPDATE_DATE: currentDate.toISOString(),
  } as XPathModel;
}

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

export function replaceLangKeys(
  supportedLangs: SupportedLangs,
  lang: string,
  str: string
): string {
  const resolveLang = (language: string): Record<string, string> | null => {
    const entry = supportedLangs[language];
    if (!entry) return null; // Language not found.

    if (typeof entry === "object" && "__same__" in entry) {
      const sameLang = entry.__same__;
      return sameLang ? resolveLang(sameLang) : null; // Resolve the referenced language.
    }

    return entry as Record<string, string>;
  };

  const resolvedLang = resolveLang(lang);
  if (!resolvedLang) {
    console.warn(`Language "${lang}" not found or could not be resolved.`);
    return str;
  }

  return str.replace(/\{\{(.*?)\}\}/g, (match, key) => {
    return resolvedLang[key] || match;
  });
}
