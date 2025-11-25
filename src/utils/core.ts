import { writable, type Writable } from "svelte/store";

function createListenerFunctions<T>(): {
  callListeners: (eventKey: string, newValue: T) => void;
  addListener: (key: string, listener: (newValue: T) => void) => void;
  removeListener: (key: string, listener: (newValue: T) => void) => void;
} {
  const listeners: Array<{ key: string; listener: (newValue: T) => void }> = [];
  return {
    callListeners(eventKey: string, newValue: T) {
      if (newValue === undefined) {
        return;
      }
      listeners
        .filter(({ key }) => key === eventKey)
        .forEach(({ listener }) => listener(newValue));
    },
    addListener(key: string, listener: (newValue: any) => void) {
      listeners.push({ key, listener });
    },
    removeListener(key: string, listener: (newValue: any) => void) {
      const index = listeners.indexOf({ key, listener });
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    },
  };
}

export interface StorageInterface<T> {
  getValue(key: string): void;
  setValue(key: string, value: T): void;
  deleteValue(key: string): void;
}

export interface SelfUpdateStorageInterface<T> extends StorageInterface<T> {
  addListener(key: string, listener: (newValue: T) => void): void;
  removeListener(key: string, listener: (newValue: T) => void): void;
}

export function createChromeStorage<T>(): SelfUpdateStorageInterface<T> {
  const { removeListener, callListeners, addListener } =
    createListenerFunctions<T>();

  return {
    addListener,
    removeListener,
    getValue(key: string) {
      chrome.storage.sync.get([key], (result) => {
        callListeners(key, result[key] as T);
      });
    },
    setValue(key: string, value: T): void {
      chrome.storage.sync.set({ [key]: value });
    },
    deleteValue(key: string): void {
      chrome.storage.sync.remove(key);
    },
  };
}

export function persist<T>(
  store: Writable<T>,
  storage: SelfUpdateStorageInterface<T>,
  key: string,
): Writable<T> {
  storage.addListener(key, (newValue) => {
    store.set(newValue);
  });

  storage.getValue(key);

  store.subscribe((value) => {
    storage.setValue(key, value);
  });

  return store;
}

export const createWritable = <T>(key: string, defaultValue: T) => {
  return persist(writable(defaultValue), createChromeStorage(), key);
};
