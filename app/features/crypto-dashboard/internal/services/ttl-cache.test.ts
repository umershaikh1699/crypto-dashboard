import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createTtlCache } from "./ttl-cache";

describe("createTtlCache", () => {
  beforeEach((): void => {
    vi.useFakeTimers();
  });

  afterEach((): void => {
    vi.useRealTimers();
  });

  it("serves a fresh value without reloading", async (): Promise<void> => {
    const load = vi.fn().mockResolvedValue("first");
    const cache = createTtlCache<string>(1_000);

    await expect(cache.get("key", load)).resolves.toBe("first");
    await expect(cache.get("key", load)).resolves.toBe("first");
    expect(load).toHaveBeenCalledTimes(1);
  });

  it("reloads after the TTL expires", async (): Promise<void> => {
    const load = vi.fn().mockResolvedValueOnce("first").mockResolvedValueOnce("second");
    const cache = createTtlCache<string>(1_000);

    await expect(cache.get("key", load)).resolves.toBe("first");
    vi.advanceTimersByTime(1_001);
    await expect(cache.get("key", load)).resolves.toBe("second");
    expect(load).toHaveBeenCalledTimes(2);
  });

  it("shares one in-flight load across concurrent misses", async (): Promise<void> => {
    const load = vi.fn().mockResolvedValue("value");
    const cache = createTtlCache<string>(1_000);

    const [a, b] = await Promise.all([cache.get("key", load), cache.get("key", load)]);

    expect(a).toBe("value");
    expect(b).toBe("value");
    expect(load).toHaveBeenCalledTimes(1);
  });

  it("serves the stale value when a reload fails", async (): Promise<void> => {
    const load = vi
      .fn()
      .mockResolvedValueOnce("good")
      .mockRejectedValueOnce(new Error("upstream down"))
      .mockResolvedValueOnce("recovered");
    const cache = createTtlCache<string>(1_000);

    await expect(cache.get("key", load)).resolves.toBe("good");
    vi.advanceTimersByTime(1_001);
    await expect(cache.get("key", load)).resolves.toBe("good");
    await expect(cache.get("key", load)).resolves.toBe("recovered");
    expect(load).toHaveBeenCalledTimes(3);
  });

  it("rejects when the first load fails and no stale value exists", async (): Promise<void> => {
    const load = vi.fn().mockRejectedValue(new Error("boom"));
    const cache = createTtlCache<string>(1_000);

    await expect(cache.get("key", load)).rejects.toThrow("boom");
  });

  it("recovers when the loader throws synchronously", async (): Promise<void> => {
    const throwingLoad = vi.fn((): Promise<string> => {
      throw new Error("sync boom");
    });
    const workingLoad = vi.fn().mockResolvedValue("works");
    const cache = createTtlCache<string>(1_000);

    await expect(cache.get("key", throwingLoad)).rejects.toThrow("sync boom");
    await expect(cache.get("key", workingLoad)).resolves.toBe("works");
  });
});
