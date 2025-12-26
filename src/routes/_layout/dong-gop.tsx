import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { Button } from "~/src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/src/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/src/components/ui/dialog";
import { Label } from "~/src/components/ui/label";
import { Textarea } from "~/src/components/ui/textarea";
import { Uploader } from "~/src/components/ui/uploader";
import { uploadFiles } from "~/src/services/upload";
import { styles } from "~/src/styles";
import { getEnv } from "~/src/lib/utils";
import { Input } from "../../components/ui/input";

export const Route = createFileRoute("/_layout/dong-gop")({
  component: ContributePage,
});

function ContributePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [feedback, setFeedback] = useState("");
  const [contact, setContact] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    const docFiles = files.filter((f) => !f.type.startsWith("image/"));

    if (!files.length && !feedback.trim()) {
      setError("Vui lòng tải lên file hoặc nhập góp ý.");
      return;
    }

    if (docFiles.length && !turnstileToken) {
      setError("Vui lòng hoàn thành xác minh bảo mật để tải lên tài liệu.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      if (docFiles.length && turnstileToken) {
        await uploadFiles(docFiles, turnstileToken);
      }

      if (feedback.trim() || imageFiles.length) {
        const formData = new FormData();
        formData.append("feedback", feedback || "Đóng góp tài liệu/hình ảnh");
        if (contact.trim()) formData.append("contact", contact.trim());
        imageFiles.forEach((img) => formData.append("images", img));

        const res = await fetch(`${getEnv("VITE_WORKER_URL")}/api/feedback`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Gửi góp ý thất bại");
      }

      setSuccess(true);
      setFiles([]);
      setFeedback("");
      setContact("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi.");
      if (docFiles.length) {
        turnstileRef.current?.reset();
        setTurnstileToken(null);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className={`${styles.paddingX} ${styles.flexCenter}`}>
        <div className={`${styles.boxWidth}`}>
          <Card>
            <CardHeader>
              <CardTitle>Đóng góp</CardTitle>
              <CardDescription>
                Bạn có thể đóng góp tài liệu, hoặc ý kiến để HocVNU ngày càng
                phát triển 💯
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-base font-semibold">
                    Tài liệu / Hình ảnh
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Tải lên file tài liệu (PDF, DOCX,...) hoặc hình ảnh (PNG,
                    JPG,...)
                  </p>
                  <Uploader
                    value={files}
                    onChange={setFiles}
                    disabled={submitting}
                    dropzoneOptions={{ maxSize: 1024 * 1024 * 100 }}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-semibold">
                    Góp ý / Ghi chú (không bắt buộc)
                  </Label>
                  <Textarea
                    placeholder="Nhập góp ý, đề xuất, mô tả tài liệu hoặc báo lỗi..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    disabled={submitting}
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-semibold">
                    Thông tin liên hệ (không bắt buộc)
                  </Label>
                  <Input
                    placeholder="Nếu bạn muốn nhận phản hồi ^^"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    disabled={submitting}
                  />
                </div>

                {files.some((f) => !f.type.startsWith("image/")) &&
                  !turnstileToken && (
                    <Turnstile
                      ref={turnstileRef}
                      siteKey={getEnv("VITE_TURNSTILE_SITE_KEY")}
                      onSuccess={setTurnstileToken}
                      onError={() => setTurnstileToken(null)}
                      onExpire={() => setTurnstileToken(null)}
                    />
                  )}

                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? "Đang gửi..." : "Gửi đóng góp"}
                </Button>

                {error && (
                  <p className="text-sm text-destructive text-center">
                    {error}
                  </p>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={success} onOpenChange={setSuccess}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thành công! 🎉</DialogTitle>
            <DialogDescription>
              Cảm ơn bạn đã đóng góp! ♥️ Đóng góp của bạn sẽ được xem xét trong
              thời gian sớm nhất.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setSuccess(false)}>Đóng</Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
