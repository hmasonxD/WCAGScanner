import express from "express";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { scanUrl, isValidHttpUrl } from "./scanner.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const app = express();
  app.use(express.json());
  // express.json() throws on malformed bodies; turn that into a clean 400
  // instead of leaking a stack trace.
  app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err?.type === "entity.parse.failed") {
      return res.status(400).json({ error: "Request body wasn't valid JSON." });
    }
    next(err);
  });  

  // One scan per IP at a time, plus a short cooldown. A real product would use a
  // Redis-backed queue; this just keeps a public demo from being hammered.
  const inFlight = new Set<string>();
  const lastScanAt = new Map<string, number>();
  const COOLDOWN_MS = 4000;

  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  app.post("/api/scan", async (req, res) => {
    const ip = req.ip ?? "unknown";
    const url = String(req.body?.url ?? "").trim();

    if (!isValidHttpUrl(url)) {
      return res.status(400).json({
        error: "Enter a full website address starting with http or https.",
      });
    }
    if (inFlight.has(ip)) {
      return res.status(429).json({ error: "A scan is already running. Give it a moment." });
    }
    if (Date.now() - (lastScanAt.get(ip) ?? 0) < COOLDOWN_MS) {
      return res.status(429).json({ error: "Scanning too quickly. Wait a few seconds." });
    }

    inFlight.add(ip);
    try {
      const result = await scanUrl(url);
      lastScanAt.set(ip, Date.now());
      res.json(result);
    } catch (err) {
      const message =
        err instanceof Error && /timeout/i.test(err.message)
          ? "That page took too long to load. It may be slow or blocking automated visits."
          : "Couldn't load that page. Check the address and that the site is publicly reachable.";
      res.status(502).json({ error: message });
    } finally {
      inFlight.delete(ip);
    }
  });

  // In production, serve the built frontend. In dev, Vite handles that.
  const clientDir = path.resolve(__dirname, "../dist/client");
  if (fs.existsSync(clientDir)) {
    app.use(express.static(clientDir));
    app.get("*", (_req, res) => res.sendFile(path.join(clientDir, "index.html")));
  }

  return app;
}

// Only listen when run directly, not when imported by a test.
const isDirectRun = process.argv[1] === fileURLToPath(import.meta.url);
if (isDirectRun) {
  const PORT = Number(process.env.PORT) || 8080;
  createApp().listen(PORT, () => console.log(`AccessScan running on http://localhost:${PORT}`));
}