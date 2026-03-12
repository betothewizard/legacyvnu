import { createFileRoute } from "@tanstack/react-router";
import { Github, Mail, Globe } from "lucide-react";
import { styles } from "~/src/styles";

export const Route = createFileRoute("/_layout/gioi-thieu")({
  component: AboutPage,
});

function AboutPage() {
  return (
    <div
      className={`${styles.paddingX} ${styles.flexCenter} ${styles.paddingY}`}
    >
      <div className={`${styles.boxWidth} space-y-10`}>
        <div className="space-y-4">
          <h1 className="font-serif text-3xl md:text-4xl">Về LegacyVNU</h1>
          <p className="text-muted-foreground leading-relaxed">
            LegacyVNU là nền tảng chia sẻ tài liệu học tập miễn phí dành riêng
            cho sinh viên Đại học Quốc gia Hà Nội. Chúng tôi tập hợp đề cương,
            giáo trình, đề thi và tài liệu ôn tập từ nhiều trường thành viên —
            tất cả ở một nơi, hoàn toàn miễn phí.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="font-serif text-2xl">Mã nguồn mở</h2>
          <p className="text-muted-foreground leading-relaxed">
            LegacyVNU là dự án mã nguồn mở. Bạn có thể xem, fork và đóng góp
            code trên GitHub. Mọi pull request đều được chào đón.
          </p>
          <a
            href="https://github.com/betothewizard/legacyvnu"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-semibold hover:underline underline-offset-4"
          >
            <Github className="h-5 w-5" />
            github.com/betothewizard/legacyvnu
          </a>
        </div>

        <div className="space-y-4">
          <h2 className="font-serif text-2xl">Liên hệ</h2>
          <p className="text-muted-foreground">
            Nếu bạn có câu hỏi, muốn hợp tác hoặc báo cáo nội dung vi phạm, hãy
            liên hệ với chúng tôi.
          </p>
          <div className="flex flex-col gap-3">
            <a
              href="https://wizards.foundation"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 hover:underline underline-offset-4"
            >
              <Globe className="h-4 w-4 shrink-0" />
              wizards.foundation
            </a>
            <a
              href="mailto:hello@wizards.foundation"
              className="inline-flex items-center gap-2 hover:underline underline-offset-4"
            >
              <Mail className="h-4 w-4 shrink-0" />
              hello@wizards.foundation
            </a>
          </div>
        </div>

        <p className="text-muted-foreground">
          Bằng cách sử dụng LegacyVNU, bạn đồng ý với{" "}
          <a
            href="/chinh-sach-bao-mat"
            className="underline underline-offset-4 hover:opacity-70"
          >
            Chính sách bảo mật
          </a>{" "}
          của chúng tôi.
        </p>
      </div>
    </div>
  );
}
