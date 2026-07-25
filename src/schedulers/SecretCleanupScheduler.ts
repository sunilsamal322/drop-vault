import cron, { ScheduledTask } from "node-cron";
import { logger } from "../configs/logger.js";
import { CleanupProducer } from "../bullmq/producers/cleanupProducer.js";

export default class SecretCleanupScheduler {
  private task?: ScheduledTask;

  constructor(
    private readonly cleanupProducer: CleanupProducer = new CleanupProducer(),
  ) {}

  public start(): void {
    logger.info("Cleanup scheduler started");

    this.task = cron.schedule("0 * * * *", async () => {
      logger.info("Cron triggered");
      try {
        await this.cleanupProducer.enqueueExpiredSecrets();

        logger.info("Cleanup job queued successfully");
      } catch (error) {
        logger.error({ err: error }, "Failed to enqueue cleanup job");
      }
    });
  }

  public stop(): void {
    this.task?.stop();
    logger.info("Cleanup scheduler stopped");
  }
}
