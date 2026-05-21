export type DocumentType =
  | "rg"
  | "cpf"
  | "comprovante_residencia"
  | "comprovante_renda"
  | "certidao"
  | "documento_caso"
  | "outros";

export type DocumentStatus = "entregue" | "pendente" | "removido";

export interface DocumentItem {
  id: string;
  client_id: string | null;
  attendance_id: string | null;
  document_type: DocumentType;
  file_name: string;
  file_url: string | null;
  storage_path: string;
  status: DocumentStatus;
  notes: string | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  rg: "RG",
  cpf: "CPF",
  comprovante_residencia: "Comprovante de residência",
  comprovante_renda: "Comprovante de renda",
  certidao: "Certidão",
  documento_caso: "Documento do caso",
  outros: "Outros",
};

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  entregue: "Entregue",
  pendente: "Pendente",
  removido: "Removido",
};

export const DOCUMENT_STATUS_TONES: Record<
  DocumentStatus,
  "emerald" | "amber" | "neutral"
> = {
  entregue: "emerald",
  pendente: "amber",
  removido: "neutral",
};

export const MAX_DOCUMENT_SIZE_MB = 10;

export const ALLOWED_DOCUMENT_MIME = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const ALLOWED_DOCUMENT_EXTENSIONS = ".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx";
