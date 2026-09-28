import { createRateLimiter, type RateLimitDecision, type RateLimiter } from "./rate-limiter";

/**
 * Login brute-force throttle: 5 failed attempts per client within 15 minutes
 * locks the form until the oldest failure ages out. Successful sign-in clears
 * the counter. In-memory on purpose — single-process deployment, same
 * trade-off as the loader TTL cache; a multi-instance deployment would swap
 * this for a shared store.
 */
const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;

const limiter: RateLimiter = createRateLimiter({
  maxFailures: MAX_FAILURES,
  windowMs: WINDOW_MS,
});

/**
 * Best-effort client key. Behind a proxy the first X-Forwarded-For hop is the
 * client; bare `npm run start` has no such header, so everything shares one
 * bucket — acceptable for a single-user demo, and it fails closed rather
 * than open.
 */
function getClientKey(request: Request): string {
  const forwardedFor: string | null = request.headers.get("x-forwarded-for");
  const clientIp: string = forwardedFor?.split(",")[0]?.trim() ?? "";

  return clientIp.length > 0 ? clientIp : "unknown-client";
}

/** Seconds the client must wait before another attempt, or null when allowed. */
export function getLoginRetryAfterSeconds(request: Request): number | null {
  const decision: RateLimitDecision = limiter.check(getClientKey(request), Date.now());

  return decision.allowed ? null : Math.ceil(decision.retryAfterMs / 1000);
}

export function recordFailedLogin(request: Request): void {
  limiter.recordFailure(getClientKey(request), Date.now());
}

export function clearLoginFailures(request: Request): void {
  limiter.reset(getClientKey(request));
}
