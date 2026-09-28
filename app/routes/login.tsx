import {
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import { useActionData, useNavigation, useSearchParams } from "@remix-run/react";
import type { ReactElement } from "react";

import { LoginForm, type LoginActionData } from "~/features/auth";
import {
  clearLoginFailures,
  createUserSession,
  getLoginRetryAfterSeconds,
  getUser,
  recordFailedLogin,
  sanitizeRedirectTo,
  verifyCredentials,
} from "~/features/auth/server";
import type { AuthenticatedUser } from "~/features/auth";

export const meta: MetaFunction = () => [
  { title: "Sign in | Crypto Dashboard" },
  { name: "description", content: "Sign in to view the crypto dashboard." },
];

export async function loader({ request }: LoaderFunctionArgs): Promise<null> {
  const user: AuthenticatedUser | null = await getUser(request);

  if (user !== null) {
    // eslint-disable-next-line @typescript-eslint/only-throw-error -- Remix navigation redirect
    throw redirect("/");
  }

  return null;
}

export async function action({ request }: ActionFunctionArgs): Promise<LoginActionData> {
  const formData: FormData = await request.formData();
  const username: FormDataEntryValue | null = formData.get("username");
  const password: FormDataEntryValue | null = formData.get("password");
  const redirectTo: string = sanitizeRedirectTo(formData.get("redirectTo"), "/");

  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    username.length === 0 ||
    password.length === 0
  ) {
    return { formError: "Enter both a username and a password." };
  }

  const retryAfterSeconds: number | null = getLoginRetryAfterSeconds(request);

  if (retryAfterSeconds !== null) {
    return {
      formError: `Too many failed attempts. Try again in ${String(retryAfterSeconds)} seconds.`,
    };
  }

  if (!verifyCredentials({ username, password })) {
    recordFailedLogin(request);
    return { formError: "Invalid username or password." };
  }

  clearLoginFailures(request);

  // Thrown Responses become the action's response; returning would widen the
  // action's type union and break useActionData inference.
  // eslint-disable-next-line @typescript-eslint/only-throw-error
  throw await createUserSession(username, redirectTo);
}

export default function Login(): ReactElement {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();
  const redirectTo: string = searchParams.get("redirectTo") ?? "/";
  const isSubmitting: boolean = navigation.state === "submitting";

  return (
    <main className="app-shell login-shell">
      <section className="login-panel" aria-labelledby="login-title">
        <p className="eyebrow">Crypto Dashboard</p>
        <h1 id="login-title">Sign in</h1>
        <p className="subhead">
          Use the demo account: username <code>demo</code>, password <code>crypto-demo</code>.
        </p>
        <LoginForm
          error={actionData?.formError ?? null}
          redirectTo={redirectTo}
          isSubmitting={isSubmitting}
        />
      </section>
    </main>
  );
}
