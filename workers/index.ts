import type { D1Database, R2Bucket } from "@cloudflare/workers-types";
import { and, eq, isNull, like, ne, sql } from "drizzle-orm";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { questionsTable, subjectsTable, submissionsTable, documentsTable } from "./db/schema";
import { PAGE_SIZE } from "./constants";
import { createDb } from "./db";

interface Env {
  DB: D1Database;
  HOCVNU_R2: R2Bucket;
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_CHAT_ID: string;
  TURNSTILE_SECRET_KEY: string;
}

const ALLOWED_ORIGIN = "*";

const app = new Hono<{ Bindings: Env }>().basePath("/api");

app.use(
  "*",
  cors({
    origin: ALLOWED_ORIGIN,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  }),
);

app.get("/hi", (c) => {
  return c.text("Hello");
});

app
  .get("/quizzes/metadata", async (c) => {
    try {
      const db = createDb(c.env.DB);

      const raw = await db
        .select({
          code: questionsTable.subjectCode,
          name: subjectsTable.name,
          data: questionsTable.data,
        })
        .from(questionsTable)
        .innerJoin(
          subjectsTable,
          eq(subjectsTable.code, questionsTable.subjectCode),
        );

      if (!raw) {
        return c.json({ error: "Subjects not found" });
      }

      const metadata = raw.map((row) => {
        const parsedQuestions = JSON.parse(row.data);
        return {
          code: row.code,
          name: row.name,
          total: parsedQuestions.length,
        };
      });

      return c.json(metadata);
    } catch (e) {
      console.error(e);
      return c.json({ error: e }, 500);
    }
  })
  .get("/subject/:subjectCode/quizzes", async (c) => {
    try {
      const db = createDb(c.env.DB);

      const subjectCode = c.req.param("subjectCode");
      const subject = await db.query.subjectsTable.findFirst({
        where: eq(subjectsTable.code, subjectCode),
      });
      if (!subject) {
        return c.json({ error: "Subject not found" });
      }

      const result = await db.query.questionsTable.findFirst({
        where: eq(questionsTable.subjectCode, subjectCode),
        columns: { data: true },
      });
      const allQuestions = result?.data;
      if (!allQuestions) {
        return c.json({ error: "Questions not found" });
      }

      const parsedQuestions = JSON.parse(allQuestions);

      const page = +(c.req.query("page") || "0");
      const totalPages = Math.ceil(parsedQuestions.length / PAGE_SIZE);
      if (page < 0 || page >= totalPages) {
        return c.json({ error: "Invalid page" });
      }

      const start = page * PAGE_SIZE;
      const end = start + PAGE_SIZE;
      const questions = parsedQuestions.slice(start, end);

      return c.json({ questions, meta: { page, totalPages } });
    } catch (e) {
      console.error(e);
      return c.json({ error: e }, 500);
    }
  })
  .post("/subject/:subjectCode/submit", async (c) => {
    try {
      const db = createDb(c.env.DB);
      const subjectCode = c.req.param("subjectCode");
      const body = await c.req.json();

      const subject = await db.query.subjectsTable.findFirst({
        where: eq(subjectsTable.code, subjectCode),
      });
      console.log({ subject });
      if (!subject) {
        return c.json({ error: "Subject not found" }, 400);
      }

      const result = await db.query.submissionsTable.findFirst({
        columns: {
          data: true,
        },
        where: eq(submissionsTable.subjectCode, subjectCode),
      });
      const submissions = result?.data;
      if (!submissions) {
        return c.json({ error: "Submissions not found" }, 500);
      }
      const parsedSubmissions = JSON.parse(submissions);

      body.forEach((element: { id: number; selectedAnswerIndex: number }) => {
        parsedSubmissions[element.id][element.selectedAnswerIndex]++;
      });

      console.log({ submissions, parsedSubmissions });

      await db
        .update(submissionsTable)
        .set({ data: JSON.stringify(parsedSubmissions) })
        .where(eq(submissionsTable.subjectCode, subjectCode));

      return c.json({ message: "Submit successfully" }, 200);
    } catch (e) {
      console.error(e);
      return c.json({ error: e }, 500);
    }
  });

