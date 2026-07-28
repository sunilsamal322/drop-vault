import { SecretFileRepository } from "./SecretFileRepository.js";
import SecretFile from "../entities/SecretFile.js";
import { Pool } from "pg";

export default class PostgresSecretFileRepository implements SecretFileRepository {
  constructor(private readonly db: Pool) {}

  public async save(secretFile: SecretFile): Promise<SecretFile> {
    await this.db.query(
      `
      INSERT INTO secret_files (
        secret_id,
        file_name,
        object_key,
        created_at,
        content_type,
        size
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [
        secretFile.getSecretId(),
        secretFile.getFileName(),
        secretFile.getObjectKey(),
        secretFile.getCreatedAt(),
        secretFile.getContentType(),
        secretFile.getSize(),
      ],
    );

    return secretFile;
  }

  public async findBySecretId(secretId: string): Promise<SecretFile | null> {
    const result = await this.db.query(
      `
      SELECT * FROM secret_files WHERE secret_id = $1
      `,
      [secretId],
    );

    if (result.rows.length > 0) {
      const row = result.rows[0];
      return new SecretFile({
        secretId: row.secret_id,
        fileName: row.file_name,
        objectKey: row.object_key,
        createdAt: row.created_at,
        contentType: row.content_type,
        size: row.size,
      });
    }

    return null;
  }

  public async deleteBySecretId(secretId: string): Promise<void> {
    await this.db.query(
      `
      DELETE FROM secret_files WHERE secret_id = $1
      `,
      [secretId],
    );
  }
}
