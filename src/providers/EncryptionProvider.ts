import { EncryptedPayload } from "../entities/Secret.js";

export interface EncryptionProvider {
  encrypt(data: string): Promise<EncryptedPayload>;
  decrypt(data: EncryptedPayload): Promise<string>;
}