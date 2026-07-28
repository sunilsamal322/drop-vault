import { SecretTypeEnum } from "../enums/SecretType.js";

export interface CreateSecretRequest {
  content: string;
  password?: string;
  expiresAt?: Date;
  maxViews?: number;
}
