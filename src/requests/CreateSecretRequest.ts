import { SecretTypeEnum } from "../enums/SecretType.js";

export interface CreateSecretRequest {
  type: SecretTypeEnum;
  content: string;
  password?: string;
  expiresAt?: Date;
  maxViews?: number;
}
