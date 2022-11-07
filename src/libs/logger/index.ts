import BaseLogger from "./base";
import ProductionLogger from "./production";
import { Environment, ILogger } from "./types";

let logger: ILogger = new BaseLogger();

export function setLogger(newLogger: ILogger) {
  logger = newLogger;
}

export const setEnvironment = (env: Environment) => {
  if (env === "production") logger = new ProductionLogger();
  logger = new BaseLogger();
};

export * from "./types";
export default logger;
