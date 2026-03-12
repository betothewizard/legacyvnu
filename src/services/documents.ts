import { createServerFn } from "@tanstack/react-start";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";

const WORKER_URL = process.env.VITE_WORKER_URL;

export type Document = {
  slug: string;
  title: string;
  description: string | null;
  tag: string;
  downloadCount: number;
  publishedAt: string | null;
};

export type DocumentDetail = Document & {
  fileUrl: string;
};

export type DocumentTag = {
  tag: string;
  count: number;
};

export type DocumentsResponse = {
  docs: Document[];
  meta: { page: number; totalPages: number; total: number };
};

export const getDocuments = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .inputValidator(
    (data: { tag?: string; search?: string; page?: number }) => data,
  )
  .handler(async ({ data }) => {
    const params = new URLSearchParams();
    if (data.tag) params.set("tag", data.tag);
    if (data.search) params.set("search", data.search);
    if (data.page !== undefined) params.set("page", String(data.page));
    const response = await fetch(
      `${WORKER_URL}/api/documents?${params.toString()}`,
    );
    return response.json() as Promise<DocumentsResponse>;
  });

export const getDocumentTags = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .handler(async () => {
    const response = await fetch(`${WORKER_URL}/api/documents/tags`);
    return response.json() as Promise<DocumentTag[]>;
  });

export const getDocument = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    const response = await fetch(
      `${WORKER_URL}/api/documents/${data.slug}`,
    );
    if (!response.ok) return null;
    return response.json() as Promise<{
      doc: DocumentDetail;
      related: Document[];
    }>;
  });

export const downloadDocument = createServerFn({ method: "POST" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    const response = await fetch(
      `${WORKER_URL}/api/documents/${data.slug}/download`,
      { method: "POST" },
    );
    return response.json() as Promise<{ fileUrl: string }>;
  });
