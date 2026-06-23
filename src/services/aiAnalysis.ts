import { apiFetch } from "@/services/api";
import type { AiAction, AiAnalysis } from "@/types/aiAnalysis";

/** Dispara uma ação de IA sobre um documento. */
export function runDocumentAction(
  documentId: string,
  action: AiAction,
  force = false,
): Promise<AiAnalysis> {
  return apiFetch<AiAnalysis>(
    `/ai/documents/${documentId}/actions/${action}`,
    { method: "POST", body: { force } },
  );
}

/** Lê o resultado salvo (cache) de uma ação num documento. */
export function getDocumentAction(
  documentId: string,
  action: AiAction,
): Promise<AiAnalysis> {
  return apiFetch<AiAnalysis>(`/ai/documents/${documentId}/actions/${action}`);
}

/** Dispara a Análise Geral de todos os documentos de um cliente. */
export function runGeneralReport(
  clientId: string,
  force = false,
): Promise<AiAnalysis> {
  return apiFetch<AiAnalysis>(`/ai/clients/${clientId}/general-report`, {
    method: "POST",
    body: { force },
  });
}

/** Lê a Análise Geral salva (cache) de um cliente. */
export function getGeneralReport(clientId: string): Promise<AiAnalysis> {
  return apiFetch<AiAnalysis>(`/ai/clients/${clientId}/general-report`);
}

/** Polling de status por id. */
export function getAnalysis(analysisId: string): Promise<AiAnalysis> {
  return apiFetch<AiAnalysis>(`/ai/analyses/${analysisId}`);
}
