import type { ChangeEvent, ReactElement } from "react";

import type { SortMode } from "../../contracts";

type DashboardToolbarProps = Readonly<{
  filter: string;
  sortMode: SortMode;
  onFilterChange: (filter: string) => void;
  onSortModeChange: (sortMode: SortMode) => void;
}>;

function isSortMode(value: string): value is SortMode {
  return value === "custom" || value === "name" || value === "usd" || value === "btc";
}

export function DashboardToolbar({
  filter,
  sortMode,
  onFilterChange,
  onSortModeChange,
}: DashboardToolbarProps): ReactElement {
  return (
    <section className="toolbar" aria-label="Dashboard controls">
      <label className="control-group">
        <span>Filter</span>
        <input
          type="search"
          value={filter}
          onChange={(event: ChangeEvent<HTMLInputElement>): void => {
            onFilterChange(event.target.value);
          }}
          placeholder="Search name or symbol"
        />
      </label>
      <label className="control-group">
        <span>Sort</span>
        <select
          value={sortMode}
          onChange={(event: ChangeEvent<HTMLSelectElement>): void => {
            if (isSortMode(event.target.value)) {
              onSortModeChange(event.target.value);
            }
          }}
        >
          <option value="custom">Custom order</option>
          <option value="name">Name A-Z</option>
          <option value="usd">USD high-low</option>
          <option value="btc">BTC high-low</option>
        </select>
      </label>
    </section>
  );
}
