import { apiFetch } from "@/services/api";
import type { LoginResponse, RegisterResponse, User } from "@/types/auth";

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export async function register(
  name: string,
  email: string,
  password: string,
): Promise<RegisterResponse> {
  return apiFetch<RegisterResponse>("/auth/register", {
    method: "POST",
    body: { name, email, password },
  });
}

export async function logout(): Promise<void> {
  await apiFetch<void>("/auth/logout", { method: "POST" });
}

export async function getMe(): Promise<User> {
  return apiFetch<User>("/auth/me");
}
