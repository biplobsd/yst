import { xpathValues, type XPathModel } from "./utils/xpaths";

type ActionType = "option" | "content" | "status" | "none" | "save";
type StatusCode =
  | "loading"
  | "collecting"
  | "subscribe"
  | "unsubscribe"
  | "changepage"
  | "error"
  | "stop"
  | "ready"
  | "accept"
  | "xpath";

type Data = {
  status?: { msg: string; code: StatusCode };
  channelPaths?: string[];
  xpathValues?: XPathModel;
};

export type IStorage = {
  context: {
    actionType?: ActionType;
    data?: Data;
  };
};

const defaultStorage: IStorage = {
  context: {
    actionType: "none",
    data: { xpathValues },
  },
};

interface StorageModel {
  get: () => Promise<IStorage>;
  set: (value: IStorage) => Promise<void>;
  update: (value: IStorage) => Promise<boolean>;
  addListener: (change: (change: IStorage) => void) => () => void;
}

interface RuntimeModel {
  fromOption: boolean;
  selfParseData?: (dataLocal: IStorage) => void;
  send: (value: IStorage) => Promise<void>;
  addListener: (change: (change: IStorage) => void) => () => void;
}

export const storage: StorageModel = {
  get: (): Promise<IStorage> =>
    chrome.storage.local.get(defaultStorage) as Promise<IStorage>,
  set: (value: IStorage): Promise<void> => chrome.storage.local.set(value),
  addListener: (change: (change: IStorage) => void) => {
    const handleStorageChanges = function (changes, namespace) {
      const m = defaultStorage;
      for (let key in defaultStorage) {
        m[key] = changes[key].newValue;
      }
      change(m);
    };
    chrome.storage.onChanged.addListener(handleStorageChanges);
    // To remove the listener, call removeListener with the same function reference.
    return () => chrome.storage.onChanged.removeListener(handleStorageChanges);
  },
  update: async function (value: IStorage) {
    try {
      const currentStorageCtx = ((await this.get()) as IStorage).context;
      const currentStgData = currentStorageCtx.data;
      const newData = value.context.data;
      const updated: IStorage = {
        context: {
          ...currentStorageCtx,
          ...value.context,
          data: {
            ...currentStgData,
            ...newData,
          },
        },
      };
      await this.set(updated);
      return true;
    } catch (e) {
      return false;
    }
  },
};

export const runtime: RuntimeModel = {
  fromOption: false,
  send: function (value: IStorage): Promise<void> {
    if (this.selfParseData) {
      this.selfParseData(value);
    }
    if (this.fromOption) {
      // Get the active tab
      chrome.tabs.query(
        { active: true, currentWindow: true },
        async function (tabs) {
          // Send a message to the content script on the active tab
          await chrome.tabs.sendMessage(tabs[0].id, value);
        }
      );
      return;
    }
    return chrome.runtime.sendMessage(value);
  },
  addListener: (change: (change: IStorage) => void) => {
    const handleStorageChanges = function (
      message: IStorage,
      sender,
      sendResponse
    ) {
      change(message);
    };
    chrome.runtime.onMessage.addListener(handleStorageChanges);
    // To remove the listener, call removeListener with the same function reference.
    return () => chrome.runtime.onMessage.removeListener(handleStorageChanges);
  },
};
