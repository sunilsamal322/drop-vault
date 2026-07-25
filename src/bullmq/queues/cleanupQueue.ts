import { Queue } from "bullmq";
import { bullMqConnection } from "../connection.js";
import { BullMqQueue } from "../types.js";

export const cleanupQueue = new Queue(BullMqQueue.CLEANUP, {
  connection: bullMqConnection,
});
