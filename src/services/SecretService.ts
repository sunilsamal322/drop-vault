import Secret from "../entities/Secret.js";
import InvalidPasswordError from "../errors/InvalidPasswordError.js";
import SecretExpiredError from "../errors/SecretExpiredError.js";
import SecretNotFoundError from "../errors/SecretNotFoundError.js";
import ViewLimitExceedError from "../errors/ViewLimitExceedError.js";
import { EncryptionProvider } from "../providers/EncryptionProvider.js";
import { PasswordHasher } from "../providers/PasswordHasher.js";
import { SecretRepository } from "../repositories/SecretRepository.js";
import { CreateSecretRequest } from "../requests/CreateSecretRequest.js";
import { v4 as uuidv4 } from "uuid";

export default class SecretService {
  constructor(
    private readonly repository: SecretRepository,
    private readonly encryptionProvider: EncryptionProvider,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  public async save(request: CreateSecretRequest): Promise<{ id: string }> {
    const encryptedContent = await this.encryptionProvider.encrypt(
      request.content,
    );

    let passwordHash;
    if (request.password) {
      passwordHash = await this.passwordHasher.hash(request.password);
    }

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
      passwordHash: passwordHash,
    });

    await this.repository.save(secret);
    return { id: secret.getId() };
  }

  public async getById(
    id: string,
    password?: string,
  ): Promise<{ content: string } | null> {
    const secret = await this.repository.findById(id);

    if (!secret) {
      throw new SecretNotFoundError(id);
    }

    if (secret.isExpired()) {
      throw new SecretExpiredError(id);
    }

    const passwordHash = secret.getPasswordHash();
    if (!password && passwordHash) {
      throw new InvalidPasswordError("Password required to access this secret");
    }

    if (password && passwordHash) {
      const isPasswordValid = await this.passwordHasher.compare(
        password,
        passwordHash,
      );
      if (!isPasswordValid) {
        throw new InvalidPasswordError("Invalid password");
      }
    }

    secret.incrementViewCount();

    await this.repository.update(secret);

    if (secret.hasExceededViewLimit()) {
      throw new ViewLimitExceedError(id);
    }

    const decryptedContent = await this.encryptionProvider.decrypt(
      secret.getEncryptedPayload(),
    );

    return {
      content: decryptedContent,
    };
  }

  public async deleteById(id: string, password?: string): Promise<void> {
    const secret = await this.repository.findById(id);

    if (!secret) {
      throw new SecretNotFoundError(id);
    }

    const passwordHash = secret.getPasswordHash();
    if (!password && passwordHash) {
      throw new InvalidPasswordError("Password required to access this secret");
    }

    if (password && passwordHash) {
      const isPasswordValid = await this.passwordHasher.compare(
        password,
        passwordHash,
      );
      if (!isPasswordValid) {
        throw new InvalidPasswordError("Invalid password");
      }
    }

    await this.repository.deleteById(id);
  }
}
