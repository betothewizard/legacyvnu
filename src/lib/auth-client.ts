import { createAuthClient } from "better-auth/react";
import { toast } from "sonner";

const getWorkerUrl = () => {
  if (typeof window !== "undefined") {
    return import.meta.env.VITE_WORKER_URL || "http://localhost:8787";
  }
  return "http://localhost:8787";
};

export const authClient = createAuthClient({
  baseURL: `${getWorkerUrl()}/api/auth`,
  fetchOptions: {
    onError: (ctx) => {
      const errorMsg = ctx.error.message || "Xác thực không thành công";
      toast.error(errorMsg);
    },
  },
});
