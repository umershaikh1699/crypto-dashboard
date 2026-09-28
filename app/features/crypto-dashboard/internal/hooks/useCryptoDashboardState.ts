import { useEffect, useMemo, useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";

import type { CryptoCard, CryptoSymbol, SortMode, ThemeMode } from "../../contracts";
import {
  mergePersistedCryptoOrder,
  readStoredCryptoOrder,
  readStoredTheme,
  writeStoredCryptoOrder,
  writeStoredTheme,
} from "../state/persistence";
import {
  filterCardsByQuery,
  orderCardsByCustomOrder,
  sortCards,
} from "../view-models/dashboard-view-model";

type UseCryptoDashboardStateParams = Readonly<{
  cards: readonly CryptoCard[];
}>;

type UseCryptoDashboardStateResult = Readonly<{
  filter: string;
  sortMode: SortMode;
  theme: ThemeMode;
  customOrder: readonly CryptoSymbol[];
  visibleCards: readonly CryptoCard[];
  dragDisabled: boolean;
  setFilter: (filter: string) => void;
  setSortMode: (sortMode: SortMode) => void;
  toggleTheme: () => void;
  moveCard: (activeSymbol: CryptoSymbol, overSymbol: CryptoSymbol) => void;
}>;

function getBrowserStorage(): Storage | undefined {
  return typeof window === "undefined" ? undefined : window.localStorage;
}

function getPreferredTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedTheme: ThemeMode | null = readStoredTheme(window.localStorage);
  if (storedTheme !== null) {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function useCryptoDashboardState({
  cards,
}: UseCryptoDashboardStateParams): UseCryptoDashboardStateResult {
  const [filter, setFilter] = useState<string>("");
  const [sortMode, setSortMode] = useState<SortMode>("custom");
  // Lazy init reads the persisted theme before the first client render, so
  // the theme-writing effect below never stamps a wrong initial "light"
  // over the stored value (the cause of a white flash on reload).
  const [theme, setTheme] = useState<ThemeMode>(getPreferredTheme);
  const [customOrder, setCustomOrder] = useState<readonly CryptoSymbol[]>(() =>
    mergePersistedCryptoOrder(null, cards),
  );

  useEffect((): void => {
    const storage: Storage | undefined = getBrowserStorage();
    const storedOrder: readonly string[] | null = readStoredCryptoOrder(storage);
    setCustomOrder(mergePersistedCryptoOrder(storedOrder, cards));
  }, [cards]);

  useEffect((): void => {
    if (typeof document === "undefined") {
      return;
    }

    document.documentElement.dataset.theme = theme;
    writeStoredTheme(getBrowserStorage(), theme);
  }, [theme]);

  const visibleCards: readonly CryptoCard[] = useMemo((): readonly CryptoCard[] => {
    const orderedCards: readonly CryptoCard[] = orderCardsByCustomOrder(cards, customOrder);
    const filteredCards: readonly CryptoCard[] = filterCardsByQuery(orderedCards, filter);

    return sortCards(filteredCards, sortMode);
  }, [cards, customOrder, filter, sortMode]);

  function moveCard(activeSymbol: CryptoSymbol, overSymbol: CryptoSymbol): void {
    if (activeSymbol === overSymbol || sortMode !== "custom") {
      return;
    }

    setCustomOrder((currentOrder: readonly CryptoSymbol[]): readonly CryptoSymbol[] => {
      const activeIndex: number = currentOrder.indexOf(activeSymbol);
      const overIndex: number = currentOrder.indexOf(overSymbol);

      if (activeIndex === -1 || overIndex === -1) {
        return currentOrder;
      }

      const nextOrder: readonly CryptoSymbol[] = arrayMove(
        [...currentOrder],
        activeIndex,
        overIndex,
      );
      writeStoredCryptoOrder(getBrowserStorage(), nextOrder);
      return nextOrder;
    });
  }

  function toggleTheme(): void {
    setTheme((currentTheme: ThemeMode): ThemeMode =>
      currentTheme === "light" ? "dark" : "light",
    );
  }

  return {
    filter,
    sortMode,
    theme,
    customOrder,
    visibleCards,
    dragDisabled: sortMode !== "custom",
    setFilter,
    setSortMode,
    toggleTheme,
    moveCard,
  };
}
