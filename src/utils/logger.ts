interface Logger {
  info: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
  trace: (...args: unknown[]) => void;
}

const noop = () => {};

const log: Logger = import.meta.env.DEV
  ? {
      info: console.info.bind(console, "[YST]"),
      error: console.error.bind(console, "[YST]"),
      warn: console.warn.bind(console, "[YST]"),
      debug: console.debug.bind(console, "[YST]"),
      trace: console.trace.bind(console, "[YST]"),
    }
  : {
      info: noop,
      error: noop,
      warn: noop,
      debug: noop,
      trace: noop,
    };

export default log;
