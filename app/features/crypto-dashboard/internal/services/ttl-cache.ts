/**
 * A minimal in-memory TTL cache for server loaders.
 *
 * Behavior chosen for upstream-API resilience:
 * - Fresh entries are served without touching the loader.
 * - Concurrent misses share one in-flight load (no thundering herd).
 * - When a reload fails but a stale value exists, the stale value is served
 *   so a transient upstream outage never blanks the dashboard.
 */

type CacheEntry<T> = Readonly<{
  value: T;
  expiresAt: number;
}>;

export type TtlCache<T> = Readonly<{
  get: (key: string, load: () => Promise<T>) => Promise<T>;
}>;

export function createTtlCache<T>(ttlMs: number): TtlCache<T> {
  const entries: Map<string, CacheEntry<T>> = new Map<string, CacheEntry<T>>();
  const inFlight: Map<string, Promise<T>> = new Map<string, Promise<T>>();

  async function loadAndStore(key: string, load: () => Promise<T>): Promise<T> {
    const staleEntry: CacheEntry<T> | undefined = entries.get(key);

    try {
      // Defer so a synchronously-throwing loader cannot reach the `finally`
      // cleanup before the caller has registered this promise as in-flight.
      const value: T = await Promise.resolve().then(load);
      entries.set(key, { value, expiresAt: Date.now() + ttlMs });
      return value;
    } catch (error: unknown) {
      if (staleEntry !== undefined) {
        return staleEntry.value;
      }

      throw error;
    } finally {
      inFlight.delete(key);
    }
  }

  return {
    get: (key: string, load: () => Promise<T>): Promise<T> => {
      const entry: CacheEntry<T> | undefined = entries.get(key);

      if (entry !== undefined && entry.expiresAt > Date.now()) {
        return Promise.resolve(entry.value);
      }

      const pending: Promise<T> | undefined = inFlight.get(key);

      if (pending !== undefined) {
        return pending;
      }

      const next: Promise<T> = loadAndStore(key, load);
      inFlight.set(key, next);
      return next;
    },
  };
}
