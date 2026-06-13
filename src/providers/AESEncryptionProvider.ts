import { EncryptedPayload } from "../entities/Secret.js";
import { EncryptionProvider } from "./EncryptionProvider.js";
import crypto from "crypto";

export default class AESEncryptionProvider implements EncryptionProvider {
  private readonly key: Buffer;

  constructor(secretKey: string) {
    this.key = crypto.createHash("sha256").update(secretKey).digest();
  }

  public async encrypt(data: string): Promise<EncryptedPayload> {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", this.key, iv);
    const encrypted = Buffer.concat([
      cipher.update(data, "utf8"),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    return {
      encryptedContent: encrypted.toString("base64"),
      iv: iv.toString("base64"),
      authTag: authTag.toString("base64"),
    };
  }

  public async decrypt(data: EncryptedPayload): Promise<string> {
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      this.key,
      Buffer.from(data.iv, "base64"),
    );

    decipher.setAuthTag(Buffer.from(data.authTag, "base64"));

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(data.encryptedContent, "base64")),
      decipher.final(),
    ]);

    return decrypted.toString("utf8");
  }
}
