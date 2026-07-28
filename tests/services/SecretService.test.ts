import { beforeEach, describe, expect, it } from "vitest";
import InvalidPasswordError from "../../src/errors/InvalidPasswordError";
import SecretExpiredError from "../../src/errors/SecretExpiredError";
import SecretNotFoundError from "../../src/errors/SecretNotFoundError";
import ViewLimitExceedError from "../../src/errors/ViewLimitExceedError";
import AESEncryptionProvider from "../../src/providers/AESEncryptionProvider";
import BcryptPasswordHasher from "../../src/providers/BcryptPasswordHasher";
import { FakeStorageProvider } from "../../src/providers/FakeStorageProvider.js";
import InMemorySecretFileRepository from "../../src/repositories/InMemorySecretFileRepository";
import InMemorySecretRepository from "../../src/repositories/InMemorySecretRepository";
import SecretService from "../../src/services/SecretService";
import { Readable } from "node:stream";

describe("SecretService", () => {
  let secretService: SecretService;
  let secretRepository: InMemorySecretRepository;
  let secretFileRepository: InMemorySecretFileRepository;
  let storageProvider: FakeStorageProvider;
  let passwordHasher: BcryptPasswordHasher;
  let encryptionProvider: AESEncryptionProvider;

  beforeEach(() => {
    secretRepository = new InMemorySecretRepository();
    secretFileRepository = new InMemorySecretFileRepository();
    storageProvider = new FakeStorageProvider();
    passwordHasher = new BcryptPasswordHasher();
    encryptionProvider = new AESEncryptionProvider(
      "123456789012345678901234567890123", // 32 chars for AES-256
    );

    secretService = new SecretService(
      secretRepository,
      encryptionProvider,
      passwordHasher,
      storageProvider,
      secretFileRepository,
    );
  });

  describe("createTextSecret", () => {
    it("should create a secret", async () => {
      const secret = await secretService.createTextSecret({
        content: "test content",
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        maxViews: 5,
      });

      expect(secret).toHaveProperty("id");
    });
  });

  describe("getById", () => {
    it("should retrieve a secret by id", async () => {
      const secret = await secretService.createTextSecret({
        content: "test content",
      });

      const retrievedSecret = await secretService.getById(secret.id);

      expect(retrievedSecret).toHaveProperty("content", "test content");
    });

    it("should throw an error if secret is not found", async () => {
      await expect(secretService.getById("non-existent-id")).rejects.toThrow(
        SecretNotFoundError,
      );
    });

    it("should throw an error if secret has expired", async () => {
      const secret = await secretService.createTextSecret({
        content: "test content",
        expiresAt: new Date(Date.now() - 1000),
      });

      await expect(secretService.getById(secret.id)).rejects.toThrow(
        SecretExpiredError,
      );
    });

    it("should throw an error if password is incorrect", async () => {
      const secret = await secretService.createTextSecret({
        content: "test content",
        password: "correctpassword",
      });

      await expect(
        secretService.getById(secret.id, "wrongpassword"),
      ).rejects.toThrow(InvalidPasswordError);
    });

    it("should get secret if password is correct", async () => {
      const secret = await secretService.createTextSecret({
        content: "test content",
        password: "correctpassword",
      });

      const retrievedSecret = await secretService.getById(
        secret.id,
        "correctpassword",
      );

      expect(retrievedSecret).toHaveProperty("content", "test content");
    });

    it("should throw ViewLimitExceedError when max views is reached", async () => {
      const secret = await secretService.createTextSecret({
        content: "test content",
        maxViews: 1,
      });

      await secretService.getById(secret.id);

      await expect(secretService.getById(secret.id)).rejects.toThrow(
        ViewLimitExceedError,
      );
    });
  });

  describe("deleteById", () => {
    it("should delete a secret by id with correct password", async () => {
      const secret = await secretService.createTextSecret({
        content: "test content",
        password: "correctpassword",
      });

      await secretService.deleteById(secret.id, "correctpassword");

      await expect(secretService.getById(secret.id)).rejects.toThrow(
        SecretNotFoundError,
      );
    });

    it("should not delete a secret with incorrect password", async () => {
      const secret = await secretService.createTextSecret({
        content: "test content",
        password: "correctpassword",
      });

      await expect(
        secretService.deleteById(secret.id, "wrongpassword"),
      ).rejects.toThrow(InvalidPasswordError);

      const retrievedSecret = await secretService.getById(
        secret.id,
        "correctpassword",
      );

      expect(retrievedSecret).toHaveProperty("content", "test content");
    });

    it("should throw an error if secret is not found when deleting", async () => {
      await expect(secretService.deleteById("non-existent-id")).rejects.toThrow(
        SecretNotFoundError,
      );
    });

    it("should delete a secret by id", async () => {
      const secret = await secretService.createTextSecret({
        content: "test content",
      });

      await secretService.deleteById(secret.id);

      await expect(secretService.getById(secret.id)).rejects.toThrow(
        SecretNotFoundError,
      );
    });
  });

  describe("createFileSecret", () => {
    it("should create a file secret", async () => {
      const secret = await secretService.createFileSecret({
        fileName: "test.txt",
        contentType: "text/plain",
        size: 12,
        stream: Readable.from(["Hello World"]),
      });

      expect(secret.id).toBeDefined();
    });

    it("should upload the file", async () => {
      const secret = await secretService.createFileSecret({
        fileName: "test.txt",
        contentType: "text/plain",
        size: 12,
        stream: Readable.from(["Hello World"]),
      });

      const storedFile = await secretService.getById(secret.id);

      expect(storedFile).toHaveProperty("objectKey");
    });

    it("should save file metadata", async () => {
      const secret = await secretService.createFileSecret({
        fileName: "test.txt",
        contentType: "text/plain",
        size: 12,
        stream: Readable.from(["Hello World"]),
      });

      const file = await secretFileRepository.findBySecretId(secret.id);

      expect(file).not.toBeNull();
      expect(file?.getFileName()).toBe("test.txt");
      expect(file?.getContentType()).toBe("text/plain");
      expect(file?.getSize()).toBe(12);
    });
  });
});
