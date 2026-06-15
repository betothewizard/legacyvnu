import { integer, sqliteTable, text, index } from "drizzle-orm/sqlite-core";

export const subjectsTable = sqliteTable("subjects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
});

export const questionsTable = sqliteTable(
  "questions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    subjectCode: text("subject_code")
      .notNull()
      .references(() => subjectsTable.code),
    data: text("data").notNull(),
  },
  (table) => [
    index("questions_subject_code_idx").on(table.subjectCode),
  ],
);

export const submissionsTable = sqliteTable(
  "submissions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    subjectCode: text("subject_code")
      .notNull()
      .references(() => subjectsTable.code),
    data: text("data").notNull(),
  },
  (table) => [
    index("submissions_subject_code_idx").on(table.subjectCode),
  ],
);

export const documentsTable = sqliteTable(
  "documents",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    description: text("description"),
    tag: text("tag"),
    fileUrl: text("file_url").notNull(),
    downloadCount: integer("download_count").notNull().default(0),
    publishedAt: text("published_at"),
    createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
  },
  (table) => [
    index("documents_tag_idx").on(table.tag),
    index("documents_published_at_idx").on(table.publishedAt),
  ],
);

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  role: text("role"),
  banned: integer("banned", { mode: "boolean" }),
  banReason: text("ban_reason"),
  banExpires: integer("ban_expires", { mode: "timestamp" }),
});

export const session = sqliteTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
  },
  (table) => [
    index("session_user_id_idx").on(table.userId),
  ],
);

export const account = sqliteTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", {
      mode: "timestamp",
    }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", {
      mode: "timestamp",
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [
    index("account_user_id_idx").on(table.userId),
  ],
);

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const messagesTable = sqliteTable(
  "messages",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    content: text("content").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    recalledAt: integer("recalled_at", { mode: "timestamp" }),
  },
  (table) => [
    index("messages_user_id_idx").on(table.userId),
    index("messages_created_at_idx").on(table.createdAt),
  ],
);

