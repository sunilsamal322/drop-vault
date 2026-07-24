import RedisStore, { type RedisReply } from "rate-limit-redis";
import { redis } from "./redis.js";

export const redisRateLimitStore = new RedisStore({
  sendCommand: (...args: string[]) =>
    redis.call(args[0], ...args.slice(1)) as Promise<RedisReply>,
  prefix: "rate-limit:",
});
