import { logger } from "../configs/logger.js";
import { SecretRepository } from "../repositories/SecretRepository.js";

export default class SecretCleanupJob {
  constructor(private readonly repository: SecretRepository) {}

  public async run(): Promise<void> {
    const deletedCount = await this.repository.deleteExpiredSecrets();
    logger.info(`SecretCleanupJob: Deleted ${deletedCount} expired secrets.`);
  }
}
