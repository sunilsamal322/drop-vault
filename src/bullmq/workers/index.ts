import { startCleanupWorker } from "./cleanupWorker.js";
import SecretCleanupJob from "../../jobs/SecretCleanupJob.js";
import { postgres } from "../../database/postgres.js";
import { logger } from "../../configs/logger.js";
import PostgresSecretRepository from "../../repositories/PostgresSecretRepository.js";
import type { Worker } from "bullmq";

export function startWorkers(): Worker[] {
  const repository = new PostgresSecretRepository(postgres);
  const cleanupJob = new SecretCleanupJob(repository);

  const worker = startCleanupWorker(cleanupJob);

  worker.on("completed", (job) => {
    logger.info(
      {
        jobId: job.id,
        jobName: job.name,
      },
      "Job completed",
    );
  });

  worker.on("failed", (job, error) => {
    logger.error(
      {
        jobId: job?.id,
        jobName: job?.name,
        err: error,
      },
      "Job failed",
    );
  });

  return [worker];
}
