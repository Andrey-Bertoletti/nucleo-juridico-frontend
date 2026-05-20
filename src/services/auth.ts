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

export async function logout(): Promise<void> {
  await apiFetch<void>("/auth/logout", { method: "POST" });
}

export async function getMe(): Promise<User> {
  return apiFetch<User>("/auth/me");
}

export async function updateMe(payload: {
  name?: string;
  email?: string;
}): Promise<User> {
  // O endpoint PATCH /users/{id} aceita atualização do próprio usuário.
  // A página de perfil resolve o id via /auth/me antes de chamar.
  throw new Error("updateMe deve ser chamado com o id resolvido");
}
