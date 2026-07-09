import pino from "pino";
import { AsyncLocalStorage } from "node:async_hooks";

export const loggerStorage = new AsyncLocalStorage();

const isProduction = process.env.NODE_ENV === "prod";
const logLevel = process.env.LOG_LEVEL;
const logMethods = new Set(["trace", "debug", "info", "warn", "error", "fatal", "child"]);

const targets = [
    {
      target: "pino/file",
      options: {
          destination: 1
      },
      level: logLevel
    },
    {
      target: "pino-pretty",
      options: {
        destination: "./logs/app.log",
        mkdir: true,
        colorize: false,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
        singleLine: false
      },
      level: logLevel
    }
];

const baseLogger = pino({
    level: logLevel,
    transport: { targets }
});

const logger = new Proxy(baseLogger, {
    get(target, property) {
        if (logMethods.has(property)) {
            const store = loggerStorage.getStore();
            const currentLogger = store && store.logger ? store.logger : target;

            return currentLogger[property].bind(currentLogger);
        }

        return target[property];
    }
});

export default logger;
