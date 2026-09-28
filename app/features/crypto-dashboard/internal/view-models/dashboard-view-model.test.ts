import { describe, expect, it } from "vitest";

import { cryptoCardFixtures } from "../../test/fixtures";
import { filterCardsByQuery, orderCardsByCustomOrder, sortCards } from "./dashboard-view-model";

describe("crypto dashboard view model", () => {
  it("filters cards by name and symbol", (): void => {
    expect(filterCardsByQuery(cryptoCardFixtures, "eth").map((card) => card.symbol)).toEqual([
      "ETH",
    ]);
    expect(filterCardsByQuery(cryptoCardFixtures, "sol").map((card) => card.symbol)).toEqual([
      "SOL",
    ]);
  });

  it("sorts by name, USD value, and BTC value", (): void => {
    expect(sortCards(cryptoCardFixtures, "name")[0]?.name).toBe("Avalanche");
    expect(sortCards(cryptoCardFixtures, "usd")[0]?.symbol).toBe("BTC");
    expect(sortCards(cryptoCardFixtures, "btc")[0]?.symbol).toBe("BTC");
  });

  it("orders cards by custom order", (): void => {
    expect(orderCardsByCustomOrder(cryptoCardFixtures, ["SOL", "BTC", "ETH"])[0]?.symbol).toBe(
      "SOL",
    );
  });
});
