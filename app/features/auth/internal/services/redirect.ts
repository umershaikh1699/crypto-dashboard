/**
 * Guards the post-login redirect target against open-redirect abuse: only
 * same-origin absolute paths pass through; anything else (external URLs,
 * protocol-relative "//host", backslash tricks) falls back.
 */
export function sanitizeRedirectTo(value: unknown, fallback: string): string {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return fallback;
  }

  return value;
}
