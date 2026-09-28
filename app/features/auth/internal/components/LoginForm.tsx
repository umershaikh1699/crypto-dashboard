import { Form } from "@remix-run/react";
import type { ReactElement } from "react";

type LoginFormProps = Readonly<{
  error: string | null;
  redirectTo: string;
  isSubmitting: boolean;
}>;

export function LoginForm({ error, redirectTo, isSubmitting }: LoginFormProps): ReactElement {
  return (
    <Form method="post" className="login-form">
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <label className="control-group">
        <span>Username</span>
        {/* Single-purpose page: focusing the first field is the expected behavior. */}
        <input type="text" name="username" autoComplete="username" required autoFocus />
      </label>
      <label className="control-group">
        <span>Password</span>
        <input type="password" name="password" autoComplete="current-password" required />
      </label>
      {error !== null ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
      <button className="button-primary" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>
    </Form>
  );
}
