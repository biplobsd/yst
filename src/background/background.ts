import { type RuntimeMessage, runtime } from "src/utils/communication";
import { AUTH_URL, REDIRECT_URI } from "src/utils/constants";

import log from "src/utils/logger";
import { db } from "./storage";

let isWorking = false;

export async function parseData(
  { status, to, from }: RuntimeMessage,
  sender?: chrome.runtime.MessageSender,
) {
  if (to !== "background") {
    return;
  }

  let tabId: number | undefined;
  if (sender && sender.tab && sender.tab.id) {
    tabId = sender.tab.id;
  }

  log.info(status);

  switch (status.code) {
    case "ready":
      switch (from) {
        case "option":
          await runtime.send({
            tabId,
            to: "option",
            status: {
              code: "accept",
              msg: "Background script is ready",
            },
          });
          break;
        default:
          break;
      }
      break;
    case "getAuthToken":
      if (isWorking) {
        await runtime.send({
          tabId,
          to: "option",
          status: { code: "error", msg: "Background script is working ..." },
        });
      }

      isWorking = true;
      try {
        const clientID = await db.get("clientID");
        if (!clientID) {
          await runtime.send({
            tabId,
            to: "option",
            status: {
              code: "error",
              msg: "Error: Client ID is not set.",
            },
          });
          return;
        }
        const auth_params = {
          client_id: clientID,
          redirect_uri: REDIRECT_URI,
          response_type: "token",
          scope:
            "https://www.googleapis.com/auth/youtube.force-ssl https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/userinfo.profile",
          prompt: "select_account",
        };

        const url = new URLSearchParams(Object.entries(auth_params)).toString();
        const oAuth2Url = AUTH_URL + "?" + url;
        log.info("oAuth2URL", oAuth2Url);

        const redirectTokenUrl = await chrome.identity.launchWebAuthFlow({
          url: oAuth2Url,
          interactive: true,
        });

        if (!redirectTokenUrl) {
          return;
        }
        const tokenMatch = redirectTokenUrl.match(
          /\#(?:access_token)\=([\S\s]*?)\&/,
        );
        if (!tokenMatch) {
          return;
        }
        const token = tokenMatch[1];

        await runtime.send({
          tabId,
          to: "option",
          status: {
            code: "authToken",
            authToken: token,
          },
        });

        return;
      } catch (error) {
        log.error(error);

        try {
          await runtime.send({
            tabId,
            to: "option",
            status: {
              code: "error",
              msg: "Error: Unable to get the OAuth token.",
            },
          });
        } catch (error) {
          log.error(error);
        }
      } finally {
        isWorking = false;
      }
      break;
    default:
      break;
  }
}