app.post("/upload", async (c) => {
  const formData = await c.req.formData();
  const files = formData.getAll("file") as unknown as File[];
  const turnstileToken = formData.get("turnstileToken") as string;

  if (!files || files.length === 0) {
    return c.json({ error: "No file uploaded" }, 400);
  }

  if (!turnstileToken) {
    return c.json({ error: "Turnstile token is required" }, 400);
  }

  // Verify Turnstile token
  const turnstileVerification = await verifyTurnstileToken(
    turnstileToken,
    c.env.TURNSTILE_SECRET_KEY,
  );

  if (!turnstileVerification.success) {
    return c.json({ error: "Security verification failed" }, 403);
  }

  const uploadedFileNames: string[] = [];
  const clientIp = c.req.raw.headers.get("CF-Connecting-IP") || "Unknown IP";
  const userAgent = c.req.raw.headers.get("User-Agent") || "Unknown User-Agent";
  const detailsBlock =
    `\n📡 <b>IP:</b> ${clientIp}` +
    `\n🖥️ <b>User-Agent:</b> <code>${userAgent}</code>`;

  try {
    for (const file of files) {
      const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9_.-]/g, "_");
      await c.env.HOCVNU_R2.put(sanitizedFilename, await file.arrayBuffer(), {
        httpMetadata: {
          contentType: file.type,
        },
      });

      uploadedFileNames.push(sanitizedFilename);
    }

    let message = "<b>✅ File Upload Success!</b>\n";
    if (uploadedFileNames.length === 1) {
      message += `File <code>${uploadedFileNames[0]}</code> uploaded successfully.`;
    } else {
      message += `Multiple files uploaded successfully:\n`;
      uploadedFileNames.forEach((name) => {
        message += `- <code>${name}</code>\n`;
      });
    }
    message += detailsBlock;

    c.executionCtx.waitUntil(
      sendTelegramNotification(
        c.env.TELEGRAM_BOT_TOKEN,
        c.env.TELEGRAM_CHAT_ID,
        message,
      ),
    );

    return c.json({ message: "Files uploaded successfully" });
  } catch (e) {
    console.error(e);
    let errorMessage = `<b>❌ File Upload Failed!</b>\nError: ${
      e instanceof Error ? e.message : String(e)
    }`;
    errorMessage += detailsBlock;

    c.executionCtx.waitUntil(
      sendTelegramNotification(
        c.env.TELEGRAM_BOT_TOKEN,
        c.env.TELEGRAM_CHAT_ID,
        errorMessage,
      ),
    );

    return c.json({ error: "Failed to upload files" }, 500);
  }
});

app.post("/feedback", async (c) => {
  const formData = await c.req.formData();
  const feedback = formData.get("feedback") as string;
  const contact = formData.get("contact") as string;
  const images = formData.getAll("images") as File[];

  if (!feedback || !feedback.trim()) {
    return c.json({ error: "Feedback is required" }, 400);
  }

  const clientIp = c.req.raw.headers.get("CF-Connecting-IP") || "Unknown IP";
  const userAgent = c.req.raw.headers.get("User-Agent") || "Unknown User-Agent";

  let message =
    `<b>💬 New Feedback Received!</b>\n\n` + `<b>Content:</b>\n${feedback}\n\n`;

  if (contact) {
    message += `📞 <b>Contact:</b> ${contact}\n\n`;
  }

  message +=
    `📡 <b>IP:</b> ${clientIp}\n` +
    `🖥️ <b>User-Agent:</b> <code>${userAgent}</code>`;

  try {
    // Send text message first
    await sendTelegramNotification(
      c.env.TELEGRAM_BOT_TOKEN,
      c.env.TELEGRAM_CHAT_ID,
      message,
    );

    // Send images if any
    if (images && images.length > 0) {
      c.executionCtx.waitUntil(
        sendTelegramImages(
          c.env.TELEGRAM_BOT_TOKEN,
          c.env.TELEGRAM_CHAT_ID,
          images,
        ),
      );
    }

    return c.json({ message: "Feedback submitted successfully" });
  } catch (e) {
    console.error(e);
    return c.json({ error: "Failed to submit feedback" }, 500);
  }
});

// --- Documents ---
const DOCS_PAGE_SIZE = 10;

