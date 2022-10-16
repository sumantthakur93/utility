import { ILogger } from "./types";
import getLogger from "./winston-logger";

class BaseLogger implements ILogger {
  private readonly logger = getLogger("info");

  info(message: string): void {
    this.logger.info(message);
  }

  warn(message: string): void {
    this.logger.warn(message);
  }

  debug(message: string): void {
    this.logger.debug(message);
  }

  error(message: string): void {
    this.logger.error(message);
  }
}

export default BaseLogger;
