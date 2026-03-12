/**
 * Crawl documents from tailieuvnu.com (WordPress REST API),
 * download files from Google Drive or download.tailieuvnu.com,
 * upload to Cloudflare R2, and insert metadata into Cloudflare D1.
 *
 * Usage:
 *   pnpm tsx scripts/crawl-documents.ts [--wipe]
 *
 * Env vars required (in .env or shell):
 *   CLOUDFLARE_ACCOUNT_ID
 *   CLOUDFLARE_API_TOKEN   (R2 write + D1 write permissions)
 *   R2_BUCKET_NAME         (default: hocvnu-r2)
 *   R2_PUBLIC_URL          (e.g. https://pub-xxxx.r2.dev  — trailing slash not needed)
 *   D1_DATABASE_ID         (from wrangler.json: 35da43a6-78ff-499a-a442-9b4f909606ee)
 *
 * Behaviour:
 *   - Fetches ALL posts from tailieuvnu.com WP REST API (no category filter)
 *   - Assigns tag from the post's categories array via CATEGORY_ID_TO_TAG map (first match),
 *     or null if no whitelisted category matches
 *   - Extracts Google Drive file ID or download.tailieuvnu.com URL from post content HTML
 *   - Downloads file, detects extension from magic bytes then Content-Type
 *   - Uploads to R2 under key  documents/{slug}.{ext}
 *   - Inserts row into D1 documents table; skips if slug already exists
 *   - Writes crawl-report.json, crawl-skipped.json, crawl-errors.json on exit
 *   --wipe: delete all D1 rows + all R2 objects under documents/ before crawling
 */

import fs from "fs";
import path from "path";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const WP_BASE = "https://tailieuvnu.com/wp-json/wp/v2";
const PER_PAGE = 100;

// Whitelisted category slugs → tags stored in D1
const CATEGORY_ID_TO_TAG: Record<number, string> = {
  8: "dai-hoc-cong-nghe",
  17: "dai-hoc-khtn",
  18: "dai-hoc-khxhnv",
  19: "dai-hoc-kinh-te",
  11: "dai-hoc-ngoai-ngu",
  21: "dai-hoc-y-duoc",
  22: "khoa-luat",
  221: "giao-trinh-chung",
  374: "tai-lieu-chung",
  375: "de-cuong-chung",
  420: "tieng-anh-vstep",
};

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID!;
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN!;
const R2_BUCKET = process.env.R2_BUCKET_NAME ?? "hocvnu-r2";
const R2_PUBLIC_URL = (process.env.R2_PUBLIC_URL ?? "").replace(/\/$/, "");
const D1_DB_ID = process.env.D1_DATABASE_ID ?? "35da43a6-78ff-499a-a442-9b4f909606ee";

if (!ACCOUNT_ID || !API_TOKEN || !R2_PUBLIC_URL) {
  console.error(
    "Missing required env vars: CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, R2_PUBLIC_URL",
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WpPost {
  id: number;
  slug: string;
  date: string; // ISO 8601
  title: { rendered: string };
  content: { rendered: string };
  categories: number[];
  tags: number[];
  excerpt: { rendered: string };
}

interface CrawlResult {
  slug: string;
  title: string;
  status: "inserted" | "skipped" | "error";
  reason?: string;
  postUrl?: string;
  contentHtml?: string; // only for skipped — for manual inspection
}

// ---------------------------------------------------------------------------
// WordPress helpers
// ---------------------------------------------------------------------------

async function fetchAllPosts(): Promise<WpPost[]> {
  let page = 1;
  const all: WpPost[] = [];

  while (true) {
    const url = `${WP_BASE}/posts?per_page=${PER_PAGE}&page=${page}&_fields=id,slug,date,title,content,categories,tags,excerpt`;
    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 400) break; // page out of range
      throw new Error(`WP fetch failed: ${res.status} ${url}`);
    }
    const posts: WpPost[] = await res.json();
    if (posts.length === 0) break;
    all.push(...posts);
    const totalPages = Number(res.headers.get("x-wp-totalpages") ?? "1");
    console.log(`  [WP] page=${page}/${totalPages} (+${posts.length}, total=${all.length})`);
    if (page >= totalPages) break;
    page++;
  }

  return all;
}

