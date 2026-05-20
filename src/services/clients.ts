import { apiFetch } from "@/services/api";
import type {
  Client,
  ClientDocument,
  ClientHistoryItem,
  ClientListItem,
} from "@/types/client";

export interface ListClientsParams {
  search?: string;
  cpf?: string;
  phone?: string;
  city?: string;
  status?: "ativo" | "inativo";
  limit?: number;
  offset?: number;
}

function toQuery(params: ListClientsParams): string {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== "",
  );
  if (entries.length === 0) return "";
  const usp = new URLSearchParams();
  for (const [k, v] of entries) usp.set(k, String(v));
  return `?${usp.toString()}`;
}

export function listClients(
  params: ListClientsParams = {},
): Promise<ClientListItem[]> {
  return apiFetch<ClientListItem[]>(`/clients${toQuery(params)}`);
}

export function getClient(id: string): Promise<Client> {
  return apiFetch<Client>(`/clients/${id}`);
}

export interface ClientPayload {
  full_name: string;
  cpf: string;
  rg?: string | null;
  birth_date?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  district?: string | null;
  city?: string | null;
  state?: string | null;
  marital_status?: string | null;
  profession?: string | null;
  family_income?: number | null;
  notes?: string | null;
}

export function createClient(payload: ClientPayload): Promise<Client> {
  return apiFetch<Client>("/clients", { method: "POST", body: payload });
}

export function updateClient(
  id: string,
  payload: Partial<ClientPayload>,
): Promise<Client> {
  return apiFetch<Client>(`/clients/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteClient(id: string): Promise<void> {
  return apiFetch<void>(`/clients/${id}`, { method: "DELETE" });
}

export function getClientHistory(id: string): Promise<ClientHistoryItem[]> {
  return apiFetch<ClientHistoryItem[]>(`/clients/${id}/history`);
}

export function getClientDocuments(id: string): Promise<ClientDocument[]> {
  return apiFetch<ClientDocument[]>(`/clients/${id}/documents`);
}
