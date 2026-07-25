import { cleanupQueue } from "../queues/cleanupQueue.js";
import { BullMqJobName } from "../types.js";

export class CleanupProducer {
  public async enqueueExpiredSecrets(): Promise<void> {
    await cleanupQueue.add(BullMqJobName.EXPIRED_SECRETS, {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
    });
  }
}
