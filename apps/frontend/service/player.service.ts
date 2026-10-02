import { request } from "./http";

export type Player = {
  id: string;
  email: string;
  provider: "GUEST" | "GOOGLE" | "EMAIL";
  timezone: string;
  createdAt: string;
  lastSeenAt: string;
};

export type SignupWithPasswordInput = {
  email: string;
  password: string;
  timezone?: string;
};

export type LoginWithPasswordInput = {
  email: string;
  password: string;
};

export const playerService = {
  /** POST /users/signup/email */
  signupWithPassword: (input: SignupWithPasswordInput) =>
    request<Player>("/users/signup/email", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  /** POST /users/login/password */
  loginWithPassword: (input: LoginWithPasswordInput) =>
    request<Player>("/users/login/password", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  /** POST /users/login/google (also covers Google sign-up — auto-provisions) */
  loginWithGoogle: (idToken: string) =>
    request<Player>("/users/login/google", {
      method: "POST",
      body: JSON.stringify({ idToken }),
    }),
};
