import { useState, useEffect, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import { Search, Download, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { styles } from "~/src/styles";
import type { DocumentsResponse, DocumentTag } from "~/src/services/documents";
import { Card, CardHeader, CardTitle, CardDescription } from "~/src/components/ui/card";
import { Badge } from "~/src/components/ui/badge";
import { Input } from "~/src/components/ui/input";
import { buttonVariants } from "~/src/components/ui/button";
import { cn } from "~/src/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/src/components/ui/pagination";
import { AdLeaderboard, AdInList } from "~/src/components/ads";

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

const WORKER_URL = import.meta.env.VITE_WORKER_URL;

async function fetchDocuments(params: {
  page: number;
  tag?: string;
  search?: string;
}): Promise<DocumentsResponse> {
  const qs = new URLSearchParams();
  qs.set("page", String(params.page));
  if (params.tag) qs.set("tag", params.tag);
  if (params.search) qs.set("search", params.search);
  const res = await fetch(`${WORKER_URL}/api/documents?${qs.toString()}`);
  return res.json() as Promise<DocumentsResponse>;
}

const AD_EVERY_N_CARDS = 4;

interface Props {
  docsRes: DocumentsResponse;
  tags: DocumentTag[];
  /** 0-based page index from SSG loader */
  initialPage: number;
}

export function DocumentsPage({ docsRes: initialDocsRes, tags, initialPage }: Props) {
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [search, setSearch] = useState("");
  // clientPage is only set when user applies filters/search (overrides SSG URL navigation)
  const [clientPage, setClientPage] = useState<number | null>(null);
  const [docsRes, setDocsRes] = useState<DocumentsResponse>(initialDocsRes);
  const [loading, setLoading] = useState(false);

  // Sync SSG data when navigating between /tai-lieu/$page routes
  useEffect(() => {
    setDocsRes(initialDocsRes);
    setClientPage(null);
  }, [initialDocsRes]);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const currentPage = clientPage ?? initialPage;
  const hasFilters = selectedTag !== "" || debouncedSearch !== "";

  const load = useCallback(async (p: number, tag: string, s: string) => {
    setLoading(true);
    try {
      const res = await fetchDocuments({ page: p, tag: tag || undefined, search: s || undefined });
      setDocsRes(res);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasFilters && clientPage === null) return;
    load(currentPage, selectedTag, debouncedSearch);
  }, [currentPage, selectedTag, debouncedSearch, hasFilters, clientPage, load]);

  const handleTagClick = (tag: string) => {
    setSelectedTag((prev) => (prev === tag ? "" : tag));
    setClientPage(0);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setClientPage(0);
  };

  const handleClientPage = (p: number) => {
    setClientPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const { docs, meta } = docsRes;
  const totalPages = meta.totalPages;
  const pageNumbers = buildPageNumbers(currentPage, totalPages);

  return (
    <div className={`${styles.paddingX} ${styles.flexCenter}`}>
      <div className={`${styles.boxWidth}`}>
        {/* Top leaderboard ad */}
        <div className="my-4">
          <AdLeaderboard />
        </div>

        <div className="flex gap-6 pb-10">
          {/* Sidebar */}
          <aside className="hidden md:flex flex-col gap-2 w-52 shrink-0 pt-1">
            <p className="font-serif font-bold text-sm mb-1">Lọc theo trường</p>
            <button
              onClick={() => { setSelectedTag(""); setClientPage(null); }}
              className={`text-left text-sm px-3 py-2 rounded-lg border-2 transition-colors ${
                selectedTag === ""
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-transparent hover:border-border"
              }`}
            >
              Tất cả
              <span className="ml-1 text-xs opacity-70">({initialDocsRes.meta.total})</span>
            </button>
            {tags.map(({ tag, count }) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={`text-left text-sm px-3 py-2 rounded-lg border-2 transition-colors ${
                  selectedTag === tag
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-transparent hover:border-border"
                }`}
              >
                {TAG_LABELS[tag] ?? tag}
                <span className="ml-1 text-xs opacity-70">({count})</span>
              </button>
            ))}
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Tìm tài liệu..."
                value={search}
                onChange={handleSearch}
                className="pl-9"
              />
            </div>

            {/* Mobile tag filter chips */}
            <div className="flex md:hidden gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
              <button
                onClick={() => { setSelectedTag(""); setClientPage(null); }}
                className={`shrink-0 text-xs px-3 py-1.5 rounded-full border-2 transition-colors ${
                  selectedTag === ""
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border"
                }`}
              >
                Tất cả
              </button>
              {tags.map(({ tag }) => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className={`shrink-0 text-xs px-3 py-1.5 rounded-full border-2 transition-colors ${
                    selectedTag === tag
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border"
                  }`}
                >
                  {TAG_LABELS[tag] ?? tag}
                </button>
              ))}
            </div>

            {/* Results count */}
            <p className="text-sm text-muted-foreground mb-3">
              {loading
                ? "Đang tải..."
                : `${meta.total} tài liệu${selectedTag ? ` — ${TAG_LABELS[selectedTag] ?? selectedTag}` : ""}`}
            </p>

            {/* Card list */}
            <div className={`flex flex-col gap-3 transition-opacity duration-200 ${loading ? "opacity-50 pointer-events-none" : ""}`}>
              {!loading && docs.length === 0 && (
                <p className="text-muted-foreground text-center py-12">
                  Không tìm thấy tài liệu nào.
                </p>
              )}
              {docs.map((doc, i) => (
                <>
                  {i > 0 && i % AD_EVERY_N_CARDS === 0 && (
                    <AdInList key={`ad-${i}`} className="my-1" />
                  )}
                  <Link key={doc.slug} to="/tai-lieu/$documentId" params={{ documentId: doc.slug }}>
                    <Card className="hover:border-primary transition-colors cursor-pointer">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <CardTitle className="line-clamp-1 text-base">
                              {doc.title}
                            </CardTitle>
                            {doc.description && (
                              <CardDescription className="line-clamp-2 mt-1">
                                {doc.description}
                              </CardDescription>
                            )}
                          </div>
                          <Badge variant="secondary" className="shrink-0 text-xs">
                            {TAG_LABELS[doc.tag] ?? doc.tag}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                          {doc.publishedAt && (
                            <span>
                              {new Date(doc.publishedAt).toLocaleDateString("vi-VN")}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Download className="size-3" />
                            {doc.downloadCount.toLocaleString()}
                          </span>
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>
                </>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination className="mt-6">
                <PaginationContent>
                  {/* Previous */}
                  <PaginationItem>
                    {hasFilters ? (
                      <PaginationPrevious
                        onClick={() => { if (currentPage > 0) handleClientPage(currentPage - 1); }}
                        aria-disabled={currentPage === 0}
                        className={currentPage === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    ) : (
                      <Link
                        to="/tai-lieu/p/$page"
                        params={{ page: String(Math.max(0, currentPage - 1)) }}
                        aria-disabled={currentPage === 0}
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "default" }),
                          "gap-1 px-2.5 sm:pl-2.5",
                          currentPage === 0 ? "pointer-events-none opacity-50" : "",
                        )}
                      >
                        <ChevronLeftIcon />
                        <span className="hidden sm:block">Previous</span>
                      </Link>
                    )}
                  </PaginationItem>

                  {/* Page numbers */}
                  {pageNumbers.map((n, idx) =>
                    n === -1 ? (
                      <PaginationItem key={`ellipsis-${idx}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : hasFilters ? (
                      <PaginationItem key={n}>
                        <PaginationLink
                          isActive={currentPage === n}
                          onClick={() => handleClientPage(n)}
                          className="cursor-pointer"
                        >
                          {n + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={n}>
                        <Link
                          to="/tai-lieu/p/$page"
                          params={{ page: String(n) }}
                          aria-current={currentPage === n ? "page" : undefined}
                          className={cn(
                            buttonVariants({ variant: currentPage === n ? "outline" : "ghost", size: "icon" }),
                          )}
                        >
                          {n + 1}
                        </Link>
                      </PaginationItem>
                    ),
                  )}

                  {/* Next */}
                  <PaginationItem>
                    {hasFilters ? (
                      <PaginationNext
                        onClick={() => { if (currentPage < totalPages - 1) handleClientPage(currentPage + 1); }}
                        aria-disabled={currentPage >= totalPages - 1}
                        className={currentPage >= totalPages - 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    ) : (
                      <Link
                        to="/tai-lieu/p/$page"
                        params={{ page: String(Math.min(totalPages - 1, currentPage + 1)) }}
                        aria-disabled={currentPage >= totalPages - 1}
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "default" }),
                          "gap-1 px-2.5 sm:pr-2.5",
                          currentPage >= totalPages - 1 ? "pointer-events-none opacity-50" : "",
                        )}
                      >
                        <span className="hidden sm:block">Next</span>
                        <ChevronRightIcon />
                      </Link>
                    )}
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}

            {/* Footer ad */}
            <div className="mt-6">
              <AdLeaderboard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function buildPageNumbers(current: number, total: number): number[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i);
  }
  const pages = new Set<number>();
  pages.add(0);
  pages.add(total - 1);
  for (let i = Math.max(0, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.add(i);
  }
  const sorted = [...pages].sort((a, b) => a - b);
  const result: number[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push(-1);
    result.push(sorted[i]);
  }
  return result;
}
