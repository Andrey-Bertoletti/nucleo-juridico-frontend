import { apiFetch } from "@/services/api";
import type { LoginResponse, User } from "@/types/auth";

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export interface RefreshResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export async function refresh(refreshToken: string): Promise<RefreshResponse> {
  return apiFetch<RefreshResponse>("/auth/refresh", {
    method: "POST",
    body: { refresh_token: refreshToken },
  });
}

export async function logout(): Promise<void> {
  await apiFetch<void>("/auth/logout", { method: "POST" });
}

export async function getMe(): Promise<User> {
  return apiFetch<User>("/auth/me");
}

export async function forgotPassword(
  email: string,
  redirectTo?: string,
): Promise<void> {
  await apiFetch<{ detail: string }>("/auth/forgot-password", {
    method: "POST",
    body: redirectTo ? { email, redirect_to: redirectTo } : { email },
  });
}