/** Extract the first Google Drive file ID from HTML content */
function extractDriveFileId(html: string): string | null {
  // Patterns:
  //   /file/d/{id}/view
  //   /open?id={id}
  //   id={id}  (inside uc?export=download)
  const patterns = [
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]{20,})/,
    /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]{20,})/,
    /drive\.google\.com\/uc\?[^"']*id=([a-zA-Z0-9_-]{20,})/,
    /docs\.google\.com\/[^"']*\/d\/([a-zA-Z0-9_-]{20,})/,
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m) return m[1];
  }
  return null;
}

/** Extract a direct download.tailieuvnu.com URL from HTML content */
function extractTailieuvnuUrl(html: string): string | null {
  const m = html.match(/href="(https:\/\/download\.tailieuvnu\.com\/[^"]+)"/);
  return m ? m[1] : null;
}

/** Download a file directly from a URL (no redirect acrobatics needed) */
async function downloadDirect(
  url: string,
): Promise<{ buffer: Buffer; ext: string } | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`    [Direct] HTTP ${res.status} for ${url}`);
      return null;
    }
    const ct = res.headers.get("content-type") ?? "";
    const raw = await res.arrayBuffer();
    const buffer = Buffer.from(raw);
    const ext = detectExt(buffer, ct);
    return { buffer, ext };
  } catch (e) {
    console.warn(`    [Direct] fetch error: ${e}`);
    return null;
  }
}

/** Strip HTML tags, decode basic HTML entities, trim */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

// ---------------------------------------------------------------------------
// Google Drive download
// ---------------------------------------------------------------------------

const CONTENT_TYPE_TO_EXT: Record<string, string> = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/msword": "doc",
  "application/vnd.ms-powerpoint": "ppt",
  "application/vnd.ms-excel": "xls",
  "application/zip": "zip",
  "application/x-zip-compressed": "zip",
  "application/octet-stream": "bin",
};

function extFromContentType(ct: string): string {
  const base = ct.split(";")[0].trim().toLowerCase();
  return CONTENT_TYPE_TO_EXT[base] ?? "bin";
}

/**
 * Detect file type from magic bytes (first few bytes of the file).
 * Returns a known extension or null if unrecognised.
 *
 * Magic bytes reference:
 *   PDF:  %PDF  → 25 50 44 46
 *   ZIP:  PK    → 50 4B 03 04  (docx/pptx/xlsx are ZIP-based)
 *   DOC/PPT/XLS (legacy OLE):  D0 CF 11 E0
 */
function extFromMagicBytes(buf: Buffer): string | null {
  if (buf.length < 8) return null;

  // PDF
  if (buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46) {
    return "pdf";
  }

  // ZIP-based (Office Open XML: docx, pptx, xlsx)
  if (buf[0] === 0x50 && buf[1] === 0x4b && buf[2] === 0x03 && buf[3] === 0x04) {
    // Can't distinguish docx/pptx/xlsx from magic bytes alone without inspecting the ZIP.
    // Default to docx — most documents on tailieuvnu are Word files.
    // The viewer handles all three the same way (Office Online).
    return "docx";
  }

  // Legacy OLE2 compound document (doc, ppt, xls)
  if (
    buf[0] === 0xd0 && buf[1] === 0xcf && buf[2] === 0x11 && buf[3] === 0xe0 &&
    buf[4] === 0xa1 && buf[5] === 0xb1 && buf[6] === 0x1a && buf[7] === 0xe1
  ) {
    return "doc";
  }

  return null;
}

/**
 * Determine extension: prefer magic bytes over Content-Type,
 * fallback to Content-Type, fallback to "bin".
 */
function detectExt(buf: Buffer, contentType: string): string {
  const fromMagic = extFromMagicBytes(buf);
  if (fromMagic) return fromMagic;
  const fromCt = extFromContentType(contentType);
  if (fromCt !== "bin") return fromCt;
  return "bin";
}

