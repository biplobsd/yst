<script lang="ts">
  import { runtime, storage, type IStorage } from "src/storage";

  import {
    delay,
    getXpathFromElement,
    getXpathFromElements,
    isXPathExpressionExists,
  } from "src/utils/helper";

  import {
    ALREADY_SUBSCRIBE,
    DRAWER_OPENED,
    EXPENDED_ITEM_BUTTON,
    GET_CHANNELS,
    IS_EXPENDEDABLE,
    SUBSCRIBE_BTN,
    SUB_CHANNELS_EXPENDED_ITEMS,
    SUB_CHANNELS_ITEMS,
    THREE_LINES,
  } from "src/utils/xpaths";
  import { onDestroy, onMount } from "svelte";

  let storageRemoveListener: () => void;
  let isLoading: boolean = false;
  let stop: boolean = false;
  let data: IStorage;

  function isDrawerOpened() {
    if (!isXPathExpressionExists(DRAWER_OPENED)) {
      // Try opening drawer
      const threeLines = getXpathFromElement(THREE_LINES);
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

  function expendedButtonClick() {
    if (isXPathExpressionExists(IS_EXPENDEDABLE)) {
      const expendedItemButton = getXpathFromElement(EXPENDED_ITEM_BUTTON);
      if (expendedItemButton) {
        expendedItemButton.click();
      }
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
      if (!expendedButtonClick()) {
        return true;
      }
      await delay(1000);
      if (isXPathExpressionExists(SUB_CHANNELS_EXPENDED_ITEMS)) {
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
    if (!isXPathExpressionExists(SUB_CHANNELS_ITEMS)) {
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
        1;
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
    const rawChannels = getXpathFromElements(GET_CHANNELS);
    if (rawChannels) {
      const channelsPaths: string[] = [];
      for (let l of rawChannels) {
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
    if (isXPathExpressionExists(ALREADY_SUBSCRIBE)) {
      await readySignalSend();
      return;
    }

    const subButton = getXpathFromElement(SUBSCRIBE_BTN);
    if (subButton) {
      subButton.click();
    }

    await readySignalSend();
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
        case "stop":
          isLoading = false;
          stop = false;
          break;
        case "error":
          isLoading = false;
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
