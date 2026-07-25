import { Worker } from "bullmq";
import { bullMqConnection } from "../connection.js";
import { BullMqJobName, BullMqQueue } from "../types.js";
import SecretCleanupJob from "../../jobs/SecretCleanupJob.js";

export function startCleanupWorker(cleanupJob: SecretCleanupJob): Worker {
  return new Worker(
    BullMqQueue.CLEANUP,
    async (job) => {
      switch (job.name) {
        case BullMqJobName.EXPIRED_SECRETS:
          await cleanupJob.run();
          break;

        default:
          throw new Error(`Unknown job: ${job.name}`);
      }
    },
    {
      connection: bullMqConnection,
      // concurrency: 5, // concurrent jobs can be processed at the same time
    },
  );
}
