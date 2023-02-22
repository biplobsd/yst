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
    }
};
