import { SecretTypeEnum } from "../enums/SecretType.js";

interface SecretProps {
  id: string;
  type: SecretTypeEnum;
  encryptedContent: string;
  iv: string;
  authTag: string;
  createdAt: Date;
  viewCount: number;
  expiresAt?: Date;
  maxViews?: number;
}

export interface EncryptedPayload {
  encryptedContent: string;
  iv: string;
  authTag: string;
}

export default class Secret {
  constructor(private readonly props: SecretProps) {}

  public isExpired(): boolean {
    if (!this.props.expiresAt) {
      return false;
    }
    return new Date() > this.props.expiresAt;
  }

  public getId(): string {
    return this.props.id;
  }

  public getEncryptedPayload() {
    return {
      encryptedContent: this.props.encryptedContent,
      iv: this.props.iv,
      authTag: this.props.authTag,
    };
  }

  public incrementViewCount(): void {
    this.props.viewCount++;
  }

  public getViewCount(): number {
    return this.props.viewCount;
  }

  public hasExceededViewLimit(): boolean {
    if (!this.props.maxViews) {
      return false;
    }

    return this.props.viewCount > this.props.maxViews;
  }

  public canBeAccessed(): boolean {
    return !this.isExpired() && !this.hasExceededViewLimit();
  }
}
