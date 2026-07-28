import { randomUUID } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, unlink } from "node:fs/promises";
import { extname } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { StoredFile, UploadFile } from "../entities/SecretFile.js";
import StorageProvider from "./StorageProvider.js";

export class LocalStorageProvider implements StorageProvider {
  constructor(private readonly uploadDirectory: string) {}

  public async uploadFile(file: UploadFile): Promise<StoredFile> {
    await mkdir(this.uploadDirectory, { recursive: true });

    const objectKey = `${randomUUID()}${extname(file.fileName)}`;

    const filePath = `${this.uploadDirectory}/${objectKey}`;

    await pipeline(file.stream, createWriteStream(filePath));

    return { objectKey };
  }

  public async downloadFile(objectKey: string): Promise<Readable> {
    const filePath = `${this.uploadDirectory}/${objectKey}`;
    return createReadStream(filePath);
  }

  public async deleteFile(objectKey: string): Promise<void> {
    const filePath = `${this.uploadDirectory}/${objectKey}`;
    await unlink(filePath);
  }
}
