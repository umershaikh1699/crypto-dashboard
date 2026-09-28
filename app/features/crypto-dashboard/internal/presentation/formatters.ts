const btcFormatter: Intl.NumberFormat = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 8,
});

const usdFormatter: Intl.NumberFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const changePctFormatter: Intl.NumberFormat = new Intl.NumberFormat("en-US", {
  style: "percent",
  signDisplay: "always",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const timestampFormatter: Intl.DateTimeFormat = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit",
  month: "short",
  day: "numeric",
});

export function formatUsdRate(value: number | null): string {
  return value === null ? "Unavailable" : usdFormatter.format(value);
}

export function formatBtcRate(value: number | null): string {
  return value === null ? "Unavailable" : `${btcFormatter.format(value)} BTC`;
}

/** Formats a percentage-point value (1.4 → "+1.4%"). */
export function formatChangePct(value: number): string {
  return changePctFormatter.format(value / 100);
}

export function formatUpdatedAt(value: string): string {
  return timestampFormatter.format(new Date(value));
}
