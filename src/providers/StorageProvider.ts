import { Readable } from "node:stream";
import { UploadFile, StoredFile } from "../entities/SecretFile.js";

export default interface StorageProvider {
  uploadFile(file: UploadFile): Promise<StoredFile>;
  downloadFile(objectKey: string): Promise<Readable>;
  deleteFile(objectKey: string): Promise<void>;
}
