import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

// Mock the scanner so these tests never launch a real browser.
vi.mock("./scanner.js", async () => {
  const actual = await vi.importActual<typeof import("./scanner")>("./scanner");
  return {
    ...actual, // keep the real isValidHttpUrl
    scanUrl: vi.fn(),
  };
});

import { createApp } from "./index.js";
import { scanUrl } from "./scanner.js";

const fakeResult = {
  url: "https://example.com",
  finalUrl: "https://example.com/",
  scannedAt: new Date().toISOString(),
  pageTitle: "Example",
  summary: { total: 1, critical: 1, serious: 0, moderate: 0, minor: 0, passes: 5, incomplete: 0 },
  violations: [],
};

describe("POST /api/scan", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects a non-URL with 400", async () => {
    const res = await request(createApp()).post("/api/scan").send({ url: "nope" });
    expect(res.status).toBe(400);
    expect(scanUrl).not.toHaveBeenCalled();
  });

  it("returns scan results for a valid URL", async () => {
    vi.mocked(scanUrl).mockResolvedValue(fakeResult as any);
    const res = await request(createApp()).post("/api/scan").send({ url: "https://example.com" });
    expect(res.status).toBe(200);
    expect(res.body.summary.critical).toBe(1);
    expect(scanUrl).toHaveBeenCalledWith("https://example.com");
  });

  it("maps scanner failure to a friendly 502", async () => {
    vi.mocked(scanUrl).mockRejectedValue(new Error("net::ERR_FAILED"));
    const res = await request(createApp()).post("/api/scan").send({ url: "https://example.com" });
    expect(res.status).toBe(502);
    expect(res.body.error).toMatch(/couldn't load/i);
  });

  it("health check responds ok", async () => {
    const res = await request(createApp()).get("/api/health");
    expect(res.body).toEqual({ ok: true });
  });
});