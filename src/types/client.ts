export type ClientStatus = "ativo" | "inativo";

export type MaritalStatus =
  | "solteiro"
  | "casado"
  | "divorciado"
  | "viuvo"
  | "uniao_estavel"
  | "separado";

export type ClientHistoryEvent =
  | "criacao"
  | "atualizacao"
  | "desativacao"
  | "reativacao"
  | "observacao";

export interface Client {
  id: string;
  full_name: string;
  cpf: string | null;
  rg: string | null;
  birth_date: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  district: string | null;
  city: string | null;
  state: string | null;
  marital_status: MaritalStatus | null;
  profession: string | null;
  family_income: string | null; // chega como string do JSON (Decimal)
  notes: string | null;
  status: ClientStatus;
  created_at: string;
  updated_at: string;
}

export interface ClientListItem {
  id: string;
  full_name: string;
  cpf: string | null;
  phone: string | null;
  city: string | null;
  status: ClientStatus;
  last_attendance_at: string | null;
  created_at: string;
}

export interface ClientHistoryItem {
  id: string;
  client_id: string;
  user_id: string | null;
  event_type: ClientHistoryEvent;
  description: string | null;
  changes: Record<string, unknown> | null;
  created_at: string;
}

export interface ClientDocument {
  id: string;
  attendance_id: string | null;
  document_type: string;
  file_name: string;
  file_url: string | null;
  storage_path: string;
  status: "pendente" | "aprovado" | "rejeitado" | "arquivado";
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

export const MARITAL_STATUS_LABELS: Record<MaritalStatus, string> = {
  solteiro: "Solteiro(a)",
  casado: "Casado(a)",
  divorciado: "Divorciado(a)",
  viuvo: "Viúvo(a)",
  uniao_estavel: "União estável",
  separado: "Separado(a)",
};

export const CLIENT_STATUS_LABELS: Record<ClientStatus, string> = {
  ativo: "Ativo",
  inativo: "Inativo",
};

export const HISTORY_EVENT_LABELS: Record<ClientHistoryEvent, string> = {
  criacao: "Cadastro criado",
  atualizacao: "Cadastro atualizado",
  desativacao: "Cliente desativado",
  reativacao: "Cliente reativado",
  observacao: "Observação",
};

export const BR_STATES: ReadonlyArray<string> = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];
