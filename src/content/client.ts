import {
  runtime,
  type RuntimeMessage,
  runtimeMessageSchema,
} from "src/utils/communication";
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

function isDrawerOpened() {
  if (!isXPathExpressionExists(xpathValues.DRAWER_OPENED)) {
    // Try opening drawer
    const threeLines = getXpathFromElement(xpathValues.THREE_LINES);
    if (!threeLines) {
      runtime.send({
        type: "status",
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

async function expendedButtonClick() {
  const isAlreadyExpended = isXPathExpressionExists(
    xpathValues.IS_EXPENDEDABLE_EXPENDED
  );
  if (
    isXPathExpressionExists(xpathValues.IS_EXPENDEDABLE) &&
    !isAlreadyExpended
  ) {
    const expendedItemButton = getXpathFromElement(
      xpathValues.IS_EXPENDEDABLE_EXPENDED_BUTTON
    );
    if (expendedItemButton) {
      expendedItemButton.click();
    }
    await delay(1000);
    if (isXPathExpressionExists(xpathValues.SUB_CHANNELS_EXPENDED_ITEMS)) {
      return true;
    }
    return false;
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
      type: "statusOption",
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
    runtime.send({
      type: "status",
      status: {
        msg: "[Ignored error] Unable to open drawer",
        code: "message",
      },
    });
    // return false;
  }

  if (await isStopping()) {
    return false;
  }

  // checking is there found subscriptions section
  if (!isXPathExpressionExists(xpathValues.SUBSCRIPTIONS_SECTION)) {
    runtime.send({
      type: "status",
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
    runtime.send({
      type: "status",
      status: {
        msg: "[Ignored error] Unable to expended all lists",
        code: "message",
      },
    });
    // return false;
  }

  if (await isStopping()) {
    return false;
  }

  return true;
}

async function collectHref() {
  try {
    isRunning = true;
    await runtime.send({
      type: "status",
      status: {
        msg: "Collecting channel IDs...",
        code: "loading",
      },
    });

    if (!(await checking())) {
      return false;
    }

    if (await isStopping()) {
      return false;
    }

    // collecting href
    const channelPaths = await parseHref();
    if (channelPaths) {
      await runtime.send({
        type: "dataOption",
        status: {
          msg: "Channel IDs data",
          code: "channelIDs",
        },
        channelPaths,
      });
    } else {
      await runtime.send({
        type: "status",
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
  const rawChannelsWithoutExpend = getXpathFromElements(
    xpathValues.GET_CHANNELS_WITHOUT_EXPEND
  );

  if (rawChannelsWithoutExpend) {
    let rawChannelsWithExpend: HTMLElement[] = [];
    const rawcwe = getXpathFromElements(xpathValues.GET_CHANNELS_IN_EXPEND);
    if (isXPathExpressionExists(xpathValues.IS_EXPENDEDABLE) && rawcwe) {
      rawChannelsWithExpend = rawcwe;
    }

    const channelsPaths: string[] = [];
    const fullEle = rawChannelsWithoutExpend.concat(rawChannelsWithExpend);
    for (let l of fullEle) {
      if (await isStopping()) {
        return undefined;
      }
      const path = l.getAttribute("href");
      if (isValidChannelPath(path)) {
        channelsPaths.push(removeAtNSlash(path!));
      }
    }
    return channelsPaths;
  }
  return undefined;
}

export async function readySignalSend() {
  // Ready signal
  await runtime.send({
    type: "statusOption",
    status: {
      msg: "Ready for accept request",
      code: "ready",
    },
  });
}

async function acceptSignalSend() {
  await runtime.send({
    type: "statusOption",
    status: {
      msg: "Ready for accept request",
      code: "accept",
    },
  });
}

function newPage(path: string) {
  window.location.href = "https://youtube.com/" + path;
}

async function isAlreadySubscribe() {
  for (let index = 0; index < 2; index++) {
    if (isXPathExpressionExists(xpathValues.ALREADY_SUBSCRIBE)) {
      return true;
    }
    await delay(500);
  }
  return false;
}

async function subSubNow(channelID: string) {
  if (await isAlreadySubscribe()) {
    await runtime.send({
      type: "statusOption",
      status: {
        msg: `Already subscribed - ${channelID}`,
        code: "error",
      },
    });
    return;
  }

  for (let index = 0; index < 2; index++) {
    const subButton = getXpathFromElement(xpathValues.SUBSCRIBE_BTN);
    if (subButton) {
      subButton.click();
      break;
    }
    await delay(500);
  }

  if (await isAlreadySubscribe()) {
    await runtime.send({
      type: "statusOption",
      status: {
        msg: `Channel subscribe successful - ${channelID}`,
        code: "subscribeSuccessful",
      },
    });
    return;
  }

  await runtime.send({
    type: "statusOption",
    status: {
      msg: `Unable to subscribe this channel - ${channelID}`,
      code: "error",
    },
  });
}

async function unSubSubNow(channelID: string) {
  const errorStatus: RuntimeMessage = {
    type: "statusOption",
    status: {
      msg: `Unable to unsubscribe this channel - ${channelID}`,
      code: "error",
    },
  };

  if (isXPathExpressionExists(xpathValues.SUBSCRIBE_BTN)) {
    await runtime.send({
      type: "statusOption",
      status: {
        msg: `Already unsubscribed - ${channelID}`,
        code: "error",
      },
    });
    return;
  }

  const unSubButton = getXpathFromElement(xpathValues.ALREADY_SUBSCRIBE);
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
            if (isXPathExpressionExists(xpathValues.SUBSCRIBE_BTN)) {
              await runtime.send({
                type: "statusOption",
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
          await delay(500);
        }
      }
      await delay(500);
    }
  }

  await runtime.send(errorStatus);
}

export async function parseData(dataLocal: RuntimeMessage) {
  const validationResult = await runtimeMessageSchema.safeParseAsync(dataLocal);

  if (!validationResult.success) {
    log.error("Error when parsing data");
    return;
  }

  const dataParsed = validationResult.data;
  const status = dataParsed.status;
  log.info(status.msg);
  if (dataParsed.type === "status" || dataParsed.type === "statusContent") {
    switch (status.code) {
      case "loading":
        isRunning = true;
        break;
      case "collecting":
        if (isRunning) {
          alert(
            "[Youtube Subscriptions Transfer Extension] Collecting... Wait or Refresh page"
          );
          return;
        }
        await collectHref();
        break;
      case "changePage":
        if (isRunning) {
          alert(
            "[Youtube Subscriptions Transfer Extension] Changing page... Wait or Refresh page"
          );
          return;
        }
        newPage(status.msg);
        break;
      case "subscribe":
        if (isRunning) {
          alert(
            "[Youtube Subscriptions Transfer Extension] Changing page... Wait or Refresh page"
          );
          return;
        }
        await subSubNow(status.msg);
        break;
      case "unsubscribe":
        if (isRunning) {
          alert(
            "[Youtube Subscriptions Transfer Extension] Changing page... Wait or Refresh page"
          );
          return;
        }
        await unSubSubNow(status.msg);
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
      default:
        break;
    }
  } else if (dataParsed.type === "dataContent") {
    switch (status.code) {
      case "xpath":
        xpathValues = dataParsed.xpathValues;
        await acceptSignalSend();
        break;
      default:
        break;
    }
  }
}
