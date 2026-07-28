import StorageProvider from "./StorageProvider.js";
import { Readable } from "node:stream";
import { UploadFile, StoredFile } from "../entities/SecretFile.js";

export class FakeStorageProvider implements StorageProvider {
  async uploadFile(file: UploadFile): Promise<StoredFile> {
    return {
      objectKey: "test-object-key",
    };
  }

  async downloadFile(objectKey: string): Promise<Readable> {
    throw new Error("Not implemented");
  }

  async deleteFile(objectKey: string) {}
}
