# Crypto Dashboard

A Remix + React + TypeScript dashboard for live cryptocurrency rates from Coinbase: 12 coins with USD/BTC prices and 24-hour sparkline trends, behind a cookie-session login.

## Features

- **12 cryptocurrencies** (BTC, ETH, SOL, XRP, DOGE, ADA, LTC, BCH, LINK, AVAX, DOT, UNI) in a responsive card grid
- **USD and BTC exchange rates** per coin, normalized from Coinbase's spot rates
- **24h trend sparkline** and signed percentage delta per card, built from hourly candles
- **Drag & drop reordering** (pointer and keyboard) with the order persisted to `localStorage`
- **Filter** by name or symbol; **sort** by name, USD, or BTC value
- **Auto-refresh every 30 seconds** while the tab is visible, plus a manual refresh button
- **Dark/light theme** that respects the OS preference, persists, and never flashes on reload
- **Authentication**: cookie-session login with `/login` and `/logout`

## Quick Start

```bash
npm install
npm run dev
```

Open the printed URL (usually `http://127.0.0.1:5173`) and sign in with the demo account:

> username `demo` · password `crypto-demo`

Production build:

```bash
npm run build
npm run start
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with HMR |
| `npm run verify` | **The gate**: typecheck + lint + tests + production build |
| `npm run typecheck` | `tsc --noEmit` (strict mode) |
| `npm run lint` | ESLint (type-checked rules + boundary enforcement) |
| `npm test` | Vitest unit and component tests |
| `npm run build` / `npm run start` | Production build / serve |

## Configuration

All optional — the app runs with safe demo defaults.

| Variable | Purpose | Default |
| --- | --- | --- |
| `SESSION_SECRET` | Signs the session cookie. **Set this for any real deployment** (a warning is logged in production if missing). | insecure dev fallback |
| `DASHBOARD_USERNAME` | Login username | `demo` |
| `DASHBOARD_PASSWORD` | Login password | `crypto-demo` |

## Data Sources

Both are public Coinbase endpoints, called only from the server:

- `api.coinbase.com/v2/exchange-rates` (USD and BTC maps) — spot rates. Coinbase returns rates relative to the requested currency, so USD prices are derived by inverting the `USD -> crypto` rate.
- `api.exchange.coinbase.com/products/{symbol}-USD/candles` — hourly candles for the 24h sparklines.

## Design Decisions & Tradeoffs

- **Server-side TTL cache (20s)** in front of all upstream calls, with in-flight request dedup and stale-on-error fallback: one Coinbase round-trip per window regardless of traffic, and a transient outage serves the last good data instead of blanking the page. The TTL sits just under the client's 30s auto-refresh so every poll returns fresh data.
- **Failure semantics are asymmetric on purpose.** A spot-rates failure throws to the route ErrorBoundary (retry UI) because the page is useless without prices; a candle failure only nulls that card's trend ("24h trend unavailable") because trends are an enhancement.
- **All fetches have 8s timeouts** so a hung upstream connection fails fast rather than hanging the loader.
- **`Cache-Control: private, max-age=15, stale-while-revalidate=45`** on the dashboard: brief browser reuse with background revalidation, `private` because the page sits behind authentication.
- **Chart colors are validated, not eyeballed** — checked for contrast and color-vision-deficiency separation against each theme's actual card surface, defined per theme as CSS custom properties. Trend direction is always glyph + signed number, never color alone.
- **No theme flash**: an inline script in `root.tsx` applies the persisted theme before first paint, and theme-dependent UI is resolved in CSS (not JSX) so server and client markup always match.
- **Auto-refresh pauses in hidden tabs** and fires immediately on return — no wasted requests overnight in a background tab.
- **Auth is a single-account demo gate**: constant-time credential comparison, open-redirect-sanitized `redirectTo`, `HttpOnly` + `SameSite=Lax` (+ `Secure` in production) cookie. A real deployment would swap the credential module for a user store with hashed passwords; the session/guard layer would not change.
- **Drag & drop is enabled only in "Custom order"** sort mode — reordering a list the app immediately re-sorts would be a lie; the handle explains this in its tooltip.

## Testing

51 tests across 12 files, run by `npm test`. Pure logic (candle parsing, trend math, rate normalization, sparkline geometry, cache behavior, redirect sanitizing) is tested without mocks because fetching is separated from parsing; sessions get a real cookie round-trip test; components are covered with Testing Library (filtering, sorting, empty state, trends, auth chrome, theme persistence).

## Documentation

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — module boundaries, feature layers, data flow, and the engineering rules.
- [`CLAUDE.md`](./CLAUDE.md) — guidelines for AI coding tools working on follow-up features.

## Follow-up Feature Guidelines

- Extend the owning feature's `contracts.ts` first, then wire services, state, and UI through the feature's public API (`index.ts` / `server.ts`).
- Keep provider-specific API code in `internal/services`, fetchers (`*.server.ts`) separate from pure parsers, so new data sources never leak into UI components.
- Prefer route loaders or resource routes for external API calls; keep browser code focused on interaction state.
- Expand the tests beside the module you change — every pure module has a sibling test file.
