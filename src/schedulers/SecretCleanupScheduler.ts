import cron from "node-cron";
import { logger } from "../configs/logger.js";
import { CleanupProducer } from "../bullmq/producers/cleanupProducer.js";

export default class SecretCleanupScheduler {
  constructor(
    private readonly cleanupProducer: CleanupProducer = new CleanupProducer(),
  ) {}

  public start(): void {
    logger.info("Cleanup scheduler started");

    cron.schedule("0 * * * *", async () => {
      logger.info("Cron triggered");
      try {
        await this.cleanupProducer.enqueueExpiredSecrets();

        logger.info("Cleanup job queued successfully");
      } catch (error) {
        logger.error({ err: error }, "Failed to enqueue cleanup job");
      }
    });
  }
}
