import { v4 as uuidv4 } from "uuid";
import Secret from "../entities/Secret.js";
import SecretFile from "../entities/SecretFile.js";
import { SecretTypeEnum } from "../enums/SecretType.js";
import InternalServerError from "../errors/InternalServerError.js";
import InvalidPasswordError from "../errors/InvalidPasswordError.js";
import SecretExpiredError from "../errors/SecretExpiredError.js";
import SecretNotFoundError from "../errors/SecretNotFoundError.js";
import ViewLimitExceedError from "../errors/ViewLimitExceedError.js";
import { EncryptionProvider } from "../providers/EncryptionProvider.js";
import { PasswordHasher } from "../providers/PasswordHasher.js";
import StorageProvider from "../providers/StorageProvider.js";
import { SecretFileRepository } from "../repositories/SecretFileRepository.js";
import { SecretRepository } from "../repositories/SecretRepository.js";
import { CreateFileSecretRequest } from "../requests/createFileSecretRequest.js";
import { CreateSecretRequest } from "../requests/CreateSecretRequest.js";

type GetSecretResponse =
  | {
      type: SecretTypeEnum.TEXT;
      content: string;
    }
  | {
      type: SecretTypeEnum.FILE;
      objectKey: string;
    };

export default class SecretService {
  constructor(
    private readonly repository: SecretRepository,
    private readonly encryptionProvider: EncryptionProvider,
    private readonly passwordHasher: PasswordHasher,
    private readonly storageProvider: StorageProvider,
    private readonly secretFileRepository: SecretFileRepository,
  ) {}

  public async createTextSecret(
    request: CreateSecretRequest,
  ): Promise<{ id: string }> {
    const encryptedContent = await this.encryptionProvider.encrypt(
      request.content,
    );

    let passwordHash;
    if (request.password) {
      passwordHash = await this.passwordHasher.hash(request.password);
    }

    const secret = new Secret({
      id: uuidv4(),
      type: SecretTypeEnum.TEXT,
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
  ): Promise<GetSecretResponse> {
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

    const viewCountIncremented =
      await this.repository.incrementViewCountIfAllowed(id);
    if (!viewCountIncremented) {
      throw new ViewLimitExceedError(id);
    }

    if (secret.getType() === SecretTypeEnum.TEXT) {
      const encryptedPayload = secret.getEncryptedPayload();

      if (!encryptedPayload) {
        throw new InternalServerError("Encrypted payload missing");
      }

      const decryptedContent =
        await this.encryptionProvider.decrypt(encryptedPayload);

      return {
        content: decryptedContent,
        type: SecretTypeEnum.TEXT,
      };
    } else {
      const secretFile = await this.secretFileRepository.findBySecretId(id);
      if (!secretFile) {
        throw new InternalServerError("File metadata not found");
      }

      return {
        objectKey: secretFile.getObjectKey(),
        type: SecretTypeEnum.FILE,
      };
    }
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

  public async createFileSecret(
    request: CreateFileSecretRequest,
  ): Promise<{ id: string }> {
    let passwordHash;
    if (request.password) {
      passwordHash = await this.passwordHasher.hash(request.password);
    }

    const secret = new Secret({
      id: uuidv4(),
      type: SecretTypeEnum.FILE,
      createdAt: new Date(),
      viewCount: 0,
      expiresAt: request.expiresAt,
      maxViews: request.maxViews,
      passwordHash: passwordHash,
    });

    const { objectKey } = await this.storageProvider.uploadFile({
      fileName: request.fileName,
      contentType: request.contentType,
      size: request.size,
      stream: request.stream,
    });

    const secretFile = new SecretFile({
      secretId: secret.getId(),
      fileName: request.fileName,
      objectKey: objectKey,
      contentType: request.contentType,
      size: request.size,
      createdAt: new Date(),
    });

    try {
      await this.repository.save(secret);
      await this.secretFileRepository.save(secretFile);
    } catch (error) {
      await this.storageProvider.deleteFile(objectKey);
      throw error;
    }

    return { id: secret.getId() };
  }
}
