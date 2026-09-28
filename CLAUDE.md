# Crypto Dashboard — AI Contributor Guide

Remix v2 (Vite) + React 18 + strict TypeScript. Read `ARCHITECTURE.md` for the
module-boundary rules and `README.md` for product decisions before changing code.

## The gate

Every change must pass before it is done:

```bash
npm run verify   # typecheck + lint + tests + production build
```

Never weaken the gate to get a change through: no `--no-verify`, no loosening
`tsconfig.json` or `eslint.config.js`, no `any`, no unexplained `eslint-disable`.

## How to add or change a feature

1. Extend `contracts.ts` in the owning feature first (types are the spec).
2. Wire data through `internal/services` (fetchers in `*.server.ts`, parsing
   and math in pure sibling modules so they stay unit-testable).
3. Expose only through the feature's public API (`index.ts` for client,
   `server.ts` for loaders). ESLint blocks `~/features/*/internal/*` imports
   from outside the feature — do not work around it.
4. Features never import each other's internals; routes compose them and pass
   plain props across.
5. Every new pure module gets a test file beside it. Update
   `app/features/crypto-dashboard/test/fixtures.ts` when `CryptoCard` changes.

## Conventions that are easy to miss

- External payloads enter as `unknown` and pass a type guard before use.
- Trend/candle data is best-effort (degrade to `null`); spot-rate failures
  throw a `Response` so the route ErrorBoundary renders.
- Upstream fetches need an `AbortSignal.timeout` and flow through the TTL
  cache in `internal/services/ttl-cache.ts` — never call Coinbase per-request.
- Chart colors live as CSS custom properties in `app/styles.css`, one value
  per theme, and were validated for contrast/CVD — don't invent new data
  colors casually, and never encode meaning by color alone.
- The theme is applied by a pre-paint inline script in `app/root.tsx`; markup
  must never depend on the theme at render time (hydration mismatch).
- The dashboard route sends `Cache-Control: private` because it sits behind
  auth — keep it private.
