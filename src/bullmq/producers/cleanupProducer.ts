import { cleanupQueue } from "../queues/cleanupQueue.js";
import { BullMqJobName } from "../types.js";

export class CleanupProducer {
  public async enqueueExpiredSecrets(): Promise<void> {
    await cleanupQueue.add(
      BullMqJobName.EXPIRED_SECRETS,
      {},
      {
        attempts: 3,
        backoff: {
          type: "fixed",
          delay: 5000, // 5 seconds delay between retries
        },
        removeOnComplete: 100, // Keep the last 100 completed jobs for debugging
        removeOnFail: 100, // Keep the last 100 failed jobs for debugging
        delay: 3000, // 3 seconds delay before processing the job
        //priority: 1, // Set a priority for the job (lower number = higher priority)
        //jobId: 'cleanup-expired-secrets', // Unique job ID to prevent duplicates
      },
    );
  }
}
