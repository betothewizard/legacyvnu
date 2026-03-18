import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// Pre-compute the pages for prerendering
async function getPrerenderPages(workerUrl: string | undefined) {
  const pages: Array<{
    path: string;
    prerender?: { enabled?: boolean; outputPath?: string };
  }> = [
    { path: "/", prerender: { enabled: true } },
    { path: "/tai-lieu" },
    { path: "/trac-nghiem" },
    { path: "/dong-gop" },
    { path: "/gioi-thieu" },
    { path: "/chinh-sach-bao-mat" },
  ];

  if (workerUrl) {
    // Fetch quizzes metadata
    try {
      const response = await fetch(`${workerUrl}/api/quizzes/metadata`);
      if (!response.ok) {
        console.warn(
          `[prerender] Failed to fetch quizzes metadata: ${response.status}`,
        );
      } else {
        const quizzes = await response.json();
        if (Array.isArray(quizzes)) {
          for (const quiz of quizzes) {
            const totalPages = Math.ceil(quiz.total / 10);
            for (let p = 0; p < totalPages; p++) {
              pages.push({ path: `/trac-nghiem/${quiz.code}/${p}` });
            }
            pages.push({ path: `/trac-nghiem/${quiz.code}` });
          }
          console.log(`[prerender] Loaded ${quizzes.length} quiz subjects`);
        }
      }
    } catch (error) {
      console.error("[prerender] Failed to fetch quizzes metadata:", error);
    }

    // Fetch documents pagination metadata + individual slugs
    try {
      const firstResponse = await fetch(`${workerUrl}/api/documents?page=0`);
      if (!firstResponse.ok) {
        console.warn(
          `[prerender] Failed to fetch documents metadata: ${firstResponse.status}`,
        );
      } else {
        const firstData = await firstResponse.json();
        const totalPages: number = firstData?.meta?.totalPages ?? 0;

        // Prerender pagination listing pages
        for (let p = 0; p < totalPages; p++) {
          pages.push({ path: `/tai-lieu/p/${p}` });
        }
        console.log(`[prerender] Loaded ${totalPages} document pages`);
      }
    } catch (error) {
      console.error("[prerender] Failed to fetch documents metadata:", error);
    }

    // Fetch all slugs in a single query via dedicated endpoint
    try {
      const slugsResponse = await fetch(`${workerUrl}/api/documents/slugs`);
      if (!slugsResponse.ok) {
        console.warn(
          `[prerender] Failed to fetch document slugs: ${slugsResponse.status}`,
        );
      } else {
        const slugs: string[] = await slugsResponse.json();
        for (const slug of slugs) {
          pages.push({ path: `/tai-lieu/${slug}` });
        }
        console.log(`[prerender] Loaded ${slugs.length} document detail pages`);
      }
    } catch (error) {
      console.error("[prerender] Failed to fetch document slugs:", error);
    }
  }

  return pages;
}

export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const prerenderPages = await getPrerenderPages(env.VITE_WORKER_URL);

  return {
    server: {
      port: 5173,
    },
    resolve: { alias: { "~": path.resolve(__dirname, ".") } },
    plugins: [
      tsconfigPaths(),
      tailwindcss(),
      tanstackStart({
        spa: {
          enabled: true,
          prerender: {
            outputPath: "/_shell.html",
            crawlLinks: false,
          },
        },
        prerender: {
          enabled: true,
          autoSubfolderIndex: true,

          autoStaticPathsDiscovery: false,
          crawlLinks: false,
        },
        pages: prerenderPages,
      }),
      viteReact(),
    ],
  };
});
