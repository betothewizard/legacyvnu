# LegacyVNU

LegacyVNU is a student-built knowledge hub for Vietnam National University
(VNU): shared documents, old exams, quiz practice, contribution flows, and a
small real-time chat space for VNU students.

This repository is public as a portfolio/showcase of the product and technical
work. It is not packaged as a turnkey self-hosting template.

## Highlights

- Searchable document library with school/tag filtering, pagination, detail
  pages, related documents, download tracking, and PDF/Office previews.
- Quiz practice experience with paginated question sets, shuffled answers,
  answer checking, and submission aggregation.
- Contribution flow for documents, images, and feedback with Cloudflare
  Turnstile protection and Telegram notifications.
- Google OAuth login restricted to `@vnu.edu.vn` accounts.
- Real-time chat backed by a Cloudflare Durable Object and WebSocket broadcast.
- Static prerendering for document and quiz pages to keep browsing fast.
- SEO metadata, Open Graph tags, manifest, sitemap, robots.txt, and local fonts.

## Tech stack

- **Frontend**: React 19, TanStack Router + React Start, Tailwind CSS v4, Radix UI
- **Backend**: Cloudflare Workers (Hono), D1 (SQLite via Drizzle ORM), R2 object storage
- **Auth**: Better-Auth with Google OAuth and a `@vnu.edu.vn` email restriction
- **Realtime**: Cloudflare Durable Objects + WebSockets
- **Tooling**: pnpm, Vite, TypeScript strict mode, oxlint/oxfmt, Vitest

## Architecture

```text
apps/web/         TanStack React Start app, UI, routes, services, public assets
apps/worker/      Hono API, Better-Auth, D1 schema/migrations, Durable Object chat
packages/shared/  Cross-runtime constants and shared TypeScript modules
scripts/          Data import/crawl tooling used to seed the document library
```

The app is split between a TanStack React Start frontend and a Cloudflare Worker
API. Static pages are prerendered from Worker API data, while dynamic features
such as uploads, downloads, auth, feedback, and chat go through the Worker.

## Quality

- Strict TypeScript configuration.
- oxlint/oxfmt for fast linting and formatting.
- Vitest coverage for core Worker route behavior.
- Cloudflare-oriented deployment scripts for Pages, Workers, D1, R2, and Durable Objects.

## Status

LegacyVNU is an active personal project. The repo intentionally does not include
production secrets, clone-and-run environment instructions, or deployment
credentials.

## Links

- Website: https://legacyvnu.pages.dev
- Author: https://wizards.foundation
