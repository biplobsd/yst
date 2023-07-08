import { runtime } from "src/utils/communication";

export async function readySignalSend() {
  // Ready signal
  await runtime.send({
    type: "statusBackground",
    status: {
      msg: "Is the content script ready?",
      code: "ready",
    },
  });
}
