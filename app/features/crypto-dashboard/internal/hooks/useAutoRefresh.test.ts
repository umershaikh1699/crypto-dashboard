import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useAutoRefresh } from "./useAutoRefresh";

function setDocumentVisibility(state: DocumentVisibilityState): void {
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    get: (): DocumentVisibilityState => state,
  });
}

describe("useAutoRefresh", () => {
  beforeEach((): void => {
    vi.useFakeTimers();
    setDocumentVisibility("visible");
  });

  afterEach((): void => {
    vi.useRealTimers();
  });

  it("refreshes once per interval while the tab is visible", (): void => {
    const refresh = vi.fn();
    renderHook(() => {
      useAutoRefresh(refresh, 1_000);
    });

    vi.advanceTimersByTime(3_000);

    expect(refresh).toHaveBeenCalledTimes(3);
  });

  it("skips ticks while the tab is hidden and refreshes when it becomes visible", (): void => {
    const refresh = vi.fn();
    renderHook(() => {
      useAutoRefresh(refresh, 1_000);
    });

    setDocumentVisibility("hidden");
    vi.advanceTimersByTime(5_000);
    expect(refresh).not.toHaveBeenCalled();

    setDocumentVisibility("visible");
    document.dispatchEvent(new Event("visibilitychange"));
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("stops refreshing after unmount", (): void => {
    const refresh = vi.fn();
    const { unmount } = renderHook(() => {
      useAutoRefresh(refresh, 1_000);
    });

    unmount();
    vi.advanceTimersByTime(5_000);

    expect(refresh).not.toHaveBeenCalled();
  });

  it("always calls the latest refresh callback", (): void => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderHook(
      ({ refresh }: { refresh: () => void }) => {
        useAutoRefresh(refresh, 1_000);
      },
      { initialProps: { refresh: first } },
    );

    rerender({ refresh: second });
    vi.advanceTimersByTime(1_000);

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });
});
