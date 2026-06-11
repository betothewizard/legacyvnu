export const DOCUMENTS_PAGE_SIZE = 10;

export const DOCUMENT_TAG_LABELS: Record<string, string> = {
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

export function getDocumentTagLabel(tag: string | null | undefined) {
  if (!tag) return "Chưa phân loại";
  return DOCUMENT_TAG_LABELS[tag] ?? tag;
}

export type DocumentSummary = {
  slug: string;
  title: string;
  description: string | null;
  tag: string | null;
  downloadCount: number;
  publishedAt: string | null;
};

export type DocumentDetail = DocumentSummary & {
  fileUrl: string;
};

export type DocumentTag = {
  tag: string | null;
  count: number;
};

export type RelatedDocument = Pick<
  DocumentSummary,
  "slug" | "title" | "tag" | "downloadCount"
>;

export type DocumentsResponse = {
  docs: DocumentSummary[];
  meta: { page: number; totalPages: number; total: number };
};

export type DocumentDetailResponse = {
  doc: DocumentDetail;
  related: RelatedDocument[];
};

export type DocumentDownloadResponse = {
  fileUrl: string;
};

export type TDocument = DocumentSummary;
export type TDocumentDetail = DocumentDetail;
export type TDocumentTag = DocumentTag;
export type TDocumentsResponse = DocumentsResponse;
export const TAG_LABELS = DOCUMENT_TAG_LABELS;
