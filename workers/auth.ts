import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createDb } from "./db";
import { user, session, account, verification } from "./db/schema";
import type { D1Database } from "@cloudflare/workers-types";

export const getAuth = (d1: D1Database, env: any) => {
  const db = createDb(d1);
  return betterAuth({
    baseURL: (env.VITE_WORKER_URL || "http://localhost:8787") + "/api/auth",
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema: {
        user,
        session,
        account,
        verification,
      },
    }),
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID || "",
        clientSecret: env.GOOGLE_CLIENT_SECRET || "",
      },
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            if (!user.email.endsWith("@vnu.edu.vn")) {
              return false;
            }
            return { data: user };
          },
        },
      },
    },
		trustedOrigins: ["http://localhost:5173", "https://legacyvnu.pages.dev"]
  });
};
