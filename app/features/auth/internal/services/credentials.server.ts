import { timingSafeEqual } from "node:crypto";

import type { LoginCredentials } from "../../contracts";

/**
 * Demo credentials so reviewers can run the project with zero setup.
 * Real deployments must set DASHBOARD_USERNAME / DASHBOARD_PASSWORD
 * (see README) — and would swap this module for a real user store.
 */
const DEFAULT_USERNAME = "demo";
const DEFAULT_PASSWORD = "crypto-demo";

function getExpectedCredentials(): LoginCredentials {
  return {
    username: process.env.DASHBOARD_USERNAME ?? DEFAULT_USERNAME,
    password: process.env.DASHBOARD_PASSWORD ?? DEFAULT_PASSWORD,
  };
}

/** Constant-time string comparison so timing cannot leak prefix matches. */
function safeEquals(actual: string, expected: string): boolean {
  const actualBuffer: Buffer = Buffer.from(actual);
  const expectedBuffer: Buffer = Buffer.from(expected);

  if (actualBuffer.length !== expectedBuffer.length) {
    // Compare something anyway to keep the length branch timing-flat.
    timingSafeEqual(expectedBuffer, expectedBuffer);
    return false;
  }

  return timingSafeEqual(actualBuffer, expectedBuffer);
}

export function verifyCredentials(candidate: LoginCredentials): boolean {
  const expected: LoginCredentials = getExpectedCredentials();
  const usernameMatches: boolean = safeEquals(candidate.username, expected.username);
  const passwordMatches: boolean = safeEquals(candidate.password, expected.password);

  // Single `&&` after both checks so a wrong username costs the same time
  // as a wrong password.
  return usernameMatches && passwordMatches;
}