/**
 * Download a file from Google Drive.
 * Returns { buffer, ext } or null if download fails / is a virus-scan page.
 */
async function downloadFromDrive(
  fileId: string,
): Promise<{ buffer: Buffer; ext: string } | null> {
  const directUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

  // Drive may redirect through a confirmation page for large files.
  // We follow up to 5 redirects manually to capture cookies.
  let url = directUrl;
  let response: Response | null = null;
  let cookies = "";

  for (let attempt = 0; attempt < 10; attempt++) {
    response = await fetch(url, {
      redirect: "manual",
      headers: cookies ? { Cookie: cookies } : {},
    });

    const setCookie = response.headers.get("set-cookie");
    if (setCookie) {
      // Accumulate cookies (important for the confirmation bypass)
      const newCookies = setCookie
        .split(/,(?=[^;]+=[^;]+)/)
        .map((c) => c.split(";")[0].trim())
        .join("; ");
      cookies = cookies ? `${cookies}; ${newCookies}` : newCookies;
    }

    if (response.status === 301 || response.status === 302 || response.status === 303) {
      const location = response.headers.get("location");
      if (!location) return null;
      url = location;
      continue;
    }

    if (response.status === 200) {
      const ct = response.headers.get("content-type") ?? "";

      // If we got an HTML page, Drive is showing a confirmation / virus warning.
      // Extract the confirm token and retry.
      if (ct.includes("text/html")) {
        const html = await response.text();
        const confirmMatch = html.match(/confirm=([a-zA-Z0-9_-]+)/);
        if (confirmMatch) {
          url = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=${confirmMatch[1]}`;
          continue;
        }
        // Check for the newer "download_warning" cookie approach
        const warningCookie = cookies.match(/download_warning_[^=]+=([a-zA-Z0-9_-]+)/);
        if (warningCookie) {
          url = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=${warningCookie[1]}`;
          continue;
        }
        // Cannot extract confirm — give up
        console.warn(`    [Drive] Got HTML for fileId=${fileId}, cannot bypass`);
        return null;
      }

      const raw = await response.arrayBuffer();
      const buffer = Buffer.from(raw);
      const ext = detectExt(buffer, ct);
      return { buffer, ext };
    }

    // 403, 404, etc.
    console.warn(`    [Drive] HTTP ${response.status} for fileId=${fileId}`);
    return null;
  }

  return null;
}

// ---------------------------------------------------------------------------
// Cloudflare R2 upload (via REST API)
// ---------------------------------------------------------------------------

async function uploadToR2(key: string, buffer: Buffer, contentType: string): Promise<void> {
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/r2/buckets/${R2_BUCKET}/objects/${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      "Content-Type": contentType,
    },
    body: new Uint8Array(buffer),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`R2 upload failed: ${res.status} ${text}`);
  }
}

// ---------------------------------------------------------------------------
// Cloudflare D1 helpers
// ---------------------------------------------------------------------------

