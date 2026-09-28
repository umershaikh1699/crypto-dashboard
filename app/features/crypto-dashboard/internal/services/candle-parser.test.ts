import { describe, expect, it } from "vitest";

import { parseCandleCloses } from "./candle-parser";

// [time, low, high, open, close, volume] — newest first, as Coinbase returns.
const validPayload: unknown = [
  [1751880000, 108000, 109500, 108200, 109000, 321.5],
  [1751876400, 107500, 108400, 107800, 108200, 289.1],
  [1751872800, 107000, 107900, 107100, 107800, 310.7],
];

describe("parseCandleCloses", () => {
  it("returns closes ordered oldest-first", (): void => {
    expect(parseCandleCloses(validPayload)).toEqual([107800, 108200, 109000]);
  });

  it("drops malformed rows but keeps valid ones", (): void => {
    const payload: unknown = [
      [1751880000, 108000, 109500, 108200, 109000, 321.5],
      ["bad", "row"],
      [1751876400, 107500, 108400, 107800, 108200],
      null,
      [1751872800, 107000, 107900, 107100, 107800, 310.7],
    ];

    expect(parseCandleCloses(payload)).toEqual([107800, 109000]);
  });

  it("returns null when fewer than two valid candles remain", (): void => {
    expect(parseCandleCloses([[1751880000, 1, 2, 1, 2, 3]])).toBeNull();
    expect(parseCandleCloses([])).toBeNull();
  });

  it("returns null for non-array payloads", (): void => {
    expect(parseCandleCloses(null)).toBeNull();
    expect(parseCandleCloses({ message: "rate limited" })).toBeNull();
    expect(parseCandleCloses("[]")).toBeNull();
  });

  it("rejects rows containing non-finite numbers", (): void => {
    const payload: unknown = [
      [1751880000, 108000, 109500, 108200, Number.NaN, 321.5],
      [1751876400, 107500, 108400, 107800, 108200, 289.1],
    ];

    expect(parseCandleCloses(payload)).toBeNull();
  });
});
