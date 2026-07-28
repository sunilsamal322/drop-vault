import { Readable } from "node:stream";

export interface CreateFileSecretRequest {
  fileName: string;
  contentType: string;
  size: number;
  stream: Readable;
  password?: string;
  expiresAt?: Date;
  maxViews?: number;
}
