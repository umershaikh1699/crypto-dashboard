import { describe, expect, it } from "vitest";

import { createUserSession, getUser, logout, requireUser } from "./session.server";

function extractCookie(response: Response): string {
  const setCookie: string | null = response.headers.get("Set-Cookie");
  const cookiePair: string | undefined = setCookie?.split(";")[0];

  if (cookiePair === undefined) {
    throw new Error("expected a Set-Cookie header");
  }

  return cookiePair;
}

function requestWithCookie(url: string, cookie: string): Request {
  return new Request(url, { headers: { Cookie: cookie } });
}

describe("session round-trip", () => {
  it("createUserSession issues a cookie that getUser resolves", async (): Promise<void> => {
    const response: Response = await createUserSession("demo", "/");
    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe("/");

    const cookie: string = extractCookie(response);
    const user = await getUser(requestWithCookie("http://localhost/", cookie));

    expect(user).toEqual({ username: "demo" });
  });

  it("getUser returns null without a session cookie", async (): Promise<void> => {
    expect(await getUser(new Request("http://localhost/"))).toBeNull();
  });

  it("requireUser redirects anonymous requests to /login with the original path", async (): Promise<void> => {
    const request: Request = new Request("http://localhost/dashboard?tab=1");

    try {
      await requireUser(request);
      expect.unreachable("requireUser should have thrown a redirect");
    } catch (thrown: unknown) {
      expect(thrown).toBeInstanceOf(Response);
      const response: Response = thrown as Response;
      expect(response.status).toBe(302);
      expect(response.headers.get("Location")).toBe(
        "/login?redirectTo=%2Fdashboard%3Ftab%3D1",
      );
    }
  });

  it("logout destroys the session", async (): Promise<void> => {
    const loginResponse: Response = await createUserSession("demo", "/");
    const cookie: string = extractCookie(loginResponse);

    const logoutResponse: Response = await logout(
      requestWithCookie("http://localhost/logout", cookie),
    );
    expect(logoutResponse.headers.get("Location")).toBe("/login");

    const clearedCookie: string = extractCookie(logoutResponse);
    expect(await getUser(requestWithCookie("http://localhost/", clearedCookie))).toBeNull();
  });
});
