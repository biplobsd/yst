import { SETTINGS_DEFAULT } from "src/utils/default";
import type { Settings } from "src/utils/schema";

export const db = {
  async get<T extends keyof Settings>(key: T): Promise<Settings[T]> {
    const result = await chrome.storage.sync.get([key]);
    return (result[key] as Settings[T]) ?? SETTINGS_DEFAULT[key];
  },
  async set<T extends keyof Settings>(
    key: T,
    value: Settings[T]
  ): Promise<void> {
    await chrome.storage.sync.set({ [key]: value });
  },
  async getAll(): Promise<Settings> {
    const result = await chrome.storage.sync.get();
    return result as Settings;
  },
};
