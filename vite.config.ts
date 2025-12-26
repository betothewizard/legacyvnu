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
    { path: "/" },
    { path: "/tai-lieu" },
    { path: "/trac-nghiem" },
    { path: "/dong-gop" },
  ];

  // Fetch quizzes metadata from API
  if (workerUrl) {
    try {
      const response = await fetch(`${workerUrl}/api/quizzes/metadata`);
      if (!response.ok) {
        console.warn(
          `[prerender] Failed to fetch quizzes metadata: ${response.status}`
        );
        return pages;
      }
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
    } catch (error) {
      console.error("[prerender] Failed to fetch quizzes metadata:", error);
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
        prerender: {
          enabled: true,
          autoSubfolderIndex: true,
          autoStaticPathsDiscovery: true,
          crawlLinks: false,
        },
        pages: prerenderPages,
      }),
      viteReact(),
    ],
  };
});
