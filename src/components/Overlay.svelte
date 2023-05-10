<script lang="ts">
  import { runtime, storage, type IStorage } from "src/storage";

  import {
    delay,
    getXpathFromElement,
    getXpathFromElements,
    isXPathExpressionExists,
  } from "src/utils/helper";
  import type { XPathModel } from "src/utils/xpaths";

  import { onDestroy, onMount } from "svelte";

  let storageRemoveListener: () => void;
  let isLoading: boolean = false;
  let stop: boolean = false;
  let data: IStorage;
  let xpathValues: XPathModel;

  function isDrawerOpened() {
    if (!isXPathExpressionExists(xpathValues.DRAWER_OPENED)) {
      // Try opening drawer
      const threeLines = getXpathFromElement(xpathValues.THREE_LINES);
      if (!threeLines) {
        runtime.send({
          context: {
            actionType: "status",
            data: {
              status: {
                msg: "Unable to found three lines",
                code: "error",
              },
            },
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
      if (isStoping()) {
        return false;
      }
      // checking expentedable
      if (expendedButtonClick()) {
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

  function isStoping() {
    if (stop) {
      runtime.send({
        context: {
          actionType: "status",
          data: {
            status: {
              msg: "Stop back",
              code: "stop",
            },
          },
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
        context: {
          actionType: "status",
          data: {
            status: {
              msg: "Unable to open drawer",
              code: "error",
            },
          },
        },
      });
      return false;
    }

    if (isStoping()) {
      return false;
    }

    // checking is there found subscriptions section
    if (!isXPathExpressionExists(xpathValues.SUBSCRIPTIONS_SECTION)) {
      runtime.send({
        context: {
          actionType: "status",
          data: {
            status: {
              msg: "Unable to find Subscriptions lists",
              code: "error",
            },
          },
        },
      });
      return false;
    }

    if (isStoping()) {
      return false;
    }

    if (!(await expendedItemsFound())) {
      runtime.send({
        context: {
          actionType: "status",
          data: {
            status: {
              msg: "Unable to expended all lists",
              code: "error",
            },
          },
        },
      });
      return false;
    }

    if (isStoping()) {
      return false;
    }

    return true;
  }

  async function collectHref() {
    try {
      isLoading = true;
      runtime.send({
        context: {
          actionType: "status",
          data: {
            status: {
              msg: "Starting collecting...",
              code: "loading",
            },
          },
        },
      });

      if (!(await checking())) {
        return false;
      }

      if (isStoping()) {
        return false;
      }

      // collecting hrefs
      const channelPaths = parseHref();
      if (channelPaths) {
        runtime.send({
          context: {
            actionType: "option",
            data: {
              channelPaths,
            },
          },
        });
      } else {
        runtime.send({
          context: {
            actionType: "status",
            data: {
              status: {
                msg: "Channels unable to be detected",
                code: "error",
              },
            },
          },
        });
      }

      return false;
    } finally {
      isLoading = false;
    }
  }

  function isValidChannelPath(path: string) {
    return path.startsWith("/@") || path.startsWith("/channel/");
  }

  function removeAtNSlash(path: string) {
    if (path.startsWith("/")) {
      return path.slice(1);
    }
    return path;
  }

  function parseHref() {
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
        if (isStoping()) {
          return undefined;
        }
        const path = l.getAttribute("href");
        if (isValidChannelPath(path)) {
          channelsPaths.push(removeAtNSlash(path));
        }
      }
      return channelsPaths;
    }
    return undefined;
  }

  async function readySignalSend() {
    // Ready signal
    await runtime.send({
      context: {
        actionType: "status",
        data: {
          status: {
            msg: "Ready for accept request",
            code: "ready",
          },
        },
      },
    });
  }

  function newPage(path: string) {
    window.location.href = "https://youtube.com/" + path;
  }

  async function subSubNow() {
    for (let index = 0; index < 2; index++) {
      if (isXPathExpressionExists(xpathValues.ALREADY_SUBSCRIBE)) {
        await readySignalSend();
        return;
      }
      await delay(500);
    }

    for (let index = 0; index < 2; index++) {
      const subButton = getXpathFromElement(xpathValues.SUBSCRIBE_BTN);
      if (subButton) {
        subButton.click();
        break;
      }
      await delay(500);
    }

    await readySignalSend();
  }

  async function unSubSubNow() {
    if (isXPathExpressionExists(xpathValues.SUBSCRIBE_BTN)) {
      await readySignalSend();
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
              return await readySignalSend();
            }

            await delay(500);
          }
        }

        await delay(500);
      }
    }

    runtime.send({
      context: {
        actionType: "status",
        data: {
          status: {
            msg: "Unable to action unsub",
            code: "error",
          },
        },
      },
    });
  }

  function parseData(dataLocal: IStorage) {
    if (dataLocal.context.actionType === "status") {
      switch (dataLocal.context.data.status.code) {
        case "loading":
          isLoading = true;
          break;
        case "collecting":
          if (isLoading) {
            alert("Collecting...");
            return;
          }
          collectHref();
          break;
        case "changepage":
          if (isLoading) {
            alert("Changing page...");
            return;
          }
          newPage(dataLocal.context.data.status.msg);
          break;
        case "subscribe":
          if (isLoading) {
            alert("Changing page...");
            return;
          }
          subSubNow();
          break;
        case "unsubscribe":
          if (isLoading) {
            alert("Changing page...");
            return;
          }
          unSubSubNow();
          break;
        case "stop":
          isLoading = false;
          stop = false;
          break;
        case "error":
          isLoading = false;
          stop = false;
          break;
        default:
          break;
      }
    } else if (dataLocal.context.actionType === "content") {
      if (dataLocal.context.data.status) {
        switch (dataLocal.context.data.status.code) {
          case "stop":
            stop = true;
            break;
          case "ready":
            readySignalSend();
            break;
          case "xpath":
            xpathValues = dataLocal.context.data.xpathValues;
          default:
            break;
        }
      } else {
        data = dataLocal;
      }
    } else if (dataLocal.context.actionType === "option") {
      isLoading = false;
    }
  }

  onMount(() => {
    runtime.selfParseData = parseData;

    storageRemoveListener = runtime.addListener(parseData);
    readySignalSend();
  });

  onDestroy(() => {
    runtime.send({ context: { actionType: "none" } });
    storageRemoveListener();
  });
</script>
