import { logger } from "../configs/logger.js";
import SecretCleanupJob from "../jobs/SecretCleanupJob.js";
import cron from "node-cron";

export default class SecretCleanupScheduler {
  constructor(private cleanupJob: SecretCleanupJob) {}

  public start(): void {
    try {
      cron.schedule("0 * * * *", async () => {
        await this.cleanupJob.run();
      });
      logger.info("Cleanup cron job completed");
    } catch (error) {
      logger.error({ err: error }, "Cleanup cron job failed");
    }
  }
}
