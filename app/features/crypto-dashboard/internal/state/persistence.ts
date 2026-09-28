import {
  CRYPTO_SYMBOLS,
  THEME_MODES,
  type CryptoCard,
  type CryptoSymbol,
  type ThemeMode,
} from "../../contracts";

export const ORDER_STORAGE_KEY = "crypto-dashboard.card-order";
export const THEME_STORAGE_KEY = "crypto-dashboard.theme";

function isCryptoSymbol(value: string): value is CryptoSymbol {
  return (CRYPTO_SYMBOLS as readonly string[]).includes(value);
}

function isThemeMode(value: string | null): value is ThemeMode {
  return value !== null && (THEME_MODES as readonly string[]).includes(value);
}

export function mergePersistedCryptoOrder(
  storedOrder: readonly string[] | null,
  cards: readonly CryptoCard[],
): readonly CryptoSymbol[] {
  const availableSymbols: readonly CryptoSymbol[] = cards.map((card: CryptoCard) => card.symbol);
  const seen: Set<CryptoSymbol> = new Set<CryptoSymbol>();
  const merged: CryptoSymbol[] = [];

  for (const symbol of storedOrder ?? []) {
    if (
      isCryptoSymbol(symbol) &&
      availableSymbols.includes(symbol) &&
      !seen.has(symbol)
    ) {
      merged.push(symbol);
      seen.add(symbol);
    }
  }

  for (const symbol of availableSymbols) {
    if (!seen.has(symbol)) {
      merged.push(symbol);
      seen.add(symbol);
    }
  }

  return merged;
}

export function readStoredCryptoOrder(storage: Storage | undefined): readonly string[] | null {
  if (storage === undefined) {
    return null;
  }

  try {
    const raw: string | null = storage.getItem(ORDER_STORAGE_KEY);
    const parsed: unknown = raw === null ? null : JSON.parse(raw);

    return Array.isArray(parsed)
      ? parsed.filter((item: unknown): item is string => typeof item === "string")
      : null;
  } catch {
    return null;
  }
}

export function writeStoredCryptoOrder(
  storage: Storage | undefined,
  order: readonly CryptoSymbol[],
): void {
  if (storage === undefined) {
    return;
  }

  storage.setItem(ORDER_STORAGE_KEY, JSON.stringify(order));
}

export function readStoredTheme(storage: Storage | undefined): ThemeMode | null {
  if (storage === undefined) {
    return null;
  }

  const storedTheme: string | null = storage.getItem(THEME_STORAGE_KEY);
  return isThemeMode(storedTheme) ? storedTheme : null;
}

export function writeStoredTheme(storage: Storage | undefined, theme: ThemeMode): void {
  if (storage === undefined) {
    return;
  }

  storage.setItem(THEME_STORAGE_KEY, theme);
}
