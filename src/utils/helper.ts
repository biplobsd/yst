import { STORIES_URL } from "./constants";

export function isXPathExpressionExists(expression: string): boolean {
    const result = document.evaluate(expression, document, null, XPathResult.ANY_TYPE, null);
    return result.iterateNext() !== null;
}

export async function delay(ms: number) {
    // return await for better async stack trace support in case of errors.
    return await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function isStorySite(isOptions = true) {
    let url: string;
    if (isOptions) {
        const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
        url = tabs[0].url;

    } else {
        url = window.location.href;
    }
    return STORIES_URL.includes(url.slice(0, 33));
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