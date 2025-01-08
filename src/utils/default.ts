import type { Settings } from "./schema";
import xpathJson from "../../data/xpaths/v1.8.json";

export const SETTINGS_DEFAULT: Settings = {
  themeMode: "dark",
  channelIDs: [],
  XPaths: { ...xpathJson, REMOTE_DISABLE: false },
  workingMode: "xpath",
  firstOAuthKey: "",
  secondOAuthKey: "",
  firstUser: {
    locale: "",
    name: "",
    picture: "",
    sub: "",
    given_name: "",
  },
  secondUser: {
    locale: "",
    name: "",
    picture: "",
    sub: "",
    given_name: "",
  },
  subscriptionsList: [],
  primaryChannel: "-1",
  apiReqDelay: 500,
  closeTutorial: false,
  clientID: import.meta.env.VITE_CLIENT_ID,
  apiKey: import.meta.env.VITE_API_KEY,
};
