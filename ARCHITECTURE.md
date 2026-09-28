# Architecture Notes

This project uses a feature-first structure so product behavior, data contracts, and state rules stay close together without becoming tangled. There are two features, each with the same layering:

```
app/
  root.tsx                      # document shell + pre-paint theme script
  styles.css                    # single stylesheet; themes via CSS custom properties
  routes/
    _index.tsx                  # dashboard (auth-guarded loader)
    login.tsx                   # login form (loader + action)
    logout.ts                   # POST-only sign-out
  features/
    crypto-dashboard/           # the product
    auth/                       # the session gate
      contracts.ts              #   public types (the spec)
      index.ts                  #   public client API
      server.ts                 #   public server API for loaders/actions
      internal/                 #   private — enforced by ESLint
```

## Module Boundary (enforced, not conventional)

- Route modules may import from a feature's root (`~/features/<name>`) and its server API (`~/features/<name>/server`).
- Code outside a feature must not import `~/features/<name>/internal/*` — `eslint.config.js` makes this a lint **error**, and also blocks legacy top-level buckets (`~/utils/*`, `~/components/*`, `~/models/*`, `~/types/*`).
- Features never import each other's internals. Routes compose them: the dashboard receives the signed-in username as a plain prop.

## Feature Layers

- `contracts.ts` — public TypeScript contracts shared by server and client code. New features extend contracts first.
- `server.ts` — public server API for Remix loaders, actions, and server-side tests.
- `internal/services` — external API clients (`*.server.ts`: spot rates, hourly candles, sessions, credentials) and the pure modules beside them (candle parsing, rate normalization, trend math, redirect sanitizing), plus the generic TTL cache and the cached dashboard loader that composes it all.
- `internal/state` — browser persistence adapters (`localStorage` order/theme, validated on read-back).
- `internal/view-models` — pure filtering, sorting, and ordering transforms.
- `internal/hooks` — React lifecycle orchestration (`useCryptoDashboardState`, `useAutoRefresh`).
- `internal/components` — presentational UI composition.
- `internal/presentation` — display-only helpers: `Intl` formatters and pure sparkline geometry.

## Request Data Flow

1. `_index.tsx` loader → `requireUser` (auth feature) → redirect to `/login?redirectTo=…` when anonymous.
2. Authenticated → `getCryptoDashboardData()` → TTL cache (20s) → on miss, parallel fetches: USD rates + BTC rates + 12 candle series (all with 8s timeouts).
3. Payloads are parsed from `unknown` behind type guards, normalized into `CryptoCard[]`, trends attached best-effort.
4. Client: `useAutoRefresh` revalidates every 30s while the tab is visible; manual refresh uses the same revalidation so the loader stays the single source of truth.

Failure semantics: rates failure → thrown `Response` → route ErrorBoundary with retry; candle failure → that card's `trend` is `null` and the page still renders; cache holds the last good payload through transient outages.

## Client State

- Server data is never copied into client state — it arrives as loader data and is transformed per render by pure view-model functions.
- The only client state is interaction state (filter, sort mode, custom order, theme), owned by `useCryptoDashboardState`; `localStorage` writes are isolated to the persistence adapter.
- Theme is applied to `<html data-theme>` by a pre-paint inline script in `root.tsx`; component markup never branches on the theme (CSS resolves the glyphs), so server and client HTML always match.

## Engineering Rules

- External data is parsed at the service boundary before entering app state; payloads enter as `unknown` and pass a type guard.
- Fetching (`*.server.ts`) is separated from parsing (pure modules) so every parser is unit-testable without network mocks.
- Upstream calls flow through the TTL cache (`internal/services/ttl-cache.ts`): shared in-flight loads, stale-on-error. Never call Coinbase per-request.
- Components receive explicit props and avoid fetching, persistence, and rate math.
- Pure transforms stay testable without React or Remix; each pure module has a sibling test file.
- New follow-up features add or extend contracts first, then wire services, state, and UI through the public feature API.
