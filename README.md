# AccessScan

Automated WCAG accessibility scanner with a plain-language dashboard, built for
public-sector websites.

Paste a public URL. AccessScan loads the page in a real headless browser, runs
the open-source [axe-core](https://github.com/dequelabs/axe-core) audit engine
against the live DOM, and presents the findings translated into language a
non-technical reader can act on: what the problem is, who it affects, and how to
fix it.

## Why it's built this way

- **Real browser, not a fetch.** Modern sites build most of their content with
  JavaScript, and contrast checks need real computed styles. So the scanner uses
  Playwright + Chromium to render the page exactly as a visitor's browser would,
  then runs the audit. A plain HTML fetch would miss most of the page.
- **axe-core does the rule-checking.** axe-core is the maintained industry
  standard (it's also what powers Lighthouse's accessibility audit). Embedding it
  is the right call; reinventing WCAG rule logic would be years of edge cases.
- **The translation layer is the product.** Raw axe output is developer-facing.
  `server/translate.ts` maps each rule to a resident-focused explanation, parses
  the WCAG criteria and conformance level out of axe's tags, and falls back to
  axe's own help text for any rule it doesn't have custom copy for — so it works
  on any site.
- **Honest about scope.** The dashboard states plainly that automated testing
  catches roughly 30–50% of WCAG issues and the rest needs human review. A tool
  that pretends otherwise isn't trustworthy.

## Run it locally

Requires Node 18+.

```bash
npm install

# One-time: download the Chromium browser Playwright drives.
npx playwright install chromium

# Run frontend (Vite, port 5173) and backend (Express, port 8080) together.
npm run dev
```

Then open http://localhost:5173. (Works the same on Windows/PowerShell.)

## Production build

```bash
npm run build   # builds the React app into dist/client
npm start       # Express serves the API and the built frontend on port 8080
```

## Deploy to Fly.io

The Dockerfile is based on the official Playwright image, so Chromium and its
system libraries are already present — that's the part that's usually painful.

```bash
fly launch --no-deploy   # claim an app name; keep the existing Dockerfile
fly deploy
```

A headless browser needs memory; `fly.toml` requests 1 GB, which is a safe floor.

## Architecture

```
Browser (React + TS)
   │  POST /api/scan { url }
   ▼
Express server (server/index.ts)
   │  validate URL, basic per-IP rate limit
   ▼
Scanner (server/scanner.ts)
   │  Playwright launches Chromium → load page → inject axe-core → analyze
   ▼
Translation layer (server/translate.ts)
   │  axe violations → plain-language, resident-focused findings + WCAG refs
   ▼
JSON response → dashboard renders, grouped and sorted by user impact
```

| Piece                     | File                  | Responsibility                                   |
| ------------------------- | --------------------- | ------------------------------------------------ |
| Scan API + static serving | `server/index.ts`     | Endpoint, validation, rate limiting              |
| Scanning engine           | `server/scanner.ts`   | Headless browser + axe-core                      |
| Translation               | `server/translate.ts` | The plain-language layer                         |
| Dashboard                 | `client/`             | React UI, severity grouping, the violation cards |

## Where this would go next

This is a single-page prototype. The path to the real product:

1. **Crawl, don't just scan one page** — discover URLs via `sitemap.xml` and
   link-following, scan the whole site.
2. **Persist results** — store scans in Postgres so clients see trends over time
   ("320 issues down to 40").
3. **A real job queue** — move scans onto a Redis-backed queue (BullMQ) so big
   sites and scheduled re-scans don't block.
4. **PDF validation module** — validate uploaded PDFs against PDF/UA using
   veraPDF, since municipal PDFs (agendas, bylaws, forms) are a major gap.
5. **VPAT-style reporting** — roll aggregated results into a conformance report
   for procurement.
