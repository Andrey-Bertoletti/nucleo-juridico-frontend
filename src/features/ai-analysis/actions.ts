import type { AiAction } from "@/types/aiAnalysis";

export interface ActionDef {
  action: Exclude<AiAction, "analise_geral">;
  label: string;
  description: string;
}

/** Catálogo dos botões de ação por documento (tudo útil para o advogado). */
export const DOCUMENT_ACTIONS: ReadonlyArray<ActionDef> = [
  { action: "resumo", label: "Resumo", description: "Resumo objetivo do documento" },
  { action: "pontos_chave", label: "Pontos Importantes", description: "Trechos mais relevantes" },
  { action: "prazos", label: "Prazos e Datas", description: "Prazos e vencimentos (confira sempre)" },
  { action: "partes", label: "Partes Envolvidas", description: "Nomes, papéis e qualificação" },
  { action: "valores", label: "Valores", description: "Valores e obrigações financeiras" },
  { action: "detalhes", label: "Análise Detalhada", description: "Leitura aprofundada do documento" },
  { action: "riscos", label: "Riscos e Atenção", description: "Cláusulas de risco e inconsistências" },
  { action: "classificacao", label: "Tipo de Documento", description: "Natureza e objeto do documento" },
] as const;

export const ACTION_LABELS: Record<AiAction, string> = {
  resumo: "Resumo",
  pontos_chave: "Pontos Importantes",
  prazos: "Prazos e Datas",
  partes: "Partes Envolvidas",
  valores: "Valores",
  detalhes: "Análise Detalhada",
  riscos: "Riscos e Atenção",
  classificacao: "Tipo de Documento",
  analise_geral: "Análise Geral",
};