app
  .get("/documents/tags", async (c) => {
    try {
      const db = createDb(c.env.DB);
      const rows = await db
        .select({
          tag: documentsTable.tag,
          count: sql<number>`count(*)`,
        })
        .from(documentsTable)
        .groupBy(documentsTable.tag)
        .orderBy(sql`count(*) desc`);
      return c.json(rows);
    } catch (e) {
      console.error(e);
      return c.json({ error: e }, 500);
    }
  })
  .get("/documents/slugs", async (c) => {
    try {
      const db = createDb(c.env.DB);
      const rows = await db
        .select({ slug: documentsTable.slug })
        .from(documentsTable);
      return c.json(rows.map((r) => r.slug));
    } catch (e) {
      console.error(e);
      return c.json({ error: e }, 500);
    }
  })
  .get("/documents/:slug", async (c) => {
    try {
      const db = createDb(c.env.DB);
      const slug = c.req.param("slug");

      const doc = await db.query.documentsTable.findFirst({
        where: eq(documentsTable.slug, slug),
      });
      if (!doc) return c.json({ error: "Document not found" }, 404);

      // Related: same tag, different slug, limit 4
      const related = await db
        .select({
          slug: documentsTable.slug,
          title: documentsTable.title,
          tag: documentsTable.tag,
          downloadCount: documentsTable.downloadCount,
        })
        .from(documentsTable)
        .where(
          and(
            doc.tag ? eq(documentsTable.tag, doc.tag) : isNull(documentsTable.tag),
            ne(documentsTable.slug, slug),
          ),
        )
        .limit(4);

      return c.json({ doc, related });
    } catch (e) {
      console.error(e);
      return c.json({ error: e }, 500);
    }
  })
  .get("/documents", async (c) => {
    try {
      const db = createDb(c.env.DB);
      const tag = c.req.query("tag") || "";
      const search = c.req.query("search") || "";
      const page = Math.max(0, +(c.req.query("page") || "0"));

      const conditions = [];
      if (tag) conditions.push(eq(documentsTable.tag, tag));
      if (search) conditions.push(like(documentsTable.title, `%${search}%`));

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const [countRow] = await db
        .select({ count: sql<number>`count(*)` })
        .from(documentsTable)
        .where(where);

      const total = countRow?.count ?? 0;
      const totalPages = Math.ceil(total / DOCS_PAGE_SIZE);

      const docs = await db
        .select({
          slug: documentsTable.slug,
          title: documentsTable.title,
          description: documentsTable.description,
          tag: documentsTable.tag,
          downloadCount: documentsTable.downloadCount,
          publishedAt: documentsTable.publishedAt,
        })
        .from(documentsTable)
        .where(where)
        .orderBy(sql`${documentsTable.publishedAt} desc`)
        .limit(DOCS_PAGE_SIZE)
        .offset(page * DOCS_PAGE_SIZE);

      return c.json({ docs, meta: { page, totalPages, total } });
    } catch (e) {
      console.error(e);
      return c.json({ error: e }, 500);
    }
  })
  .post("/documents/:slug/download", async (c) => {
    try {
      const db = createDb(c.env.DB);
      const slug = c.req.param("slug");

      const doc = await db.query.documentsTable.findFirst({
        where: eq(documentsTable.slug, slug),
        columns: { fileUrl: true },
      });
      if (!doc) return c.json({ error: "Document not found" }, 404);

      await db
        .update(documentsTable)
        .set({ downloadCount: sql`${documentsTable.downloadCount} + 1` })
        .where(eq(documentsTable.slug, slug));

      return c.json({ fileUrl: doc.fileUrl });
    } catch (e) {
      console.error(e);
      return c.json({ error: e }, 500);
    }
  });

app.notFound((c) => {
  return c.json({ error: "Not found" }, 404);
});

async function sendTelegramNotification(
  botToken: string,
  chatId: string,
  message: string,
): Promise<void> {
  console.log({ botToken, chatId, message });
  if (!botToken || !chatId) {
    console.warn(
      "Telegram bot token or chat ID is missing. Skipping notification.",
    );
    return;
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(
        "Failed to send Telegram notification:",
        response.status,
        errorData,
      );
    } else {
      console.log("Telegram notification sent successfully.");
    }
  } catch (error) {
    console.error("Error sending Telegram notification:", error);
  }
}

async function verifyTurnstileToken(
  token: string,
  secretKey: string,
): Promise<{ success: boolean }> {
  const url = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        secret: secretKey,
        response: token,
      }),
    });

    const data = await response.json();
    return { success: data.success };
  } catch (error) {
    console.error("Error verifying Turnstile token:", error);
    return { success: false };
  }
}

async function sendTelegramImages(
  botToken: string,
  chatId: string,
  images: File[],
): Promise<void> {
  if (!botToken || !chatId) {
    console.warn(
      "Telegram bot token or chat ID is missing. Skipping image upload.",
    );
    return;
  }

  const url = `https://api.telegram.org/bot${botToken}/sendPhoto`;

  for (const image of images) {
    try {
      const formData = new FormData();
      formData.append("chat_id", chatId);
      formData.append("photo", image);

      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(
          "Failed to send Telegram image:",
          response.status,
          errorData,
        );
      } else {
        console.log("Telegram image sent successfully.");
      }
    } catch (error) {
      console.error("Error sending Telegram image:", error);
    }
  }
}

export default app;
