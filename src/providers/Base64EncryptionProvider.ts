import { EncryptedPayload } from "../entities/Secret.js";
import { EncryptionProvider } from "./EncryptionProvider.js";

export default class Base64EncryptionProvider implements EncryptionProvider {
  public async encrypt(data: string): Promise<EncryptedPayload> {
    const encryptedContent = Buffer.from(data).toString("base64");
    return {
      encryptedContent,
      iv: "",
      authTag: "",
    };
  }

  public async decrypt(data: EncryptedPayload): Promise<string> {
    return Buffer.from(data.encryptedContent, "base64").toString("utf-8");
  }
}
