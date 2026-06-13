import Secret from "../entities/Secret.js";
import { EncryptionProvider } from "../providers/EncryptionProvider.js";
import { SecretRepository } from "../repositories/SecretRepository.js";
import { CreateSecretRequest } from "../requests/CreateSecretRequest.js";
import { v4 as uuidv4 } from "uuid";

export default class SecretService {
  constructor(
    private readonly repository: SecretRepository,
    private readonly encryptionProvider: EncryptionProvider,
  ) {}

  public async save(request: CreateSecretRequest): Promise<{ id: string }> {
    const encryptedContent = await this.encryptionProvider.encrypt(
      request.content,
    );

    const secret = new Secret({
      id: uuidv4(),
      type: request.type,
      encryptedContent: encryptedContent.encryptedContent,
      iv: encryptedContent.iv,
      authTag: encryptedContent.authTag,
      createdAt: new Date(),
      viewCount: 0,
      expiresAt: request.expiresAt,
      maxViews: request.maxViews,
    });

    await this.repository.save(secret);
    return { id: secret.getId() };
  }

  public async getById(id: string): Promise<{ content: string } | null> {
    const secret = await this.repository.findById(id);

    if (!secret || secret.isExpired()) {
      return null;
    }

    secret.incrementViewCount();

    await this.repository.update(secret);

    if (secret.hasExceededViewLimit()) {
      return null;
    }

    const decryptedContent = await this.encryptionProvider.decrypt(
      secret.getEncryptedPayload(),
    );

    return {
      content: decryptedContent,
    };
  }

  public async deleteById(id: string): Promise<void> {
    await this.repository.deleteById(id);
  }
}
