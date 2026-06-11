import { createServerFn } from "@tanstack/react-start";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import { apiFetch } from "~/src/lib/api";

export type TDocument = {
  slug: string;
  title: string;
  description: string | null;
  tag: string;
  downloadCount: number;
  publishedAt: string | null;
};

export type TDocumentDetail = TDocument & {
  fileUrl: string;
};

export type TDocumentTag = {
  tag: string;
  count: number;
};

export type TDocumentsResponse = {
  docs: TDocument[];
  meta: { page: number; totalPages: number; total: number };
};

export const TAG_LABELS: Record<string, string> = {
  "dai-hoc-cong-nghe": "Đại Học Công Nghệ",
  "dai-hoc-khtn": "Đại Học KHTN",
  "dai-hoc-khxhnv": "Đại Học KHXHNV",
  "dai-hoc-kinh-te": "Đại Học Kinh Tế",
  "dai-hoc-ngoai-ngu": "Đại Học Ngoại Ngữ",
  "dai-hoc-y-duoc": "Đại Học Y Dược",
  "khoa-luat": "Khoa Luật",
  "giao-trinh-chung": "Giáo Trình Chung",
  "tai-lieu-chung": "Tài Liệu Chung",
  "de-cuong-chung": "Đề Cương Chung",
  "tieng-anh-vstep": "Tiếng Anh VSTEP",
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
    const response = await apiFetch(`/api/documents?${params.toString()}`);
    return response.json() as Promise<TDocumentsResponse>;
  });

export const getDocumentTags = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .handler(async () => {
    const response = await apiFetch(`/api/documents/tags`);
    return response.json() as Promise<TDocumentTag[]>;
  });

export const getDocument = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    try {
      const response = await apiFetch(`/api/documents/${data.slug}`);
      return response.json() as Promise<{
        doc: TDocumentDetail;
        related: TDocument[];
      }>;
    } catch {
      return null;
    }
  });

export async function downloadDocument(data: { slug: string }) {
  const response = await apiFetch(`/api/documents/${data.slug}/download`, {
    method: "POST",
  });
  return response.json() as Promise<{ fileUrl: string }>;
}
