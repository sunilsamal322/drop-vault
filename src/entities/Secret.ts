import { SecretTypeEnum } from "../enums/SecretType.js";

export default class Secret {
  constructor(
    public readonly id: string,
    public readonly type: SecretTypeEnum,
    public readonly createdAt: Date,
    public viewCount: number = 0,
    public readonly expiresAt?: Date,
    public readonly maxViews?: number,
  ) {}

  public isExpired(): boolean {
    if (!this.expiresAt) {
      return false;
    }
    return new Date() > this.expiresAt;
  }

  public incrementViewCount(): void {
    this.viewCount++;
  }

  public getViewCount(): number {
    return this.viewCount;
  }

  public hasExceededViewLimit(): boolean {
    if (!this.maxViews) {
      return false;
    }

    return this.viewCount > this.maxViews;
  }

  public canBeAccessed(): boolean {
    return !this.isExpired() && !this.hasExceededViewLimit();
  }
}
