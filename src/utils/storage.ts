import { createWritable } from "./core";
import { STORAGE_KEYS } from "./schema";
import { SETTINGS_DEFAULT as ud } from "src/utils/default";

// Channel IDs
export const channelIDsWritable = createWritable(
  STORAGE_KEYS.channelIDs,
  ud.channelIDs,
);

// XPaths
export const xpathsWritable = createWritable(STORAGE_KEYS.XPaths, ud.XPaths);

// Theme mode
export const themeModeWritable = createWritable(
  STORAGE_KEYS.themeMode,
  ud.themeMode,
);

// Working mode
export const workingModeWritable = createWritable(
  STORAGE_KEYS.workingMode,
  ud.workingMode,
);

// First channel oauth token
export const firstOAuthKeyWritable = createWritable(
  STORAGE_KEYS.firstOAuthKey,
  ud.firstOAuthKey,
);

// Second channel oauth token
export const secondOAuthKeyWritable = createWritable(
  STORAGE_KEYS.secondOAuthKey,
  ud.secondOAuthKey,
);

// First user
export const firstUserWritable = createWritable(
  STORAGE_KEYS.firstUser,
  ud.firstUser,
);

// Second user
export const secondUserWritable = createWritable(
  STORAGE_KEYS.secondUser,
  ud.secondUser,
);

// Subscriptions list
export const subscriptionsListWritable = createWritable(
  STORAGE_KEYS.subscriptionsList,
  ud.subscriptionsList,
);

// Primary channel
export const primaryChannelWritable = createWritable(
  STORAGE_KEYS.primaryChannel,
  ud.primaryChannel,
);

// API request delay
export const apiReqDelayWritable = createWritable(
  STORAGE_KEYS.apiReqDelay,
  ud.apiReqDelay,
);
