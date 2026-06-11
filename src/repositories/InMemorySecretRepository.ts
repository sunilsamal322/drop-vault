import Secret from "../entities/Secret.js";
import { SecretRepository } from "./SecretRepository.js";

export default class InMemorySecretRepository implements SecretRepository {
  private readonly secrets = new Map<string, Secret>();

  public async save(secret: Secret): Promise<Secret> {
    this.secrets.set(secret.id, secret);
    return secret;
  }

  public async findById(id: string): Promise<Secret | null> {
    return this.secrets.get(id) || null;
  }

  public async update(secret: Secret): Promise<void> {
    if (this.secrets.has(secret.id)) {
      this.secrets.set(secret.id, secret);
    }
  }

  public async deleteById(id: string): Promise<void> {
    this.secrets.delete(id);
  }
}
