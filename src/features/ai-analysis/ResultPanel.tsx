"use client";

import { Card } from "@/components/ui/Card";
import { formatDateBR } from "@/lib/format";
import { ACTION_LABELS } from "@/features/ai-analysis/actions";
import type { AiAnalysis } from "@/types/aiAnalysis";

interface ResultPanelProps {
  analysis: AiAnalysis | null;
  loading: boolean;
  error: string | null;
  /** Reexecuta a ação atual ignorando o cache. */
  onRefresh?: () => void;
}

export function ResultPanel({ analysis, loading, error, onRefresh }: ResultPanelProps) {
  if (error) {
    return (
      <Card className="border-accent-rose/40">
        <p className="text-[14px] text-accent-rose">{error}</p>
      </Card>
    );
  }

  if (loading || analysis?.status === "processando") {
    return (
      <Card>
        <div className="flex items-center gap-3 text-ink-muted">
          <span
            aria-hidden
            className="h-5 w-5 animate-spin rounded-full border-2 border-current/30 border-t-current"
          />
          <span className="text-[14px]">Analisando documento com IA…</span>
        </div>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card>
        <p className="text-[14px] text-ink-muted">
          Selecione um cliente e um documento, depois escolha uma ação acima — ou
          gere a <strong>Análise Geral</strong> do cliente.
        </p>
      </Card>
    );
  }

  if (analysis.status === "erro") {
    return (
      <Card className="border-accent-rose/40">
        <p className="text-[14px] text-accent-rose">
          {analysis.error_message || "Falha ao gerar a análise."}
        </p>
      </Card>
    );
  }

  return (
    <Card
      title={ACTION_LABELS[analysis.action]}
      description={`Gerado em ${formatDateBR(analysis.created_at)}${
        analysis.model_used ? ` · ${analysis.model_used}` : ""
      }`}
      footer={
        onRefresh ? (
          <button
            type="button"
            onClick={onRefresh}
            className="rounded-lg border border-line bg-surface-card px-3 py-1.5 text-[13px] text-ink-muted transition hover:bg-surface-sunken"
          >
            Atualizar (refazer)
          </button>
        ) : undefined
      }
    >
      <div className="whitespace-pre-wrap text-[14px] leading-relaxed text-ink">
        {analysis.result_text}
      </div>

      <p className="mt-5 border-t border-line-subtle pt-3 text-[12px] text-ink-subtle">
        ⚠️ Conteúdo gerado por IA a partir dos documentos. Confira sempre as
        informações, especialmente prazos.
      </p>
    </Card>
  );
}
