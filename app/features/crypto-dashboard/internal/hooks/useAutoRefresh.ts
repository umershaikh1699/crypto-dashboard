import { useEffect, useRef } from "react";

export const AUTO_REFRESH_INTERVAL_MS = 30_000;

/**
 * Calls `refresh` on a fixed interval. Ticks are skipped while the tab is
 * hidden, and a refresh fires immediately when the tab becomes visible again
 * so returning users never look at stale rates.
 */
export function useAutoRefresh(refresh: () => void, intervalMs: number): void {
  const refreshRef = useRef<() => void>(refresh);

  useEffect((): void => {
    refreshRef.current = refresh;
  });

  useEffect((): (() => void) => {
    function refreshIfVisible(): void {
      if (document.visibilityState === "visible") {
        refreshRef.current();
      }
    }

    const intervalId: number = window.setInterval(refreshIfVisible, intervalMs);
    document.addEventListener("visibilitychange", refreshIfVisible);

    return (): void => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", refreshIfVisible);
    };
  }, [intervalMs]);
}
