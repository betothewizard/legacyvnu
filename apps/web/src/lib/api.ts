import { getEnv } from "./utils";

export async function apiFetch(path: string, options?: RequestInit) {
  // Gracefully fallback if the environment variable is not defined
  let baseURL = "";
  try {
    baseURL = getEnv("VITE_WORKER_URL");
  } catch {
    baseURL = typeof window !== "undefined"
      ? (import.meta as any).env?.VITE_WORKER_URL || "http://localhost:8787"
      : process.env.VITE_WORKER_URL || "http://localhost:8787";
  }

  // Ensure no double slashes except after protocol
  const cleanBase = baseURL.endsWith("/") ? baseURL.slice(0, -1) : baseURL;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${cleanBase}${cleanPath}`;

  const response = await fetch(url, {
    ...options,
    // Include credentials by default to support auth sessions
    credentials: options?.credentials ?? "include",
  });

  if (!response.ok) {
    let errorMessage = "Đã xảy ra lỗi hệ thống";
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      // Fallback to text if JSON parsing fails
      try {
        const text = await response.text();
        if (text) errorMessage = text;
      } catch {
        // ignore
      }
    }
    throw new Error(errorMessage);
  }

  return response;
}
