export type AuthenticatedUser = Readonly<{
  username: string;
}>;

export type LoginCredentials = Readonly<{
  username: string;
  password: string;
}>;

export type LoginActionData = Readonly<{
  formError: string;
}>;
