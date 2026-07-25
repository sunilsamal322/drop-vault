// bullmq/connection.ts
import { env } from "../configs/env.js";

export const bullMqConnection = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
};
