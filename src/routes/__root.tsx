/// <reference types="vite/client" />
import type { ReactNode } from "react";
import { useEffect } from "react";
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
  useRouter,
} from "@tanstack/react-router";
import { scan } from "react-scan";
import posthog from "posthog-js";
import { CountdownBanner } from "../components/banner";
import "../styles/app.css";

const ORIGIN = "https://hocvnu.pages.dev";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { httpEquiv: "X-UA-Compatible", content: "IE=edge" },
      { title: "HocVNU" },
      {
        name: "description",
        content:
          "HocVNU - Nơi sinh viên VNU cùng chia sẻ tài liệu, đề thi và kinh nghiệm học tập.",
      },
      { name: "author", content: "betothewizard" },
      {
        name: "keywords",
        content:
          "HocVNU, VNU, ĐHQGHN, UET, tài liệu UET, Đại học Quốc gia Hà Nội, tài liệu VNU, đề thi VNU, trắc nghiệm, ôn tập đại cương, học VNU, sinh viên VNU, tài liệu học tập, chia sẻ đề thi",
      },
      {
        name: "robots",
        content:
          "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      },
      { name: "google-adsense-account", content: "ca-pub-2669549342761819" },
      { name: "language", content: "Vietnamese" },
      { name: "revisit-after", content: "7 days" },
      { property: "og:locale", content: "vi_VN" },
      { property: "og:url", content: "https://hocvnu.pages.dev" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "HocVNU" },
      {
        property: "og:title",
        content:
          "HocVNU - Nơi sinh viên VNU cùng chia sẻ tài liệu, đề thi và kinh nghiệm học tập",
      },
      {
        property: "og:description",
        content: "Nền tảng học tập cho sinh viên Đại học Quốc gia Hà Nội.",
      },
      { property: "og:image", content: "https://hocvnu.pages.dev/logo-og.png" },
      { property: "og:image:alt", content: "HocVNU Logo" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:type", content: "image/png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "twitter:domain", content: "hocvnu.pages.dev" },
      { property: "twitter:url", content: "https://hocvnu.pages.dev" },
      {
        name: "twitter:title",
        content:
          "HocVNU - Nơi sinh viên VNU cùng chia sẻ tài liệu, đề thi và kinh nghiệm học tập",
      },
      {
        name: "twitter:description",
        content:
          "Nền tảng học tập cho sinh viên Đại học Quốc gia Hà Nội. Tìm tài liệu, đề thi, ôn tập trắc nghiệm miễn phí.",
      },
      {
        name: "twitter:image",
        content: "https://hocvnu.pages.dev/logo-og.png",
      },
      { name: "theme-color", content: "#ecdab9" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "apple-mobile-web-app-title", content: "HocVNU" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/logo.svg" },
      {
        rel: "icon",
        type: "image/png",
        sizes: "192x192",
        href: "/logo-192.png",
      },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/logo-192.png" },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  const router = useRouter();
  const pathname = router.state.location.pathname;
  const canonicalUrl =
    ORIGIN + (pathname.endsWith("/") ? pathname : pathname + "/");

  useEffect(() => {
    if (import.meta.env.DEV) scan({ enabled: true });
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV === "development") return;
    posthog.init(import.meta.env.VITE_POSTHOG_ID, {
      api_host: "https://us.i.posthog.com",
      person_profiles: "identified_only",
    });
  }, []);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "HocVNU",
    url: ORIGIN,
    description:
      "Nền tảng chia sẻ tài liệu, đề thi và kinh nghiệm học tập cho sinh viên Đại học Quốc gia Hà Nội.",
    sameAs: [ORIGIN],
    isAccessibleForFree: true,
    author: {
      "@type": "Person",
      name: "betothewizard",
    },
  };

  return (
    <html lang="vi">
      <head>
        <link rel="canonical" href={canonicalUrl} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <HeadContent />
      </head>
      <body>
        <CountdownBanner />
        <div className="texture" />
        {children}
        <Scripts />
      </body>
    </html>
  );
}
