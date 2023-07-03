import { STORIES_URL as SELECTED_URLS, XPATH_URL } from "./constants";
import type { XPathModel } from "./xpaths";
import { xPathValuesWritable } from "./storage";

export function isXPathExpressionExists(expression: string): boolean {
  const result = document.evaluate(
    expression,
    document,
    null,
    XPathResult.ANY_TYPE,
    null
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
    null
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
    null
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

export async function fetchXPathUpdate(): Promise<XPathModel | undefined> {
  try {
    const resJson = await (await fetch(XPATH_URL)).json();

    const xpathValues = addDate(resJson);

    xPathValuesWritable.update((current) => {
      return { ...current, ...xpathValues };
    });
    return xpathValues;
  } catch (e) {
    return undefined;
  }
}

export function addDate(xpathValues: XPathModel) {
  const currentDate = new Date();
  return {
    ...xpathValues,
    UPDATE_DATE: currentDate.toISOString(),
  } as XPathModel;
}
