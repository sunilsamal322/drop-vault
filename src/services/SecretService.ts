import Secret from "../entities/Secret.js";
import { SecretRepository } from "../repositories/SecretRepository.js";

export default class SecretService {
  constructor(private readonly repository: SecretRepository) {}

  public async save(secret: Secret): Promise<Secret> {
    return await this.repository.save(secret);
  }

  public async getById(id: string): Promise<Secret | null> {
    const secret = await this.repository.findById(id);

    if (!secret || secret.isExpired()) {
      return null;
    }

    secret.incrementViewCount();

    await this.repository.update(secret);

    if (secret.hasExceededViewLimit()) {
      return null;
    }

    return secret;
  }

  public async deleteById(id: string): Promise<void> {
    await this.repository.deleteById(id);
  }
}
