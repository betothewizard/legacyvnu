import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "~": path.resolve(__dirname),
      "@legacyvnu/shared": path.resolve(__dirname, "../../packages/shared/src/index.ts"),
      "cloudflare:workers": path.resolve(
        __dirname,
        "workers/test/cloudflare-workers.ts",
      ),
    },
  },
  test: {
    include: ["workers/**/*.test.ts"],
  },
});
