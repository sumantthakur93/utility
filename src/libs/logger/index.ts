import BaseLogger from "./base";
import ProductionLogger from "./production";
import { ILogger } from "./types";

let logger: ILogger = new BaseLogger();
if (process.env.NODE_ENV === "production") logger = new ProductionLogger();

export function setLogger(newLogger: ILogger) {
  logger = newLogger;
}

export * from "./types";
export default logger;
