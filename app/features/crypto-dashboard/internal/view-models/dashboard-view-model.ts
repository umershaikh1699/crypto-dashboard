import type { CryptoCard, CryptoSymbol, SortMode } from "../../contracts";

export function orderCardsByCustomOrder(
  cards: readonly CryptoCard[],
  order: readonly CryptoSymbol[],
): readonly CryptoCard[] {
  const indexBySymbol: Map<CryptoSymbol, number> = new Map<CryptoSymbol, number>(
    order.map((symbol: CryptoSymbol, index: number): [CryptoSymbol, number] => [
      symbol,
      index,
    ]),
  );

  return [...cards].sort((a: CryptoCard, b: CryptoCard): number => {
    const aIndex: number = indexBySymbol.get(a.symbol) ?? Number.MAX_SAFE_INTEGER;
    const bIndex: number = indexBySymbol.get(b.symbol) ?? Number.MAX_SAFE_INTEGER;
    return aIndex - bIndex;
  });
}

export function filterCardsByQuery(
  cards: readonly CryptoCard[],
  filter: string,
): readonly CryptoCard[] {
  const query: string = filter.trim().toLowerCase();

  if (query.length === 0) {
    return cards;
  }

  return cards.filter((card: CryptoCard): boolean => {
    return (
      card.name.toLowerCase().includes(query) ||
      card.symbol.toLowerCase().includes(query)
    );
  });
}

export function sortCards(cards: readonly CryptoCard[], sortMode: SortMode): readonly CryptoCard[] {
  if (sortMode === "name") {
    return [...cards].sort((a: CryptoCard, b: CryptoCard): number =>
      a.name.localeCompare(b.name),
    );
  }

  if (sortMode === "usd") {
    return [...cards].sort(
      (a: CryptoCard, b: CryptoCard): number => (b.usdRate ?? -1) - (a.usdRate ?? -1),
    );
  }

  if (sortMode === "btc") {
    return [...cards].sort(
      (a: CryptoCard, b: CryptoCard): number => (b.btcRate ?? -1) - (a.btcRate ?? -1),
    );
  }

  return cards;
}
