import { apiFetch } from "@/services/api";

export interface LegalArea {
  id: string;
  name: string;
  status: "ativo" | "inativo";
  created_at: string;
  updated_at: string;
}

export interface DemandType {
  id: string;
  legal_area_id: string;
  name: string;
  status: "ativo" | "inativo";
  created_at: string;
  updated_at: string;
}

export interface UserOption {
  id: string;
  name: string;
  email: string;
}

export function listLegalAreas(): Promise<LegalArea[]> {
  return apiFetch<LegalArea[]>("/catalogs/legal-areas");
}

export function listDemandTypes(legalAreaId?: string): Promise<DemandType[]> {
  const qs = legalAreaId ? `?legal_area_id=${encodeURIComponent(legalAreaId)}` : "";
  return apiFetch<DemandType[]>(`/catalogs/demand-types${qs}`);
}

export function listTeachers(): Promise<UserOption[]> {
  return apiFetch<UserOption[]>("/catalogs/teachers");
}

export function listStudents(): Promise<UserOption[]> {
  return apiFetch<UserOption[]>("/catalogs/students");
}
