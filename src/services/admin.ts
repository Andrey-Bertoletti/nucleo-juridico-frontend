import { apiFetch } from "@/services/api";
import type { LegalArea, DemandType } from "@/services/catalogs";
import type { Role, User, UserStatus } from "@/types/auth";

// ---------------------------------------------------------------------------
// Usuários (admin)
// ---------------------------------------------------------------------------
export function listUsers(): Promise<User[]> {
  return apiFetch<User[]>("/admin/users");
}

export interface UserCreatePayload {
  name: string;
  email: string;
  /** Opcional: quando ausente, o backend só envia o convite por e-mail. */
  password?: string;
  role: Role;
}

export function createUser(payload: UserCreatePayload): Promise<User> {
  return apiFetch<User>("/admin/users", {
    method: "POST",
    body: payload,
  });
}

export function getUser(id: string): Promise<User> {
  return apiFetch<User>(`/admin/users/${id}`);
}

export interface UserUpdatePayload {
  name?: string;
  email?: string;
  role?: Role;
}

export function updateUser(
  id: string,
  payload: UserUpdatePayload,
): Promise<User> {
  return apiFetch<User>(`/admin/users/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export function changeUserStatus(
  id: string,
  status: UserStatus,
): Promise<User> {
  return apiFetch<User>(`/admin/users/${id}/status`, {
    method: "PATCH",
    body: { status },
  });
}

export interface PasswordResetResult {
  user: User;
  temp_password: string;
}

/** Redefine senha do usuário gerando uma senha temporária aleatória. */
export function resetUserPassword(id: string): Promise<PasswordResetResult> {
  return apiFetch<PasswordResetResult>(`/admin/users/${id}/reset-password`, {
    method: "POST",
  });
}

// ---------------------------------------------------------------------------
// Áreas jurídicas (admin)
// ---------------------------------------------------------------------------
export function adminListLegalAreas(): Promise<LegalArea[]> {
  return apiFetch<LegalArea[]>("/admin/legal-areas");
}

export function adminCreateLegalArea(payload: {
  name: string;
  status?: "ativo" | "inativo";
}): Promise<LegalArea> {
  return apiFetch<LegalArea>("/admin/legal-areas", {
    method: "POST",
    body: payload,
  });
}

export function adminUpdateLegalArea(
  id: string,
  payload: { name?: string; status?: "ativo" | "inativo" },
): Promise<LegalArea> {
  return apiFetch<LegalArea>(`/admin/legal-areas/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

// ---------------------------------------------------------------------------
// Tipos de demanda (admin)
// ---------------------------------------------------------------------------
export function adminListDemandTypes(
  legalAreaId?: string,
): Promise<DemandType[]> {
  const qs = legalAreaId
    ? `?legal_area_id=${encodeURIComponent(legalAreaId)}`
    : "";
  return apiFetch<DemandType[]>(`/admin/demand-types${qs}`);
}

export function adminCreateDemandType(payload: {
  legal_area_id: string;
  name: string;
  status?: "ativo" | "inativo";
}): Promise<DemandType> {
  return apiFetch<DemandType>("/admin/demand-types", {
    method: "POST",
    body: payload,
  });
}

export function adminUpdateDemandType(
  id: string,
  payload: {
    legal_area_id?: string;
    name?: string;
    status?: "ativo" | "inativo";
  },
): Promise<DemandType> {
  return apiFetch<DemandType>(`/admin/demand-types/${id}`, {
    method: "PATCH",
    body: payload,
  });
}
