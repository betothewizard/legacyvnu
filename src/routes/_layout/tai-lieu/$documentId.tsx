import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Download, Calendar, ArrowLeft, FileText } from "lucide-react";
import { styles } from "~/src/styles";
import {
  getDocument,
  downloadDocument,
  TAG_LABELS,
} from "~/src/services/documents";
import { Badge } from "~/src/components/ui/badge";
import { Button } from "~/src/components/ui/button";
import { Card, CardHeader, CardTitle } from "~/src/components/ui/card";
import { PdfViewer } from "~/src/components/pdf-viewer";

function DocumentDetailRouteComponent() {
  const { doc } = Route.useLoaderData();
  return <DocumentPage key={doc.slug} />;
}

export const Route = createFileRoute("/_layout/tai-lieu/$documentId")({
  staleTime: Infinity,
  gcTime: Infinity,
  loader: async ({ params }) => {
    const result = await getDocument({ data: { slug: params.documentId } });
    if (!result) throw notFound();
    return result;
  },
  component: DocumentDetailRouteComponent,
});

function DocumentPage() {
  const { doc, related } = Route.useLoaderData();
  const [downloadCount, setDownloadCount] = useState(doc.downloadCount);
  const [downloading, setDownloading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const { fileUrl } = await downloadDocument({ slug: doc.slug });
      setDownloadCount((c) => c + 1);
      window.open(fileUrl, "_blank");
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };

  const ext = doc.fileUrl.split(".").pop()?.toLowerCase() ?? "file";

  return (
    <div className={`${styles.paddingX} ${styles.flexCenter}`}>
      <div className={`${styles.boxWidth} py-6`}>
        {/* Back link */}
        <Link
          to="/tai-lieu"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors"
        >
          <ArrowLeft className="size-4" />
          Quay lại danh sách
        </Link>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h1 className="font-serif text-2xl md:text-3xl leading-snug mb-3">
              {doc.title}
            </h1>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge>{TAG_LABELS[doc.tag] ?? doc.tag}</Badge>
              {doc.publishedAt && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="size-3" />
                  {new Date(doc.publishedAt).toLocaleDateString("vi-VN")}
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Download className="size-3" />
                {downloadCount.toLocaleString()} lượt tải
              </span>
              <Badge variant="outline" className="uppercase text-xs">
                {ext}
              </Badge>
            </div>

            {/* Description */}
            {doc.description && (
              <p className="text-muted-foreground leading-relaxed mb-5">
                {doc.description}
              </p>
            )}

            {/* File viewer */}
            <div className="rounded-xl border-2 overflow-hidden bg-card mb-4">
              <div className="flex items-center gap-2 px-4 py-2 border-b-2 bg-muted/50">
                <FileText className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium truncate">
                  {doc.title}
                </span>
              </div>
              {ext === "pdf" ? (
                isMounted ? (
                  <div className="w-full h-[600px] overflow-hidden">
                    <PdfViewer fileUrl={doc.fileUrl} />
                  </div>
                ) : (
                  <div className="w-full h-[600px] flex items-center justify-center bg-muted/30">
                    <p className="text-sm text-muted-foreground">
                      Đang chuẩn bị trình xem tài liệu...
                    </p>
                  </div>
                )
              ) : (
                <iframe
                  src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(doc.fileUrl)}`}
                  className="w-full h-[600px]"
                  title={doc.title}
                />
              )}
            </div>

            {/* Download button */}
            <Button
              size="lg"
              className="w-full sm:w-auto"
              onClick={handleDownload}
              disabled={downloading}
            >
              <Download className="size-4 mr-2" />
              {downloading ? "Đang mở..." : "Tải xuống"}
            </Button>
          </div>

          {/* Sidebar */}
          <aside className="lg:w-72 shrink-0 flex flex-col gap-5">
            {related.length > 0 && (
              <div className="flex flex-col gap-4">
                <p className="font-serif font-bold text-sm">
                  Tài liệu liên quan
                </p>
                <div className="flex flex-col gap-3">
                  {related.map((r) => (
                    <Link
                      key={r.slug}
                      to="/tai-lieu/$documentId"
                      params={{ documentId: r.slug }}
                      className="group"
                    >
                      <Card className="hover:border-primary transition-colors cursor-pointer overflow-hidden">
                        <CardHeader className="py-3 px-4">
                          <CardTitle className="text-sm font-medium line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                            {r.title}
                          </CardTitle>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <Download className="size-3" />
                            <span>
                              {r.downloadCount.toLocaleString()} lượt tải
                            </span>
                          </div>
                        </CardHeader>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
