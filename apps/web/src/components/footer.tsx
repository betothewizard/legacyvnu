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
            <Separator orientation="vertical" className="h-4" />
            <a
              href="https://wizards.foundation/discord"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors p-1"
              aria-label="Discord"
            >
              <svg
                role="img"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                className="size-[18px] fill-current"
              >
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0775-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0775.0105c.1201.099.246.1971.3718.2914a.077.077 0 01-.0066.1277 12.2986 12.2986 0 01-1.873.8923.076.076 0 00-.0416.1057c.3533.699.7644 1.3638 1.226 1.9942a.0775.0775 0 00.0842.0276c1.9593-.6066 3.9479-1.5218 6.002-3.0294a.077.077 0 00.0313-.056c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
