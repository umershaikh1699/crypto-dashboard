/**
 * Sliding-window failure counter for login brute-force protection.
 *
 * Pure and clock-injected so the policy math stays unit-testable; the
 * server wrapper (login-rate-limit.server.ts) owns the singleton and the
 * request-to-key mapping. Only *failed* attempts count against the window,
 * so a legitimate user who signs in successfully is never throttled.
 */

export type RateLimiterOptions = Readonly<{
  maxFailures: number;
  windowMs: number;
}>;

export type RateLimitDecision =
  | Readonly<{ allowed: true }>
  | Readonly<{ allowed: false; retryAfterMs: number }>;

export type RateLimiter = Readonly<{
  check: (key: string, nowMs: number) => RateLimitDecision;
  recordFailure: (key: string, nowMs: number) => void;
  reset: (key: string) => void;
}>;

export function createRateLimiter(options: RateLimiterOptions): RateLimiter {
  const failures: Map<string, readonly number[]> = new Map<string, readonly number[]>();

  function liveTimestamps(key: string, nowMs: number): readonly number[] {
    const recorded: readonly number[] = failures.get(key) ?? [];
    return recorded.filter((timestamp: number): boolean => timestamp > nowMs - options.windowMs);
  }

  /** Drop keys whose failures have all aged out so the map cannot grow unbounded. */
  function prune(nowMs: number): void {
    for (const [key, timestamps] of failures) {
      if (timestamps.every((timestamp: number): boolean => timestamp <= nowMs - options.windowMs)) {
        failures.delete(key);
      }
    }
  }

  return {
    check: (key: string, nowMs: number): RateLimitDecision => {
      const live: readonly number[] = liveTimestamps(key, nowMs);

      if (live.length < options.maxFailures) {
        return { allowed: true };
      }

      const oldestLive: number = live[0] ?? nowMs;
      return { allowed: false, retryAfterMs: oldestLive + options.windowMs - nowMs };
    },

    recordFailure: (key: string, nowMs: number): void => {
      prune(nowMs);
      failures.set(key, [...liveTimestamps(key, nowMs), nowMs]);
    },

    reset: (key: string): void => {
      failures.delete(key);
    },
  };
}
