import { afterEach, describe, expect, it } from "vitest";

import { verifyCredentials } from "./credentials.server";

describe("verifyCredentials", () => {
  afterEach((): void => {
    delete process.env.DASHBOARD_USERNAME;
    delete process.env.DASHBOARD_PASSWORD;
  });

  it("accepts the default demo credentials", (): void => {
    expect(verifyCredentials({ username: "demo", password: "crypto-demo" })).toBe(true);
  });

  it("rejects wrong usernames and passwords", (): void => {
    expect(verifyCredentials({ username: "demo", password: "wrong" })).toBe(false);
    expect(verifyCredentials({ username: "wrong", password: "crypto-demo" })).toBe(false);
    expect(verifyCredentials({ username: "", password: "" })).toBe(false);
  });

  it("honors credentials from the environment", (): void => {
    process.env.DASHBOARD_USERNAME = "ops";
    process.env.DASHBOARD_PASSWORD = "s3cret";

    expect(verifyCredentials({ username: "ops", password: "s3cret" })).toBe(true);
    expect(verifyCredentials({ username: "demo", password: "crypto-demo" })).toBe(false);
  });
});
