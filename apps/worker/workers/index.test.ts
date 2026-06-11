import { describe, expect, it } from "vitest";
import app from "./index";

type ErrorBody = {
  error: string;
  stack?: string;
};

describe("worker routes", () => {
  it("returns the health-check response", async () => {
    const response = await app.request("/api/hi");

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("Hello");
  });

  it("returns the not-found JSON shape", async () => {
    const response = await app.request("/api/not-real");

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Not found" });
  });

  it("returns readable errors without stack traces from document routes", async () => {
    const response = await app.request("/api/documents?page=0");

    expect(response.status).toBe(500);
    const body = (await response.json()) as ErrorBody;
    expect(body.error).toBeTypeOf("string");
    expect(body.error.length).toBeGreaterThan(0);
    expect(body).not.toHaveProperty("stack");
  });

  it("returns readable errors without stack traces from quiz routes", async () => {
    const response = await app.request("/api/quizzes/metadata");

    expect(response.status).toBe(500);
    const body = (await response.json()) as ErrorBody;
    expect(body.error).toBeTypeOf("string");
    expect(body.error.length).toBeGreaterThan(0);
    expect(body).not.toHaveProperty("stack");
  });

  it("rejects websocket endpoint without upgrade headers", async () => {
    const response = await app.request("/api/chat/ws");

    expect(response.status).toBe(426);
    expect(await response.text()).toBe("Expected Upgrade: websocket");
  });
});
