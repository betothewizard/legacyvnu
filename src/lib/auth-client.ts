import { createAuthClient } from "better-auth/react";

const getWorkerUrl = () => {
  if (typeof window !== "undefined") {
    return import.meta.env.VITE_WORKER_URL || "http://localhost:8787";
  }
  return "http://localhost:8787";
};

export const authClient = createAuthClient({
  baseURL: `${getWorkerUrl()}/api/auth`
});
