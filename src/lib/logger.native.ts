type LogMethod = (message?: any, ...optionalParams: any[]) => void;

const passthrough = (fn: LogMethod) => (...args: any[]) => fn(...args);

export const logger = {
  info: passthrough(console.log),
  warn: passthrough(console.warn),
  error: passthrough(console.error),
};

export default logger;
