import { describe, expect, it } from "vitest";

import { cryptoCardFixtures } from "../../test/fixtures";
import {
  mergePersistedCryptoOrder,
  readStoredCryptoOrder,
  writeStoredCryptoOrder,
} from "./persistence";

describe("crypto dashboard persistence", () => {
  it("reads and writes localStorage order", (): void => {
    writeStoredCryptoOrder(window.localStorage, ["ETH", "BTC", "SOL"]);

    expect(readStoredCryptoOrder(window.localStorage)).toEqual(["ETH", "BTC", "SOL"]);
  });

  it("ignores unknown stale symbols and appends missing symbols", (): void => {
    expect(mergePersistedCryptoOrder(["UNI", "ETH", "ETH", "NOPE"], cryptoCardFixtures)).toEqual([
      "UNI",
      "ETH",
      "BTC",
      "SOL",
      "XRP",
      "DOGE",
      "ADA",
      "LTC",
      "BCH",
      "LINK",
      "AVAX",
      "DOT",
    ]);
  });
});
