import type { QueueEvents, Worker } from "bullmq";
import type { Server } from "http";
import { logger } from "../configs/logger.js";
import SecretCleanupScheduler from "../schedulers/SecretCleanupScheduler.js";
import { redis } from "../configs/redis.js";
import { postgres } from "../database/postgres.js";

const SHUTDOWN_TIMEOUT_MS = 10_000;

export function registerShutdown({
  server,
  workers,
  cleanupScheduler,
  queueEvents,
}: {
  server: Server;
  workers: Worker[];
  cleanupScheduler: SecretCleanupScheduler;
  queueEvents: QueueEvents[];
}): void {
  let shutdownInitiated = false;

  async function shutdown(signal: string): Promise<void> {
    if (shutdownInitiated) {
      return;
    }

    shutdownInitiated = true;

    logger.info({ signal }, "Graceful shutdown started");

    const forceShutdownTimeout = setTimeout(() => {
      logger.error("Graceful shutdown timed out");
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);

    server.close(async () => {
      try {
        logger.info("HTTP server closed");

        cleanupScheduler.stop();

        await Promise.all(
          workers.map(async (worker) => {
            await worker.close();

            logger.info(
              {
                worker: worker.name,
              },
              "BullMQ worker closed",
            );
          }),
        );

        await Promise.all(
          queueEvents.map(async (queueEvent) => {
            await queueEvent.close();

            logger.info(
              {
                queue: queueEvent.name,
              },
              "QueueEvents closed",
            );
          }),
        );

        await redis.quit();

        logger.info("Redis connection closed");

        await postgres.end();

        logger.info("PostgreSQL connection closed");

        clearTimeout(forceShutdownTimeout);

        logger.info("Graceful shutdown completed");

        process.exit(0);
      } catch (error) {
        clearTimeout(forceShutdownTimeout);

        logger.error({ err: error }, "Graceful shutdown failed");

        process.exit(1);
      }
    });
  }

  process.on("SIGINT", () => {
    void shutdown("SIGINT");
  });

  process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
  });
}
