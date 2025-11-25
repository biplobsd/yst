import { runtime, type RuntimeMessage } from "src/utils/communication";
import {
  delay,
  getXpathFromElement,
  getXpathFromElements,
  isXPathExpressionExists,
  replaceLangKeys, type SupportedLangs
} from "src/utils/helper";
import log from "src/utils/logger";
import type { XPathModel } from "src/utils/xpaths";

let isRunning: boolean = false;
let stop: boolean = false;
let xpathValues: XPathModel;
let isNotTabRegister = true;
let lang = "en";

function getAlreadySubscribeXpath(channelID: string) {
  return xpathValues.ALREADY_SUBSCRIBE.replace("{{channelID}}", channelID);
}

function getSubscribeButton(channelID: string) {
  return xpathValues.SUBSCRIBE_BTN.replace("{{channelID}}", channelID);
}

function replaceLang(str: string, supportedLangs: SupportedLangs) {
  lang = document.documentElement.lang;
  return replaceLangKeys(supportedLangs, lang, str);
}

function replaceAllLangKeysFlat(xpathValues: XPathModel): XPathModel {
  const updatedValues: Record<string, any> = {};

  for (const [key, value] of Object.entries(xpathValues)) {
    if (typeof value === "string") {
      updatedValues[key] = replaceLang(value, xpathValues.SUPPORTED_LANGS);
    } else {
      updatedValues[key] = value;
    }
  }

  return updatedValues as XPathModel;
}

async function searchChannel(channelID: string) {
  const search = await getXpathFromElement(
    xpathValues.SEARCH_INPUT_QUERY,
  ) as HTMLInputElement;
  if (search) {
    if (isNotTabRegister) {
      search.dispatchEvent(new KeyboardEvent("keypress", { key: "Tab" }));
      await delay(100);
    }
    search.value = channelID;
    search.dispatchEvent(new KeyboardEvent("keydown", { keyCode: 13 }));
    return true;
  }
  return false;
}

async function switchChannel(channelID: string) {
  if (await searchChannel(channelID)) {
    if (await waitingForProgressEnd()) {
      await readySignalSend();
    }
  }
}

async function waitingForProgressEnd() {
  await delay(100);
  for (let index = 0; index < 50; index++) {
    if (!await isXPathExpressionExists(xpathValues.NAVIGATION_PROGRESS)) {
      return true;
    }
    if (isNotTabRegister) {
      isNotTabRegister = false;
    }
    await delay(500);
  }
  return false;
}


async function isStopping() {
  if (stop) {
    await runtime.send({
      to: "option",
      status: {
        msg: "Stop back",
        code: "stop",
      },
    });
    return true;
  }
  return false;
}

async function changeToAllSubscriptionsPage() {
  const targetURL = "https://www.youtube.com/feed/channels";
  if (window.location.href === targetURL) {
    return true;
  }

  window.location.href = targetURL;
  return false;
}

async function collectHref() {
  try {
    isRunning = true;
    await runtime.send({
      to: "option",
      status: {
        msg: "Collecting channel IDs...",
        code: "loading",
      },
    });

    if (!(await changeToAllSubscriptionsPage())) {
      return false;
    }

    if (await isStopping()) {
      return false;
    }

    const channelPaths = await parseHref();
    if (channelPaths) {
      await runtime.send({
        to: "option",
        status: {
          channelIDs: channelPaths,
          code: "channelIDs",
        },
      });
    } else {
      await runtime.send({
        to: "option",
        status: {
          msg: "Channels unable to be detected",
          code: "error",
        },
      });
    }
    return false;
  } finally {
    isRunning = false;
  }
}

function isValidChannelPath(path: string | null) {
  return path && (path.startsWith("/@") || path.startsWith("/channel/"));
}

function removeAtNSlash(path: string) {
  if (path.startsWith("/")) {
    return path.slice(1);
  }
  return path;
}

async function parseHref() {
  const fullEle = await getXpathFromElements(xpathValues.ALL_SUBSCRIPTIONS_ITEMS);

  if (fullEle) {
    const channelsPaths: string[] = [];
    for (let l of fullEle) {
      if (await isStopping()) {
        return undefined;
      }
      const path = l.getAttribute("href");
      if (isValidChannelPath(path)) {
        channelsPaths.push(removeAtNSlash(path!).toLowerCase());
      }
    }
    return channelsPaths;
  }
  return undefined;
}

export async function readySignalSend() {
  // Ready signal
  await runtime.send({
    to: "option",
    status: {
      msg: "Ready for accept request...",
      code: "ready",
    },
  });
}

