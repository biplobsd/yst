import { parseData, readySignalSend } from "./client";
import { runtime } from "src/utils/communication";

runtime.fromMsg = "content";
runtime.addListener(parseData);
readySignalSend();
