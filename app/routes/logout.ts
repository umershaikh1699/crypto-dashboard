import { redirect, type ActionFunctionArgs } from "@remix-run/node";

import { logout } from "~/features/auth/server";

export async function action({ request }: ActionFunctionArgs): Promise<Response> {
  return logout(request);
}

/** Direct GET navigations to /logout just go home; signing out requires a POST. */
export function loader(): Response {
  return redirect("/");
}
