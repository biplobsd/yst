import { STORIES_URL as SELECTED_URLS } from "./constants";

export function isXPathExpressionExists(expression: string): boolean {
    const result = document.evaluate(expression, document, null, XPathResult.ANY_TYPE, null);
    return result.iterateNext() !== null;
}

export async function delay(ms: number) {
    // return await for better async stack trace support in case of errors.
    return await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function isRightSite(isOptions = true) {
    let url: string;
    if (isOptions) {
        const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
        url = tabs[0].url;
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
        return listNodes
    }

    return undefined;
}