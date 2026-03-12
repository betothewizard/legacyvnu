import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Search, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { styles } from "~/src/styles";
import { getDocuments, getDocumentTags } from "~/src/services/documents";
import { Card, CardHeader, CardTitle, CardDescription } from "~/src/components/ui/card";
import { Badge } from "~/src/components/ui/badge";
import { Button } from "~/src/components/ui/button";
import { Input } from "~/src/components/ui/input";
import { AdLeaderboard, AdInList } from "~/src/components/ads";

const TAG_LABELS: Record<string, string> = {
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

export const Route = createFileRoute("/_layout/tai-lieu/")({
  staleTime: Infinity,
  gcTime: Infinity,
  loaderDeps: ({ search }) => ({ search }),
  loader: async () => {
    const [docsRes, tags] = await Promise.all([
      getDocuments({ data: { page: 0 } }),
      getDocumentTags(),
    ]);
    return { docsRes, tags };
  },
  component: DocumentsPage,
});

const AD_EVERY_N_CARDS = 4;

function DocumentsPage() {
  const { docsRes, tags } = Route.useLoaderData();
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  const filtered = useMemo(() => {
    return docsRes.docs.filter((doc) => {
      const matchTag = selectedTag ? doc.tag === selectedTag : true;
      const matchSearch = search
        ? doc.title.toLowerCase().includes(search.toLowerCase())
        : true;
      return matchTag && matchSearch;
    });
  }, [docsRes.docs, selectedTag, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleTagClick = (tag: string) => {
    setSelectedTag((prev) => (prev === tag ? "" : tag));
    setPage(0);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(0);
  };

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
              onClick={() => { setSelectedTag(""); setPage(0); }}
              className={`text-left text-sm px-3 py-2 rounded-lg border-2 transition-colors ${
                selectedTag === ""
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-transparent hover:border-border"
              }`}
            >
              Tất cả
              <span className="ml-1 text-xs opacity-70">({docsRes.meta.total})</span>
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
                onClick={() => { setSelectedTag(""); setPage(0); }}
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
              {filtered.length} tài liệu{selectedTag ? ` — ${TAG_LABELS[selectedTag] ?? selectedTag}` : ""}
            </p>

            {/* Card list with in-list ads */}
            <div className="flex flex-col gap-3">
              {paginated.length === 0 && (
                <p className="text-muted-foreground text-center py-12">
                  Không tìm thấy tài liệu nào.
                </p>
              )}
              {paginated.map((doc, i) => (
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
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <span className="text-sm">
                  Trang {page + 1} / {totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
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
