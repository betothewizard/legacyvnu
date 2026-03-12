import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const subjectsTable = sqliteTable("subjects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
});

export const questionsTable = sqliteTable("questions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  subjectCode: text("subject_code")
    .notNull()
    .references(() => subjectsTable.code),
  data: text("data").notNull(),
});

export const submissionsTable = sqliteTable("submissions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  subjectCode: text("subject_code")
    .notNull()
    .references(() => subjectsTable.code),
  data: text("data").notNull(),
});

export const documentsTable = sqliteTable("documents", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  tag: text("tag"),
  fileUrl: text("file_url").notNull(),
  downloadCount: integer("download_count").notNull().default(0),
  publishedAt: text("published_at"),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});
