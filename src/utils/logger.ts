import pino from "pino";

// create pino logger
const log = pino({
  enabled: import.meta.env.DEV,
  level: "trace",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
});

export default log;
