export type AiAction =
  | "resumo"
  | "pontos_chave"
  | "prazos"
  | "partes"
  | "valores"
  | "detalhes"
  | "riscos"
  | "classificacao"
  | "analise_geral";

export type AiStatus = "processando" | "pronto" | "erro";

export type AiScope = "document" | "client";

export interface AiAnalysis {
  id: string;
  scope: AiScope;
  document_id: string | null;
  client_id: string | null;
  action: AiAction;
  status: AiStatus;
  result_text: string | null;
  result_data: Record<string, unknown> | null;
  model_used: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}
