import { createLogger, format, transports } from "winston";
const { combine, splat, timestamp, printf } = format;

const formatter = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}] : ${message}`;
  if (metadata) {
    msg += JSON.stringify(metadata);
  }
  return msg;
});

type LogLevel = "info" | "error" | "warn" | "debug";

const getLogger = (level: LogLevel) => {
  return createLogger({
    level,
    format: combine(format.colorize(), splat(), timestamp(), formatter),
    transports: [new transports.Console({ level })],
  });
};

export default getLogger;
