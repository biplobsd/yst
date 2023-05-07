export const SUBSCRIPTIONS_SECTION =
  "//*[contains(normalize-space(), 'Subscriptions')]/following-sibling::div[@id='items']";
export const GET_CHANNELS_WITHOUT_EXPEND = `${SUBSCRIPTIONS_SECTION}/ytd-guide-entry-renderer/a[@href]`;
export const KEY_GET_CHANNELS_IN_EXPEND = `ytd-guide-collapsible-entry-renderer/div/div/ytd-guide-entry-renderer`;
export const SUB_CHANNELS_EXPENDED_ITEMS = `${SUBSCRIPTIONS_SECTION}/${KEY_GET_CHANNELS_IN_EXPEND}`;
export const GET_CHANNELS_IN_EXPEND = `${SUB_CHANNELS_EXPENDED_ITEMS}/a[@href]`;
export const IS_EXPENDEDABLE = `${SUBSCRIPTIONS_SECTION}/ytd-guide-collapsible-entry-renderer`;
export const IS_EXPENDEDABLE_EXPENDED = `${IS_EXPENDEDABLE}[@expanded]`;
export const IS_EXPENDEDABLE_EXPENDED_BUTTON = `${IS_EXPENDEDABLE}/ytd-guide-entry-renderer`;
export const THREE_LINES = '//yt-icon-button[@id="guide-button"]';
export const DRAWER_OPENED = '//div[@id="contentContainer" and @opened]';
export const ALREADY_SUBSCRIBE =
  '//div[@id="inner-header-container"]//div[@id="notification-preference-button" and not(@hidden)]//span[text()="Subscribed"]';
export const SUBSCRIBE_BTN =
  '//div[@id="inner-header-container"]/div/div[@id="subscribe-button"]/ytd-subscribe-button-renderer/yt-smartimation/yt-button-shape[not(@hidden)]/button';
export const UNSUB1 = '//yt-formatted-string[text()="Unsubscribe"]';
export const UNSUB2 = '//button[@aria-label="Unsubscribe"]';
