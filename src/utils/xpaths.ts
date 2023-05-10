import xpathJson from "../../data/xpath.json";

export interface XPathModel {
  SUBSCRIPTIONS_SECTION: string;
  GET_CHANNELS_WITHOUT_EXPEND: string;
  SUB_CHANNELS_EXPENDED_ITEMS: string;
  GET_CHANNELS_IN_EXPEND: string;
  IS_EXPENDEDABLE: string;
  IS_EXPENDEDABLE_EXPENDED: string;
  IS_EXPENDEDABLE_EXPENDED_BUTTON: string;
  THREE_LINES: string;
  DRAWER_OPENED: string;
  ALREADY_SUBSCRIBE: string;
  SUBSCRIBE_BTN: string;
  UNSUB1: string;
  UNSUB2: string;
  UPDATE_DATE: string;
  REMOTE_DISABLE?: boolean;
}

export function XPathValues(): XPathModel {
  return xpathJson as XPathModel;
}

export const xpathValues = XPathValues();
