import Secret from "../entities/Secret.js";
import { SecretRepository } from "./SecretRepository.js";

export default class InMemorySecretRepository implements SecretRepository {
  private readonly secrets = new Map<string, Secret>();

  public async save(secret: Secret): Promise<Secret> {
    this.secrets.set(secret.getId(), secret);
    return secret;
  }

  public async findById(id: string): Promise<Secret | null> {
    return this.secrets.get(id) || null;
  }

  public async update(secret: Secret): Promise<void> {
    if (this.secrets.has(secret.getId())) {
      this.secrets.set(secret.getId(), secret);
    }
  }

  public async deleteById(id: string): Promise<void> {
    this.secrets.delete(id);
  }

  public async incrementViewCountIfAllowed(id: string): Promise<boolean> {
    const secret = this.secrets.get(id);

    if (!secret) {
      return false;
    }

    if (secret.hasExceededViewLimit()) {
      return false;
    }

    secret.incrementViewCount();

    this.secrets.set(id, secret);

    return true;
  }

  public async deleteExpiredSecrets(): Promise<number> {
    const initialSize = this.secrets.size;
    for (const [id, secret] of this.secrets.entries()) {
      if (secret.isExpired() || secret.hasExceededViewLimit()) {
        this.secrets.delete(id);
      }
    }
    return initialSize - this.secrets.size;
  }
}
