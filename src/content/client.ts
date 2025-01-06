import { runtime, type RuntimeMessage } from "src/utils/communication";
import {
  isXPathExpressionExists,
  getXpathFromElement,
  delay,
  getXpathFromElements,
} from "src/utils/helper";
import log from "src/utils/logger";
import type { XPathModel } from "src/utils/xpaths";

let isRunning: boolean = false;
let stop: boolean = false;
let xpathValues: XPathModel;
let isNotTabRegister = true;

function getAlreadySubscribeXpath(channelID: string) {
  return xpathValues.ALREADY_SUBSCRIBE.replace("{{channelID}}", channelID);
}

function getSubscribeButton(channelID: string) {
  return xpathValues.SUBSCRIBE_BTN.replace("{{channelID}}", channelID);
}

async function searchChannel(channelID: string) {
  const search = getXpathFromElement(
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
    if (!isXPathExpressionExists(xpathValues.NAVIGATION_PROGRESS)) {
      return true;
    }
    if (isNotTabRegister) {
      isNotTabRegister = false;
    }
    await delay(500);
  }
  return false;
}

function isDrawerOpened() {
  if (!isXPathExpressionExists(xpathValues.DRAWER_OPENED)) {
    // Try opening drawer
    const threeLines = getXpathFromElement(xpathValues.THREE_LINES);
    if (!threeLines) {
      runtime.send({
        to: "option",
        status: {
          msg: "Unable to found three lines",
          code: "error",
        },
      });
      return false;
    }
    threeLines.click();
    return false;
  }
  return true;
}

async function isExistAllSubscriptionsButton() {
  const allSubButton = getXpathFromElement(xpathValues.ALL_SUBSCRIPTIONS_BTN);
  if (!allSubButton) {
    await runtime.send({
      to: "option",
      status: {
        msg: "Unable to found all subscription button in drawer",
        code: "error",
      },
    });
    return false;
  }
  allSubButton.click();

  await runtime.send({
    to: "option",
    status: {
      msg: "Please wait for page loading...",
      code: "loading",
    },
  });

  return await waitingForProgressEnd();
}

async function expendedButtonClick() {
  const isAlreadyExpended = isXPathExpressionExists(
    xpathValues.IS_EXPENDEDABLE_EXPENDED,
  );
  if (
    isXPathExpressionExists(xpathValues.IS_EXPENDEDABLE) &&
    !isAlreadyExpended
  ) {
    const expendedItemButton = getXpathFromElement(
      xpathValues.IS_EXPENDEDABLE_EXPENDED_BUTTON,
    );
    if (expendedItemButton) {
      expendedItemButton.click();
    }
    await delay(1000);
    return isXPathExpressionExists(xpathValues.SUB_CHANNELS_EXPENDED_ITEMS);
    
  } else if (
    isAlreadyExpended &&
    isXPathExpressionExists(xpathValues.SUB_CHANNELS_EXPENDED_ITEMS)
  ) {
    return true;
  }
  return false;
}

async function expendedItemsFound() {
  for (let index = 0; index < 5; index++) {
    if (await isStopping()) {
      return false;
    }
    // checking expendedable
    if (await expendedButtonClick()) {
      return true;
    }
  }
  return false;
}

async function drawerOpening() {
  for (let index = 0; index < 3; index++) {
    if (isDrawerOpened()) {
      return true;
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

async function checking() {
  // checking is drawer open
  if (!(await drawerOpening())) {
    log.info("Drawer not opened");
    // return false;
  }

  if (await isStopping()) {
    return false;
  }

  // checking is there found subscriptions section
  if (!isXPathExpressionExists(xpathValues.SUBSCRIPTIONS_SECTION)) {
    runtime.send({
      to: "option",
      status: {
        msg: "Unable to find Subscriptions lists",
        code: "error",
      },
    });
    return false;
  }

  if (await isStopping()) {
    return false;
  }

  if (!(await expendedItemsFound())) {
    log.info("Expended items not found");
    // return false;
  }

  return !await isStopping();
}


async function changeToAllSubscriptionsPage() {
  const targetURL = 'https://www.youtube.com/feed/channels';
  if (window.location.href === targetURL) {
    return true;
  }

  if (!(await checking())) {
    return false;
  }

  if (await isStopping()) {
    return false;
  }

  return await isExistAllSubscriptionsButton();
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

    if(!(await changeToAllSubscriptionsPage())){
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
  const fullEle = getXpathFromElements(xpathValues.ALL_SUBSCRIPTIONS_ITEMS);

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
    if (isXPathExpressionExists(getAlreadySubscribeXpath(channelID))) {
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
    const subButton = getXpathFromElement(getSubscribeButton(channelID));
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

  if (isXPathExpressionExists(getSubscribeButton(channelID))) {
    await runtime.send({
      to: "option",
      status: {
        msg: `Already unsubscribed - ${channelID}`,
        code: "error",
      },
    });
    return;
  }

  const unSubButton = getXpathFromElement(getAlreadySubscribeXpath(channelID));
  if (unSubButton) {
    unSubButton.click();
    await delay(50);
    for (let index = 0; index < 3; index++) {
      const unSub1 = getXpathFromElement(xpathValues.UNSUB1);
      if (unSub1) {
        unSub1.click();
        await delay(50);
        for (let index = 0; index < 5; index++) {
          const unSub2 = getXpathFromElement(xpathValues.UNSUB2);
          if (unSub2) {
            unSub2.click();
            await delay(50);
            if (isXPathExpressionExists(getSubscribeButton(channelID))) {
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

async function isInEnglishLanguage() {
  const lang = document.documentElement.lang;
  return lang === "en";
}

export async function parseData({ status, to: type }: RuntimeMessage) {
  if (type !== "content") {
    return;
  }

  log.info(status);

  if (status.code !== "stop" && !(await isInEnglishLanguage())) {
    await runtime.send({
      to: "option",
      status: {
        code: "langError",
        msg: "Unfortunately, YST currently only works when the YouTube page language is set to English (US). Please click on your profile icon (in the top right corner) > Language to switch to English (US).",
      },
    });
    return;
  }
  
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
      xpathValues = status.xpathValues;
      await acceptSignalSend();
      break;
    default:
      break;
  }
}
