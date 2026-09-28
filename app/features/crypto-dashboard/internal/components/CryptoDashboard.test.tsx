import type * as RemixReact from "@remix-run/react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CryptoDashboard } from "../../index";
import { cryptoCardFixtures } from "../../test/fixtures";

vi.mock("@remix-run/react", async () => {
  const actual = await vi.importActual<typeof RemixReact>("@remix-run/react");
  return {
    ...actual,
    useRevalidator: (): { state: "idle"; revalidate: () => void } => ({
      state: "idle",
      revalidate: vi.fn(),
    }),
    // Remix's Form needs a router context; a plain form suffices for rendering.
    Form: ({ children, ...props }: React.ComponentProps<"form">) => (
      <form {...props}>{children}</form>
    ),
  };
});

function renderDashboard(): ReturnType<typeof render> {
  return render(
    <CryptoDashboard
      cards={cryptoCardFixtures}
      lastUpdated="2026-07-07T12:00:00.000Z"
      username="demo"
    />,
  );
}

function cardTitles(): readonly (string | null)[] {
  return screen
    .getAllByTestId("crypto-card")
    .map((card: HTMLElement): string | null => within(card).getByRole("heading").textContent);
}

describe("CryptoDashboard", () => {
  beforeEach((): void => {
    window.localStorage.clear();
  });

  it("renders at least 10 cryptocurrency cards", (): void => {
    renderDashboard();

    expect(screen.getAllByTestId("crypto-card")).toHaveLength(12);
  });

  it("filters by name and symbol", async (): Promise<void> => {
    const user = userEvent.setup();
    renderDashboard();

    await user.type(screen.getByPlaceholderText("Search name or symbol"), "eth");
    expect(screen.getAllByTestId("crypto-card")).toHaveLength(1);
    expect(screen.getByRole("heading", { name: "Ethereum" })).toBeInTheDocument();

    await user.clear(screen.getByPlaceholderText("Search name or symbol"));
    await user.type(screen.getByPlaceholderText("Search name or symbol"), "sol");
    expect(screen.getByRole("heading", { name: "Solana" })).toBeInTheDocument();
  });

  it("sorts by name and USD value", async (): Promise<void> => {
    const user = userEvent.setup();
    renderDashboard();

    await user.selectOptions(screen.getByLabelText("Sort"), "name");
    expect(cardTitles()[0]).toBe("Avalanche");

    await user.selectOptions(screen.getByLabelText("Sort"), "usd");
    expect(cardTitles()[0]).toBe("Bitcoin");
  });

  it("keeps a stored dark theme applied from the first render", (): void => {
    window.localStorage.setItem("crypto-dashboard.theme", "dark");

    renderDashboard();

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(window.localStorage.getItem("crypto-dashboard.theme")).toBe("dark");
  });

  it("renders a sparkline and signed delta for cards with trend data", (): void => {
    renderDashboard();

    expect(
      screen.getByRole("img", { name: "24-hour USD trend for Bitcoin" }),
    ).toBeInTheDocument();
    expect(screen.getByText("+2.0%")).toBeInTheDocument();
    expect(screen.getByText("-4.8%")).toBeInTheDocument();
  });

  it("shows a graceful fallback for cards without trend data", (): void => {
    renderDashboard();

    expect(screen.getAllByText("24h trend unavailable")).toHaveLength(9);
    expect(
      screen.queryByRole("img", { name: "24-hour USD trend for XRP" }),
    ).not.toBeInTheDocument();
  });

  it("shows the signed-in user and a sign-out control", (): void => {
    renderDashboard();

    expect(screen.getByText("demo")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign out" })).toBeInTheDocument();
  });

  it("shows an empty state when no cards match", async (): Promise<void> => {
    const user = userEvent.setup();
    renderDashboard();

    await user.type(screen.getByPlaceholderText("Search name or symbol"), "not-a-token");

    expect(screen.getByRole("heading", { name: "No currencies found" })).toBeInTheDocument();
  });
});
