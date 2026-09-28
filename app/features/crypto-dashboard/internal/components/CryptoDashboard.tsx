import { useRevalidator } from "@remix-run/react";
import type { ReactElement } from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import {
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";

import { CRYPTO_SYMBOLS, type CryptoCard, type CryptoSymbol } from "../../contracts";
import { AUTO_REFRESH_INTERVAL_MS, useAutoRefresh } from "../hooks/useAutoRefresh";
import { useCryptoDashboardState } from "../hooks/useCryptoDashboardState";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardToolbar } from "./DashboardToolbar";
import { EmptyState } from "./EmptyState";
import { SortableCryptoCard } from "./SortableCryptoCard";

type CryptoDashboardProps = Readonly<{
  cards: readonly CryptoCard[];
  lastUpdated: string;
  username: string;
}>;

function toCryptoSymbol(id: UniqueIdentifier): CryptoSymbol | null {
  const candidate: string = String(id);
  return (CRYPTO_SYMBOLS as readonly string[]).includes(candidate)
    ? (candidate as CryptoSymbol)
    : null;
}

export function CryptoDashboard({
  cards,
  lastUpdated,
  username,
}: CryptoDashboardProps): ReactElement {
  const revalidator = useRevalidator();
  const state = useCryptoDashboardState({ cards });
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const isRefreshing: boolean = revalidator.state !== "idle";

  useAutoRefresh(revalidator.revalidate, AUTO_REFRESH_INTERVAL_MS);

  function handleDragEnd(event: DragEndEvent): void {
    if (event.over === null) {
      return;
    }

    const activeSymbol: CryptoSymbol | null = toCryptoSymbol(event.active.id);
    const overSymbol: CryptoSymbol | null = toCryptoSymbol(event.over.id);

    if (activeSymbol === null || overSymbol === null) {
      return;
    }

    state.moveCard(activeSymbol, overSymbol);
  }

  return (
    <main className="app-shell">
      <DashboardHeader
        lastUpdated={lastUpdated}
        isRefreshing={isRefreshing}
        username={username}
        onRefresh={revalidator.revalidate}
        onToggleTheme={state.toggleTheme}
      />

      <DashboardToolbar
        filter={state.filter}
        sortMode={state.sortMode}
        onFilterChange={state.setFilter}
        onSortModeChange={state.setSortMode}
      />

      {state.visibleCards.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={state.visibleCards.map((card: CryptoCard): CryptoSymbol => card.symbol)}
            strategy={rectSortingStrategy}
          >
            <section className="card-grid" aria-label="Cryptocurrency rates">
              {state.visibleCards.map((card: CryptoCard): ReactElement => (
                <SortableCryptoCard
                  key={card.symbol}
                  card={card}
                  dragDisabled={state.dragDisabled}
                />
              ))}
            </section>
          </SortableContext>
        </DndContext>
      ) : (
        <EmptyState />
      )}
    </main>
  );
}
