import {
  createCookieSessionStorage,
  redirect,
  type Session,
  type SessionStorage,
} from "@remix-run/node";

import type { AuthenticatedUser } from "../../contracts";

const USER_SESSION_KEY = "username";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const LOGIN_PATH = "/login";

/**
 * Insecure fallback so the demo runs without configuration. Production
 * deployments must set SESSION_SECRET; the warning makes a missing secret
 * loud without bricking a reviewer's `npm run start`.
 */
const DEV_FALLBACK_SECRET = "crypto-dashboard-dev-secret";

function getSessionSecret(): string {
  const secret: string | undefined = process.env.SESSION_SECRET;

  if (secret !== undefined && secret.length > 0) {
    return secret;
  }

  if (process.env.NODE_ENV === "production") {
    console.warn(
      "SESSION_SECRET is not set; using an insecure built-in secret. Set it for real deployments.",
    );
  }

  return DEV_FALLBACK_SECRET;
}

const sessionStorage: SessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [getSessionSecret()],
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE_SECONDS,
  },
});

function getSession(request: Request): Promise<Session> {
  return sessionStorage.getSession(request.headers.get("Cookie"));
}

export async function getUser(request: Request): Promise<AuthenticatedUser | null> {
  const session: Session = await getSession(request);
  const username: unknown = session.get(USER_SESSION_KEY);

  return typeof username === "string" && username.length > 0 ? { username } : null;
}

/**
 * Loader guard: resolves the signed-in user or redirects to the login page,
 * preserving the originally requested path for the post-login redirect.
 */
export async function requireUser(request: Request): Promise<AuthenticatedUser> {
  const user: AuthenticatedUser | null = await getUser(request);

  if (user === null) {
    const { pathname, search } = new URL(request.url);
    const searchParams: URLSearchParams = new URLSearchParams({
      redirectTo: `${pathname}${search}`,
    });
    // Remix converts a thrown Response redirect into navigation.
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw redirect(`${LOGIN_PATH}?${searchParams.toString()}`);
  }

  return user;
}

export async function createUserSession(
  username: string,
  redirectTo: string,
): Promise<Response> {
  const session: Session = await sessionStorage.getSession();
  session.set(USER_SESSION_KEY, username);

  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session),
    },
  });
}

export async function logout(request: Request): Promise<Response> {
  const session: Session = await getSession(request);

  return redirect(LOGIN_PATH, {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}
