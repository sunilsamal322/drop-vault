import SecretFile from "../entities/SecretFile.js";
import { SecretFileRepository } from "./SecretFileRepository.js";

export default class InMemorySecretFileRepository implements SecretFileRepository {
  private readonly secretFiles = new Map<string, SecretFile>();

  public async save(secretFile: SecretFile): Promise<SecretFile> {
    this.secretFiles.set(secretFile.getSecretId(), secretFile);
    return secretFile;
  }

  public async findBySecretId(secretId: string): Promise<SecretFile | null> {
    return this.secretFiles.get(secretId) || null;
  }

  public async deleteBySecretId(secretId: string): Promise<void> {
    this.secretFiles.delete(secretId);
  }
}