async function d1Query(sql: string, params: (string | number | null)[] = []): Promise<unknown> {
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${D1_DB_ID}/query`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sql, params }),
  });
  const json: any = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(`D1 query failed: ${JSON.stringify(json.errors ?? json)}`);
  }
  return json.result;
}

async function slugExistsInD1(slug: string): Promise<boolean> {
  const result: any = await d1Query(
    "SELECT id FROM documents WHERE slug = ? LIMIT 1",
    [slug],
  );
  return (result?.[0]?.results?.length ?? 0) > 0;
}

async function insertDocument(doc: {
  slug: string;
  title: string;
  description: string | null;
  tag: string | null;
  fileUrl: string;
  publishedAt: string;
}): Promise<void> {
  await d1Query(
    `INSERT INTO documents (slug, title, description, tag, file_url, download_count, published_at, created_at)
     VALUES (?, ?, ?, ?, ?, 0, ?, datetime('now'))`,
    [doc.slug, doc.title, doc.description, doc.tag, doc.fileUrl, doc.publishedAt],
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function wipeAll() {
  console.log("=== WIPE MODE ===");

  // 1. Clear D1
  console.log("Deleting all rows from D1 documents table...");
  await d1Query("DELETE FROM documents", []);
  console.log("D1 cleared.");

  // 2. Delete all R2 objects under documents/
  console.log("Listing R2 objects under documents/...");
  let cursor: string | undefined;
  let totalDeleted = 0;

  while (true) {
    const params = new URLSearchParams({ prefix: "documents/" });
    if (cursor) params.set("cursor", cursor);

    const listRes = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/r2/buckets/${R2_BUCKET}/objects?${params}`,
      { headers: { Authorization: `Bearer ${API_TOKEN}` } },
    );
    const listJson: any = await listRes.json();
    if (!listRes.ok || !listJson.success) {
      throw new Error(`R2 list failed: ${JSON.stringify(listJson.errors)}`);
    }

    const objects: { key: string }[] = Array.isArray(listJson.result) ? listJson.result : [];
    if (objects.length === 0) break;

    // Delete in batches via individual DELETEs (CF REST API has no batch delete)
    for (const obj of objects) {
      const delRes = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/r2/buckets/${R2_BUCKET}/objects/${encodeURIComponent(obj.key)}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${API_TOKEN}` } },
      );
      if (!delRes.ok) {
        console.warn(`  Failed to delete ${obj.key}: ${delRes.status}`);
      } else {
        totalDeleted++;
        process.stdout.write(`  Deleted ${obj.key}\n`);
      }
    }

    cursor = listJson.result_info?.cursor;
    if (!cursor || !listJson.result_info?.is_truncated) break;
  }

  console.log(`R2 cleared. ${totalDeleted} objects deleted.`);
  console.log("Wipe complete. Re-run without --wipe to crawl.");
}

async function main() {
  if (process.argv.includes("--wipe")) {
    await wipeAll();
    return;
  }

  const report: CrawlResult[] = [];

  // Output directory for raw post dumps
  const logsDir = path.resolve("crawl-logs");
  fs.mkdirSync(logsDir, { recursive: true });

  console.log("\n[Fetching ALL posts from tailieuvnu.com WP REST API]");
  let posts: WpPost[];
  try {
    posts = await fetchAllPosts();
  } catch (e) {
    console.error(`Fatal: failed to fetch posts: ${e}`);
    process.exit(1);
  }

  console.log(`  Total posts fetched: ${posts.length}`);

  // Save complete raw posts dump
  const allPostsFile = path.join(logsDir, "posts-all.json");
  fs.writeFileSync(allPostsFile, JSON.stringify(posts, null, 2));
  console.log(`  Raw posts saved → ${allPostsFile}`);

  for (const post of posts) {
    const slug = post.slug;
    const title = stripHtml(post.title.rendered);
    const postUrl = `https://tailieuvnu.com/${slug}/`;

    process.stdout.write(`  [${slug}] `);

    // Assign tag: first whitelisted category wins, else null
    let tag: string | null = null;
    for (const catId of post.categories) {
      if (CATEGORY_ID_TO_TAG[catId]) {
        tag = CATEGORY_ID_TO_TAG[catId];
        break;
      }
    }

    // 1. Check D1 — skip if already imported
    let exists = false;
    try {
      exists = await slugExistsInD1(slug);
    } catch (e) {
      console.error(`D1 check error: ${e}`);
      report.push({ slug, title, status: "error", reason: `D1 check: ${e}`, postUrl });
      continue;
    }
    if (exists) {
      process.stdout.write("already in D1, skipped\n");
      report.push({ slug, title, status: "skipped", reason: "already in D1" });
      continue;
    }

    // 2. Extract file source — Google Drive or download.tailieuvnu.com
    const driveId = extractDriveFileId(post.content.rendered);
    const directUrl = !driveId ? extractTailieuvnuUrl(post.content.rendered) : null;

    if (!driveId && !directUrl) {
      process.stdout.write("no file link found, skipped\n");
      report.push({
        slug,
        title,
        status: "skipped",
        reason: "no Drive or direct file link in content",
        postUrl,
        contentHtml: post.content.rendered,
      });
      continue;
    }

    // 3. Download
    let fileData: { buffer: Buffer; ext: string } | null = null;
    if (driveId) {
      process.stdout.write(`downloading drive=${driveId}... `);
      try {
        fileData = await downloadFromDrive(driveId);
      } catch (e) {
        process.stdout.write(`drive error\n`);
        report.push({ slug, title, status: "error", reason: `Drive download: ${e}`, postUrl });
        continue;
      }
      if (!fileData) {
        process.stdout.write("drive download failed\n");
        report.push({
          slug,
          title,
          status: "skipped",
          reason: "Drive download returned null",
          postUrl,
          contentHtml: post.content.rendered,
        });
        continue;
      }
    } else {
      process.stdout.write(`downloading direct=${directUrl}... `);
      try {
        fileData = await downloadDirect(directUrl!);
      } catch (e) {
        process.stdout.write(`direct error\n`);
        report.push({ slug, title, status: "error", reason: `Direct download: ${e}`, postUrl });
        continue;
      }
      if (!fileData) {
        process.stdout.write("direct download failed\n");
        report.push({
          slug,
          title,
          status: "skipped",
          reason: "Direct download returned null",
          postUrl,
          contentHtml: post.content.rendered,
        });
        continue;
      }
    }

    const { buffer, ext } = fileData;
    const r2Key = `documents/${slug}.${ext}`;
    const contentTypeMap: Record<string, string> = {
      pdf: "application/pdf",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      doc: "application/msword",
      ppt: "application/vnd.ms-powerpoint",
      xls: "application/vnd.ms-excel",
      zip: "application/zip",
      bin: "application/octet-stream",
    };
    const contentType = contentTypeMap[ext] ?? "application/octet-stream";

    // 4. Upload to R2
    process.stdout.write(`uploading r2=${r2Key} (${(buffer.byteLength / 1024).toFixed(0)}KB)... `);
    try {
      await uploadToR2(r2Key, buffer, contentType);
    } catch (e) {
      process.stdout.write(`r2 error\n`);
      report.push({ slug, title, status: "error", reason: `R2 upload: ${e}`, postUrl });
      continue;
    }

    const fileUrl = `${R2_PUBLIC_URL}/${r2Key}`;

    // 5. Build description from excerpt
    const description = stripHtml(post.excerpt.rendered).slice(0, 500) || null;

    // 6. Insert into D1
    try {
      await insertDocument({
        slug,
        title,
        description,
        tag,
        fileUrl,
        publishedAt: post.date,
      });
    } catch (e) {
      process.stdout.write(`d1 insert error\n`);
      report.push({ slug, title, status: "error", reason: `D1 insert: ${e}`, postUrl });
      continue;
    }

    process.stdout.write(`done (tag=${tag ?? "null"})\n`);
    report.push({ slug, title, status: "inserted" });
  }

  // Summary
  const inserted = report.filter((r) => r.status === "inserted").length;
  const skipped = report.filter((r) => r.status === "skipped").length;
  const errors = report.filter((r) => r.status === "error").length;

  console.log(`\n=== Crawl complete ===`);
  console.log(`Inserted: ${inserted}  Skipped: ${skipped}  Errors: ${errors}`);

  // Full report
  const reportPath = path.join(logsDir, "crawl-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`Full report → ${reportPath}`);

  // Skipped-only log (the ones worth manually checking)
  const skippedLog = report.filter(
    (r) => r.status === "skipped" && r.reason !== "already in D1",
  );
  const skippedPath = path.join(logsDir, "crawl-skipped.json");
  fs.writeFileSync(skippedPath, JSON.stringify(skippedLog, null, 2));
  console.log(`Skipped (needs manual check, ${skippedLog.length} entries) → ${skippedPath}`);

  // Errors log
  const errorsLog = report.filter((r) => r.status === "error");
  if (errorsLog.length > 0) {
    const errorsPath = path.join(logsDir, "crawl-errors.json");
    fs.writeFileSync(errorsPath, JSON.stringify(errorsLog, null, 2));
    console.log(`Errors (${errorsLog.length} entries) → ${errorsPath}`);
  }
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
