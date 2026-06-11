import { createServerFn } from "@tanstack/react-start";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import { apiFetch } from "~/src/lib/api";
import type {
  DocumentDetailResponse,
  DocumentDownloadResponse,
  DocumentTag,
  DocumentsResponse,
} from "@legacyvnu/shared";

export {
  DOCUMENT_TAG_LABELS as TAG_LABELS,
  getDocumentTagLabel,
  type DocumentDetail as TDocumentDetail,
  type DocumentSummary as TDocument,
  type DocumentTag as TDocumentTag,
  type DocumentsResponse as TDocumentsResponse,
} from "@legacyvnu/shared";

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
    const response = await apiFetch(`/api/documents?${params.toString()}`);
    return response.json() as Promise<DocumentsResponse>;
  });

export const getDocumentTags = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .handler(async () => {
    const response = await apiFetch(`/api/documents/tags`);
    return response.json() as Promise<DocumentTag[]>;
  });

export const getDocument = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    try {
      const response = await apiFetch(`/api/documents/${data.slug}`);
      return response.json() as Promise<DocumentDetailResponse>;
    } catch {
      return null;
    }
  });

export async function downloadDocument(data: { slug: string }) {
  const response = await apiFetch(`/api/documents/${data.slug}/download`, {
    method: "POST",
  });
  return response.json() as Promise<DocumentDownloadResponse>;
}
