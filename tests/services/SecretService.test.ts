import { beforeEach, describe, expect, it } from "vitest";
import SecretService from "../../src/services/SecretService";
import InMemorySecretRepository from "../../src/repositories/InMemorySecretRepository";
import AESEncryptionProvider from "../../src/providers/AESEncryptionProvider";
import BcryptPasswordHasher from "../../src/providers/BcryptPasswordHasher";
import { SecretTypeEnum } from "../../src/enums/SecretType";
import SecretNotFoundError from "../../src/errors/SecretNotFoundError";
import SecretExpiredError from "../../src/errors/SecretExpiredError";
import InvalidPasswordError from "../../src/errors/InvalidPasswordError";
import ViewLimitExceedError from "../../src/errors/ViewLimitExceedError";

describe("SecretService", () => {
  let secretService: SecretService;

  beforeEach(() => {
    secretService = new SecretService(
      new InMemorySecretRepository(),
      new AESEncryptionProvider("123456789012345678901234567890123"), // 32 chars for AES-256
      new BcryptPasswordHasher(),
    );
  });

  it("should create a secret", async () => {
    const secret = await secretService.save({
      content: "test content",
      type: SecretTypeEnum.TEXT,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      maxViews: 5,
    });

    expect(secret).toHaveProperty("id");
  });

  it("should retrieve a secret by id", async () => {
    const secret = await secretService.save({
      content: "test content",
      type: SecretTypeEnum.TEXT,
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
    const secret = await secretService.save({
      content: "test content",
      type: SecretTypeEnum.TEXT,
      expiresAt: new Date(Date.now() - 1000),
    });

    await expect(secretService.getById(secret.id)).rejects.toThrow(
      SecretExpiredError,
    );
  });

  it("should throw an error if password is incorrect", async () => {
    const secret = await secretService.save({
      content: "test content",
      type: SecretTypeEnum.TEXT,
      password: "correctpassword",
    });

    await expect(
      secretService.getById(secret.id, "wrongpassword"),
    ).rejects.toThrow(InvalidPasswordError);
  });

  it("should get secret if password is correct", async () => {
    const secret = await secretService.save({
      content: "test content",
      type: SecretTypeEnum.TEXT,
      password: "correctpassword",
    });

    const retrievedSecret = await secretService.getById(
      secret.id,
      "correctpassword",
    );

    expect(retrievedSecret).toHaveProperty("content", "test content");
  });

  it("should delete a secret by id with correct password", async () => {
    const secret = await secretService.save({
      content: "test content",
      type: SecretTypeEnum.TEXT,
      password: "correctpassword",
    });

    await secretService.deleteById(secret.id, "correctpassword");

    await expect(secretService.getById(secret.id)).rejects.toThrow(
      SecretNotFoundError,
    );
  });

  it("should not delete a secret with incorrect password", async () => {
    const secret = await secretService.save({
      content: "test content",
      type: SecretTypeEnum.TEXT,
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

  it("should throw ViewLimitExceedError when max views is reached", async () => {
    const secret = await secretService.save({
      content: "test content",
      type: SecretTypeEnum.TEXT,
      maxViews: 1,
    });

    await secretService.getById(secret.id);

    await expect(secretService.getById(secret.id)).rejects.toThrow(
      ViewLimitExceedError,
    );
  });

  it("should throw an error if secret is not found when deleting", async () => {
    await expect(secretService.deleteById("non-existent-id")).rejects.toThrow(
      SecretNotFoundError,
    );
  });

  it("should delete a secret by id", async () => {
    const secret = await secretService.save({
      content: "test content",
      type: SecretTypeEnum.TEXT,
    });

    await secretService.deleteById(secret.id);

    await expect(secretService.getById(secret.id)).rejects.toThrow(
      SecretNotFoundError,
    );
  });
});
