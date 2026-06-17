import Secret from "../entities/Secret.js";

export interface SecretRepository {
  save(secret: Secret): Promise<Secret>;
  findById(id: string): Promise<Secret | null>;
  update(secret: Secret): Promise<void>;
  deleteById(id: string): Promise<void>;
  incrementViewCountIfAllowed(id: string): Promise<boolean>;
  deleteExpiredSecrets(): Promise<number>;
}
