import { describe, expect, it } from "vitest";

import { sanitizeRedirectTo } from "./redirect";

describe("sanitizeRedirectTo", () => {
  it("allows same-origin absolute paths", (): void => {
    expect(sanitizeRedirectTo("/", "/fallback")).toBe("/");
    expect(sanitizeRedirectTo("/dashboard?tab=1", "/fallback")).toBe("/dashboard?tab=1");
  });

  it("rejects external and protocol-relative URLs", (): void => {
    expect(sanitizeRedirectTo("https://evil.example", "/")).toBe("/");
    expect(sanitizeRedirectTo("//evil.example", "/")).toBe("/");
    expect(sanitizeRedirectTo("/\\evil.example", "/")).toBe("/");
  });

  it("rejects non-string and relative values", (): void => {
    expect(sanitizeRedirectTo(null, "/")).toBe("/");
    expect(sanitizeRedirectTo(undefined, "/")).toBe("/");
    expect(sanitizeRedirectTo("dashboard", "/")).toBe("/");
    expect(sanitizeRedirectTo(42, "/")).toBe("/");
  });
});
