import { logger } from "../configs/logger.js";
import SecretCleanupJob from "../jobs/SecretCleanupJob.js";
import cron from "node-cron";

export default class SecretCleanupScheduler {
  constructor(private cleanupJob: SecretCleanupJob) {}

  public start(): void {
    logger.info("Cleanup scheduler started");
    cron.schedule("0 * * * *", async () => {
      try {
        await this.cleanupJob.run();
      } catch (error) {
        logger.error({ err: error }, "Cleanup job failed");
      }
    });
  }
}
