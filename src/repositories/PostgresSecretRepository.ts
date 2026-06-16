import { Pool } from "pg";
import Secret from "../entities/Secret.js";
import { SecretRepository } from "./SecretRepository.js";

export default class PostgresSecretRepository implements SecretRepository {
  constructor(private readonly db: Pool) {}

  public async save(secret: Secret): Promise<Secret> {
    const payload = secret.getEncryptedPayload();

    await this.db.query(
      `
    INSERT INTO secrets (
      id,
      type,
      encrypted_content,
      iv,
      auth_tag,
      password_hash,
      view_count,
      max_views,
      created_at,
      expires_at
    )
    VALUES (
      $1,$2,$3,$4,$5,
      $6,$7,$8,$9,$10
    )
    `,
      [
        secret.getId(),
        secret.getType(),
        payload.encryptedContent,
        payload.iv,
        payload.authTag,
        secret.getPasswordHash(),
        secret.getViewCount(),
        secret.getMaxViews(),
        secret.getCreatedAt(),
        secret.getExpiresAt(),
      ],
    );

    return secret;
  }

  public async findById(id: string): Promise<Secret | null> {
    const result = await this.db.query(
      `
    SELECT * FROM secrets WHERE id = $1
    `,
      [id],
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];

    return new Secret({
      id: row.id,
      type: row.type,
      encryptedContent: row.encrypted_content,
      iv: row.iv,
      authTag: row.auth_tag,
      passwordHash: row.password_hash,
      viewCount: row.view_count,
      maxViews: row.max_views,
      createdAt: row.created_at,
      expiresAt: row.expires_at ?? undefined,
    });
  }

  public async update(secret: Secret): Promise<void> {
    await this.db.query(
      `
    UPDATE secrets
    SET view_count = $1
    WHERE id = $2
    `,
      [secret.getViewCount(), secret.getId()],
    );
  }

  public async deleteById(id: string): Promise<void> {
    await this.db.query(
      `
    DELETE FROM secrets
    WHERE id = $1
    `,
      [id],
    );
  }

  public async incrementViewCountIfAllowed(id: string): Promise<boolean> {
    const result = await this.db.query(
      `
    UPDATE secrets
    SET view_count = view_count + 1
    WHERE id = $1
      AND (
        max_views IS NULL
        OR view_count < max_views
      )
    RETURNING id
    `,
      [id],
    );

    return (result.rowCount ?? 0) > 0;
  }
}
