import {
  type RuntimeMessage,
  runtimeMessageSchema,
  runtime,
} from "src/utils/communication";
import { AUTH_URL, REDIRECT_URI } from "src/utils/constants";

import log from "src/utils/logger";

let isWorking = false;

export async function acceptSignalSend() {
  await runtime.send({
    type: "statusOption",
    status: {
      msg: "[Background script] Ready for accept request",
      code: "accept",
    },
  });
}

export async function parseData(dataLocal: RuntimeMessage) {
  const validationResult = await runtimeMessageSchema.safeParseAsync(dataLocal);

  if (!validationResult.success) {
    log.error("Error when parsing data");
    return;
  }

  const dataParsed = validationResult.data;
  const status = dataParsed.status;
  log.info(status.msg);
  if (dataParsed.type === "status" || dataParsed.type === "statusBackground") {
    switch (status.code) {
      case "ready":
        if (isWorking) {
          await runtime.send({
            type: "statusOption",
            status: {
              code: "error",
              msg: "Background script is working ...",
            },
          });
        } else {
          await acceptSignalSend();
        }
        break;
      case "authToken":
        if (isWorking) {
          await runtime.send({
            type: "statusOption",
            status: { code: "error", msg: "Background script is working ..." },
          });
        }

        isWorking = true;
        try {
          await chrome.identity.clearAllCachedAuthTokens();
          const auth_params = {
            client_id: import.meta.env.VITE_CLIENT_ID,
            redirect_uri: REDIRECT_URI,
            response_type: "token",
            scope:
              "https://www.googleapis.com/auth/youtube.force-ssl https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
            prompt: "select_account",
          };

          const url = new URLSearchParams(
            Object.entries(auth_params)
          ).toString();
          const oAuth2Url = AUTH_URL + "?" + url;
          console.log("oAuth2URL", oAuth2Url);

          const redirectTokenUrl = await chrome.identity.launchWebAuthFlow({
            url: oAuth2Url,
            interactive: true,
          });

          if (!redirectTokenUrl) {
            return;
          }
          const tokenMatch = redirectTokenUrl.match(
            /\#(?:access_token)\=([\S\s]*?)\&/
          );
          if (!tokenMatch) {
            return;
          }
          const token = tokenMatch[1];

          await runtime.send({
            type: "dataOptionAuthToken",
            status: {
              code: "authTokenSuccessful",
              msg: "OAuth Token sending to the option/popup script",
            },
            authToken: token,
          });

          await chrome.identity.clearAllCachedAuthTokens();
          return;
        } catch (error) {
          log.error(error);

          try {
            await runtime.send({
              type: "statusOption",
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
}
