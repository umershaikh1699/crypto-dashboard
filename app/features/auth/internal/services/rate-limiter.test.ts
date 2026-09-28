import { describe, expect, it } from "vitest";

import { createRateLimiter, type RateLimiter } from "./rate-limiter";

const MAX_FAILURES = 3;
const WINDOW_MS = 60_000;

function makeLimiter(): RateLimiter {
  return createRateLimiter({ maxFailures: MAX_FAILURES, windowMs: WINDOW_MS });
}

describe("createRateLimiter", () => {
  it("allows attempts while failures stay under the limit", (): void => {
    const limiter: RateLimiter = makeLimiter();

    limiter.recordFailure("ip", 0);
    limiter.recordFailure("ip", 1_000);

    expect(limiter.check("ip", 2_000)).toEqual({ allowed: true });
  });

  it("blocks once failures reach the limit and reports retry delay", (): void => {
    const limiter: RateLimiter = makeLimiter();

    limiter.recordFailure("ip", 0);
    limiter.recordFailure("ip", 1_000);
    limiter.recordFailure("ip", 2_000);

    // Oldest failure at t=0 leaves the window at t=60_000.
    expect(limiter.check("ip", 10_000)).toEqual({ allowed: false, retryAfterMs: 50_000 });
  });

  it("frees the key once failures age out of the window", (): void => {
    const limiter: RateLimiter = makeLimiter();

    limiter.recordFailure("ip", 0);
    limiter.recordFailure("ip", 1_000);
    limiter.recordFailure("ip", 2_000);

    expect(limiter.check("ip", WINDOW_MS + 1)).toEqual({ allowed: true });
  });

  it("only expires failures that left the window, keeping newer ones", (): void => {
    const limiter: RateLimiter = makeLimiter();

    limiter.recordFailure("ip", 0);
    limiter.recordFailure("ip", 30_000);
    limiter.recordFailure("ip", 40_000);

    // t=70_000: the t=0 failure expired, two remain — one more is allowed...
    expect(limiter.check("ip", 70_000)).toEqual({ allowed: true });

    limiter.recordFailure("ip", 70_000);

    // ...and now three live failures block again.
    expect(limiter.check("ip", 70_001)).toEqual({
      allowed: false,
      retryAfterMs: 30_000 + WINDOW_MS - 70_001,
    });
  });

  it("tracks keys independently", (): void => {
    const limiter: RateLimiter = makeLimiter();

    limiter.recordFailure("attacker", 0);
    limiter.recordFailure("attacker", 1);
    limiter.recordFailure("attacker", 2);

    expect(limiter.check("attacker", 3)).toMatchObject({ allowed: false });
    expect(limiter.check("bystander", 3)).toEqual({ allowed: true });
  });

  it("clears a key on reset", (): void => {
    const limiter: RateLimiter = makeLimiter();

    limiter.recordFailure("ip", 0);
    limiter.recordFailure("ip", 1);
    limiter.recordFailure("ip", 2);
    limiter.reset("ip");

    expect(limiter.check("ip", 3)).toEqual({ allowed: true });
  });
});
