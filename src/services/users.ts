import { apiFetch } from "@/services/api";
import type { User } from "@/types/auth";

export interface UpdateUserPayload {
  name?: string;
  email?: string;
}

export async function updateUser(
  id: string,
  payload: UpdateUserPayload,
): Promise<User> {
  return apiFetch<User>(`/users/${id}`, {
    method: "PATCH",
    body: payload,
  });
}
