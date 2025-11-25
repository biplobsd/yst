import { SELECTED_URLS } from "./constants";
import { type XPathModel } from "./xpaths";

export type SupportedLangs = Record<
  string,
  Record<string, string> | { __same__: string | null }
>;

const xpathCache = new Map<string, HTMLElement | undefined>();

export async function isXPathExpressionExists(
  expression: string,
  contextNode: Node = document,
): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const result = document.evaluate(
        expression,
        contextNode,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null,
      );
      resolve(result.singleNodeValue !== null);
    } catch (e) {
      console.error(`Invalid XPath expression: ${expression}`, e);
      resolve(false);
    }
  });
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

  return url.startsWith("https://www.youtube.com/feed/channels");
}

export async function getXpathFromElement(
  xpath: string,
  contextNode: Node = document,
): Promise<HTMLElement | undefined> {
  if (xpathCache.has(xpath)) {
    return xpathCache.get(xpath);
  }

  return new Promise((resolve) => {
    try {
      const dom = document.evaluate(
        xpath,
        contextNode,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null,
      );

      const reactNode = dom.singleNodeValue;
      const result = reactNode instanceof HTMLElement ? reactNode : undefined;

      xpathCache.set(xpath, result);

      resolve(result);
    } catch (e) {
      console.error(`Invalid XPath: ${xpath}`, e);
      resolve(undefined);
    }
  });
}

export async function getXpathFromElements(
  xpath: string,
  contextNode: Node = document,
): Promise<HTMLElement[] | undefined> {
  return new Promise((resolve) => {
    try {
      const dom = document.evaluate(
        xpath,
        contextNode,
        null,
        XPathResult.ORDERED_NODE_ITERATOR_TYPE,
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

      resolve(listNodes.length > 0 ? listNodes : undefined);
    } catch (e) {
      console.error(`Invalid XPath: ${xpath}`, e);
      resolve(undefined);
    }
  });
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
  str: string,
): string {
  const resolveLang = (language: string): Record<string, string> | null => {
    const entry = supportedLangs[language];
    if (!entry) return null;

    if (typeof entry === "object" && "__same__" in entry) {
      const sameLang = entry.__same__;
      return sameLang ? resolveLang(sameLang) : null;
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
