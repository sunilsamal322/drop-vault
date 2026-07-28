import { Readable } from "node:stream";

interface SecretFileProps {
  secretId: string;
  fileName: string;
  objectKey: string;
  createdAt: Date;
  contentType: string;
  size: number;
}

export interface UploadFile {
  fileName: string;
  contentType: string;
  size: number;
  stream: Readable;
}

export interface StoredFile {
  objectKey: string;
}

export default class SecretFile {
  constructor(private readonly props: SecretFileProps) {}

  public getSecretId(): string {
    return this.props.secretId;
  }

  public getFileName(): string {
    return this.props.fileName;
  }

  public getObjectKey(): string {
    return this.props.objectKey;
  }

  public getCreatedAt(): Date {
    return this.props.createdAt;
  }

  public getContentType(): string {
    return this.props.contentType;
  }

  public getSize(): number {
    return this.props.size;
  }
}
