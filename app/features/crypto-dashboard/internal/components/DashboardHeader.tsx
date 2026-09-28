import { Form } from "@remix-run/react";
import type { ReactElement } from "react";

import { formatUpdatedAt } from "../presentation/formatters";

type DashboardHeaderProps = Readonly<{
  lastUpdated: string;
  isRefreshing: boolean;
  username: string;
  onRefresh: () => void;
  onToggleTheme: () => void;
}>;

export function DashboardHeader({
  lastUpdated,
  isRefreshing,
  username,
  onRefresh,
  onToggleTheme,
}: DashboardHeaderProps): ReactElement {
  return (
    <section className="dashboard-header" aria-labelledby="dashboard-title">
      <div>
        <p className="eyebrow">Coinbase live rates</p>
        <h1 id="dashboard-title">Crypto Dashboard</h1>
        <p className="subhead">Compare USD and BTC exchange rates for major cryptocurrencies.</p>
      </div>
      <div className="header-meta">
        <span>Updated {formatUpdatedAt(lastUpdated)}</span>
        <button
          className="icon-button"
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          aria-label="Refresh rates"
          title="Refresh rates"
        >
          <span aria-hidden="true">{isRefreshing ? "..." : "↻"}</span>
        </button>
        {/* The label and glyph are theme-independent in JSX (CSS shows one
            glyph via data-theme), so server and client HTML always match
            even though the server cannot know the visitor's theme. */}
        <button
          className="icon-button"
          type="button"
          onClick={onToggleTheme}
          aria-label="Toggle color theme"
          title="Toggle color theme"
        >
          <span className="theme-glyph theme-glyph-moon" aria-hidden="true">
            ☾
          </span>
          <span className="theme-glyph theme-glyph-sun" aria-hidden="true">
            ☀
          </span>
        </button>
        <span className="user-chip" title={`Signed in as ${username}`}>
          {username}
        </span>
        <Form method="post" action="/logout">
          <button className="text-button" type="submit">
            Sign out
          </button>
        </Form>
      </div>
    </section>
  );
}
