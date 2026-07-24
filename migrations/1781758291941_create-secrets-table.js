export const up = (pgm) => {
  pgm.createTable("secrets", {
    id: {
      type: "uuid",
      primaryKey: true,
    },
    type: {
      type: "varchar(50)",
      notNull: true,
    },
    encrypted_content: {
      type: "text",
      notNull: true,
    },
    iv: {
      type: "text",
      notNull: true,
    },
    auth_tag: {
      type: "text",
      notNull: true,
    },
    expires_at: {
      type: "timestamptz",
    },
    max_views: {
      type: "integer",
    },
    view_count: {
      type: "integer",
      notNull: true,
      default: 0,
    },
    password_hash: {
      type: "text",
    },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    updated_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });
};

export const down = (pgm) => {
  pgm.dropTable("secrets");
};
