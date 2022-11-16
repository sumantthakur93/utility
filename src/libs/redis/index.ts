import logger from "../logger";
import { createClient, RedisClientType } from "redis";
import { IRedisConfig } from "./types";

let redisClient: RedisClientType;
let timeToLive: number = 24 * 60 * 3600;

export const openRedisConnection = async ({
  host,
  port,
  ttl,
}: IRedisConfig) => {
  timeToLive = ttl;
  if (redisClient) throw new Error("Redis client is already connected");
  redisClient = createClient({
    socket: {
      host,
      port,
      keepAlive: 5000,
    },
  });

  await redisClient.connect();

  redisClient.on("error", (error) => {
    logger.error(`Error connecting to redis server - ${error}`);
  });

  redisClient.on("ready", () => {
    logger.info(`Redis client connected`);
  });
};

export const getRedisValue = async ({
  key,
}: {
  key: string;
}): Promise<string | undefined> => {
  const value = await redisClient.get(key);
  if (typeof value === "string" && value) {
    return value;
  } else {
    return;
  }
};

export const setRedisValue = async ({
  key,
  value,
}: {
  key: string;
  value: string;
}): Promise<string | undefined> => {
  if (typeof value !== "string" || !value) {
    throw new Error("Invalid value provided");
  }
  if (typeof key !== "string" || !key) {
    throw new Error("Invalid key provided");
  }
  const val = await redisClient.set(key, value);
  redisClient.expire(key, timeToLive);
  return val?.toString();
};
