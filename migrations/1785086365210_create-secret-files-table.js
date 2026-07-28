export const up = (pgm) => {
  pgm.createTable("secret_files", {
    secret_id: {
      type: "uuid",
      notNull: true,
      primaryKey: true,
      references: "secrets(id)",
      onDelete: "CASCADE",
    },
    file_name: {
      type: "varchar(255)",
      notNull: true,
    },
    object_key: {
      type: "text",
      notNull: true,
      unique: true,
    },
    content_type: {
      type: "text",
      notNull: true,
    },
    size: {
      type: "bigint",
      notNull: true,
    },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });
};

export const down = (pgm) => {
  pgm.dropTable("secret_files");
};
