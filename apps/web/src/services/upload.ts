import { apiFetch } from "~/src/lib/api";

export const uploadFiles = async (files: File[], turnstileToken: string) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("file", file);
  });
  formData.append("turnstileToken", turnstileToken);

  const response = await apiFetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  return response.json();
};
