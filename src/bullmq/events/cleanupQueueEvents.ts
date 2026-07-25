import { QueueEvents } from "bullmq";
import { bullMqConnection } from "../connection.js";
import { BullMqQueue } from "../types.js";
import { logger } from "../../configs/logger.js";

export function startCleanupQueueEvents(): QueueEvents {
  const queueEvents = new QueueEvents(BullMqQueue.CLEANUP, {
    connection: bullMqConnection,
  });

  queueEvents.on("completed", ({ jobId }) => {
    logger.info({ jobId }, "Queue Event: Job completed");
  });

  queueEvents.on("failed", ({ jobId, failedReason }) => {
    logger.error(
      {
        jobId,
        failedReason,
      },
      "Queue Event: Job failed",
    );
  });

  queueEvents.on("active", ({ jobId }) => {
    logger.info({ jobId }, "Queue Event: Job started");
  });

  return queueEvents;
}
