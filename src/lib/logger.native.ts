type LogMethod = (message?: unknown, ...optionalParams: unknown[]) => void;

const passthrough =
  (fn: LogMethod) =>
  (...args: unknown[]) =>
    fn(...args);

export const logger = {
  info: passthrough(console.log),
  warn: passthrough(console.warn),
  error: passthrough(console.error),
};

export default logger;
