type IStorage = {
    isWindowOpen: boolean;
};

const defaultStorage: IStorage = {
    isWindowOpen: false,
};

export const storage = {
    get: (): Promise<IStorage> =>
        chrome.storage.sync.get(defaultStorage) as Promise<IStorage>,
    set: (value: IStorage): Promise<void> => chrome.storage.sync.set(value),
};