async function acceptSignalSend() {
  await runtime.send({
    to: "option",
    status: {
      msg: "Ready for accept request...",
      code: "accept",
    },
  });
}

async function isAlreadySubscribe(channelID: string) {
  for (let index = 0; index < 2; index++) {
    if (await isXPathExpressionExists(getAlreadySubscribeXpath(channelID))) {
      return true;
    }
    await delay(500);
  }
  return false;
}

async function subSubNow(channelID: string) {
  if (await isAlreadySubscribe(channelID)) {
    await runtime.send({
      to: "option",
      status: {
        msg: `Already subscribed - ${channelID}`,
        code: "error",
      },
    });
    return;
  }

  for (let index = 0; index < 2; index++) {
    const subButton = await getXpathFromElement(getSubscribeButton(channelID));
    if (subButton) {
      subButton.click();
      break;
    }
    await delay(500);
  }

  if (await isAlreadySubscribe(channelID)) {
    await runtime.send({
      to: "option",
      status: {
        msg: `Channel subscribe successful - ${channelID}`,
        code: "subscribeSuccessful",
      },
    });
    return;
  }

  await runtime.send({
    to: "option",
    status: {
      msg: `Unable to subscribe this channel - ${channelID}`,
      code: "error",
    },
  });
}

async function unSubSubNow(channelID: string) {
  const errorStatus: RuntimeMessage = {
    to: "option",
    status: {
      msg: `Unable to unsubscribe this channel - ${channelID}`,
      code: "error",
    },
  };

  if (await isXPathExpressionExists(getSubscribeButton(channelID))) {
    await runtime.send({
      to: "option",
      status: {
        msg: `Already unsubscribed - ${channelID}`,
        code: "error",
      },
    });
    return;
  }

  const unSubButton = await getXpathFromElement(getAlreadySubscribeXpath(channelID));
  if (unSubButton) {
    unSubButton.click();
    await delay(50);
    for (let index = 0; index < 3; index++) {
      const unSub1 = await getXpathFromElement(xpathValues.UNSUB1);
      if (unSub1) {
        unSub1.click();
        await delay(50);
        for (let index = 0; index < 5; index++) {
          const unSub2 = await getXpathFromElement(xpathValues.UNSUB2);
          if (unSub2) {
            unSub2.click();
            await delay(50);
            if (await isXPathExpressionExists(getSubscribeButton(channelID))) {
              await runtime.send({
                to: "option",
                status: {
                  msg: `Channel unsubscribe successful - ${channelID}`,
                  code: "unsubscribeSuccessful",
                },
              });
            } else {
              await runtime.send(errorStatus);
            }
            return;
          }
          await delay(50);
        }
      }
      await delay(50);
    }
  }

  await runtime.send(errorStatus);
}

async function isInSupportedLanguage() {
  lang = document.documentElement.lang;
  return lang in xpathValues.SUPPORTED_LANGS;
}

export async function parseData({ status, to: type }: RuntimeMessage) {
  if (type !== "content") {
    return;
  }

  log.info(status);

  switch (status.code) {
    case "loading":
      isRunning = true;
      break;
    case "collecting":
      if (isRunning) {
        alert(
          "[Youtube Subscriptions Transfer Extension] Collecting... Wait or Refresh page",
        );
        return;
      }
      await collectHref();
      break;
    case "changeChannelID":
      if (isRunning) {
        alert(
          "[Youtube Subscriptions Transfer Extension] Changing page... Wait or Refresh page",
        );
        return;
      }
      await switchChannel(status.channelID);
      break;
    case "subscribe":
      if (isRunning) {
        alert(
          "[Youtube Subscriptions Transfer Extension] Changing page... Wait or Refresh page",
        );
        return;
      }
      await subSubNow(status.channelID);
      break;
    case "unsubscribe":
      if (isRunning) {
        alert(
          "[Youtube Subscriptions Transfer Extension] Changing page... Wait or Refresh page",
        );
        return;
      }
      await unSubSubNow(status.channelID);
      break;
    case "stop":
      isRunning = false;
      stop = false;
      await isStopping();
      break;
    case "error":
      isRunning = false;
      stop = false;
      break;
    case "ready":
      await readySignalSend();
      break;
    case "xpathValues":
      xpathValues = replaceAllLangKeysFlat(status.xpathValues);
      if (!(await isInSupportedLanguage())) {
        await runtime.send({
          to: "option",
          status: {
            code: "langError",
            msg: "Unfortunately, YST currently only works when the YouTube page language is set to English (US). Please click on your profile icon (in the top right corner) > Language to switch to English (US).",
          },
        });
        return;
      }
      await acceptSignalSend();
      break;
    default:
      break;
  }
}
