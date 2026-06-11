import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createDb } from "./db";
import { user, session, account, verification } from "./db/schema";
import type { D1Database } from "@cloudflare/workers-types";
import { APIError } from "better-auth/api";

export const getAuth = (d1: D1Database, env: any, requestUrl?: string) => {
  const db = createDb(d1);
  let baseURL = env.VITE_WORKER_URL || "http://localhost:8787";
  if (requestUrl) {
    const url = new URL(requestUrl);
    if (!url.hostname.includes("localhost") && !url.hostname.includes("127.0.0.1")) {
      baseURL = `${url.protocol}//${url.host}`;
    }
  }
  return betterAuth({
    secret: env.BETTER_AUTH_SECRET,
    baseURL: baseURL + "/api/auth",
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
              throw new APIError("BAD_REQUEST", {
                message: "Email must end with @vnu.edu.vn",
              });
            }
            return { data: user };
          },
        },
      },
    },
    trustedOrigins: ["http://localhost:5173", "https://legacyvnu.pages.dev"],
  });
};
