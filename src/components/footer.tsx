import { Link } from "@tanstack/react-router";
import { styles } from "~/src/styles";
import { Separator } from "~/src/components/ui/separator";

const footerLinks = [
  { to: "/gioi-thieu", label: "Giới thiệu" },
  { to: "/chinh-sach-bao-mat", label: "Chính sách bảo mật" },
  { to: "/dong-gop", label: "Đóng góp" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className={`${styles.paddingX} ${styles.flexCenter} mt-auto pt-6 pb-4`}
    >
      <div className={`${styles.boxWidth} space-y-3`}>
        <Separator />
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <p>© {year} LegacyVNU</p>
          <div className="flex items-center gap-4">
            {footerLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="hover:underline underline-offset-4 hover:text-foreground transition-colors"
                viewTransition
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
