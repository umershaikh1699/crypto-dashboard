import type { HeadersFunction, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { isRouteErrorResponse, useLoaderData, useRouteError } from "@remix-run/react";

import type { AuthenticatedUser } from "~/features/auth";
import { requireUser } from "~/features/auth/server";
import { CryptoDashboard, type CryptoDashboardData } from "~/features/crypto-dashboard";
import { getCryptoDashboardData } from "~/features/crypto-dashboard/server";

type DashboardLoaderData = Readonly<{
  user: AuthenticatedUser;
  dashboard: CryptoDashboardData;
}>;

export const meta: MetaFunction = () => [
  { title: "Crypto Dashboard" },
  {
    name: "description",
    content: "A Remix dashboard for live Coinbase cryptocurrency exchange rates.",
  },
];

/**
 * Aligned with the server-side data cache: the browser may reuse a response
 * briefly and revalidate in the background instead of blocking. `private`
 * because the page now sits behind authentication — shared caches must
 * never store it.
 */
export const headers: HeadersFunction = () => ({
  "Cache-Control": "private, max-age=15, stale-while-revalidate=45",
});

export async function loader({ request }: LoaderFunctionArgs): Promise<DashboardLoaderData> {
  const user: AuthenticatedUser = await requireUser(request);
  const dashboard: CryptoDashboardData = await getCryptoDashboardData();

  return { user, dashboard };
}

export default function Index() {
  const { user, dashboard } = useLoaderData<typeof loader>();
  return (
    <CryptoDashboard
      cards={dashboard.cards}
      lastUpdated={dashboard.lastUpdated}
      username={user.username}
    />
  );
}

export function ErrorBoundary() {
  const error: unknown = useRouteError();
  const message: string =
    isRouteErrorResponse(error) && typeof error.data === "string" && error.data.length > 0
      ? error.data
      : "Unable to load Coinbase rates right now.";

  return (
    <main className="app-shell">
      <section className="error-panel" role="alert">
        <p className="eyebrow">Data unavailable</p>
        <h1>Crypto Dashboard</h1>
        <p>{message}</p>
        <a className="retry-link" href="/">
          Retry
        </a>
      </section>
    </main>
  );
}
