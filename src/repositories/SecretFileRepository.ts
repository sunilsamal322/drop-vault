import SecretFile from "../entities/SecretFile.js";

export interface SecretFileRepository {
  save(secretFile: SecretFile): Promise<SecretFile>;
  findBySecretId(secretId: string): Promise<SecretFile | null>;
  deleteBySecretId(secretId: string): Promise<void>;
}
