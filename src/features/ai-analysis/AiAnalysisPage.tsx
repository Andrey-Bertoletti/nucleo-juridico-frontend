"use client";

import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Combobox } from "@/components/ui/Combobox";
import { cn } from "@/lib/utils";
import { ApiError } from "@/services/api";
import { listClients } from "@/services/clients";
import { listClientDocuments } from "@/services/documents";
import type { ClientListItem } from "@/types/client";
import { DOCUMENT_TYPE_LABELS, type DocumentItem } from "@/types/document";
import { DOCUMENT_ACTIONS } from "@/features/ai-analysis/actions";
import { ResultPanel } from "@/features/ai-analysis/ResultPanel";
import { useAiAnalysis } from "@/features/ai-analysis/useAiAnalysis";
import type { AiAction } from "@/types/aiAnalysis";

type LastRun =
  | { kind: "document"; documentId: string; action: AiAction }
  | { kind: "general"; clientId: string }
  | null;

export function AiAnalysisPage() {
  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [clientId, setClientId] = useState<string | null>(null);

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [docsError, setDocsError] = useState<string | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);

  const [lastRun, setLastRun] = useState<LastRun>(null);

  const { analysis, loading, error, runDocument, runGeneral, reset } =
    useAiAnalysis();

  // Carrega clientes uma vez.
  useEffect(() => {
    listClients({})
      .then(setClients)
      .catch(() => setClients([]));
  }, []);

  // Carrega documentos ao trocar de cliente.
  useEffect(() => {
    reset();
    setDocumentId(null);
    setLastRun(null);
    setDocuments([]);
    if (!clientId) return;

    let cancelled = false;
    setDocsLoading(true);
    setDocsError(null);
    listClientDocuments(clientId)
      .then((docs) => {
        if (cancelled) return;
        setDocuments(docs.filter((d) => d.status !== "removido"));
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setDocsError(
          err instanceof ApiError ? err.detail : "Erro ao carregar documentos.",
        );
      })
      .finally(() => {
        if (!cancelled) setDocsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [clientId, reset]);

  const onRunDocument = useCallback(
    (action: AiAction) => {
      if (!documentId) return;
      setLastRun({ kind: "document", documentId, action });
      void runDocument(documentId, action);
    },
    [documentId, runDocument],
  );

  const onRunGeneral = useCallback(() => {
    if (!clientId) return;
    setLastRun({ kind: "general", clientId });
    void runGeneral(clientId);
  }, [clientId, runGeneral]);

  const onRefresh = useCallback(() => {
    if (!lastRun) return;
    if (lastRun.kind === "document") {
      void runDocument(lastRun.documentId, lastRun.action, true);
    } else {
      void runGeneral(lastRun.clientId, true);
    }
  }, [lastRun, runDocument, runGeneral]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5 p-4 sm:p-6">
      <header>
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-ink">
          Análise com IA
        </h1>
        <p className="mt-1 text-[14px] text-ink-muted">
          Selecione um cliente e um documento, escolha uma ação, ou gere a
          Análise Geral. A IA responde apenas com base nos documentos do NPJ.
        </p>
      </header>

      {/* 1) Cliente */}
      <Card title="1 · Cliente">
        <Combobox<ClientListItem>
          label="Selecione o cliente / assistido"
          placeholder="Buscar cliente…"
          value={clientId}
          options={clients}
          getKey={(c) => c.id}
          getLabel={(c) => c.full_name}
          getDescription={(c) => c.cpf ?? c.city ?? null}
          onChange={setClientId}
          emptyMessage="Nenhum cliente encontrado."
        />
        {clientId && (
          <div className="mt-4">
            <Button variant="brand" onClick={onRunGeneral} disabled={loading}>
              Gerar Análise Geral do cliente
            </Button>
            <p className="mt-2 text-[12px] text-ink-subtle">
              Relatório consolidado de todos os documentos: tipo de cada um e o
              que há de importante.
            </p>
          </div>
        )}
      </Card>

      {/* 2) Documentos */}
      {clientId && (
        <Card title="2 · Documento">
          {docsLoading ? (
            <p className="text-[14px] text-ink-muted">Carregando documentos…</p>
          ) : docsError ? (
            <p className="text-[14px] text-accent-rose">{docsError}</p>
          ) : documents.length === 0 ? (
            <p className="text-[14px] text-ink-muted">
              Este cliente não possui documentos.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {documents.map((doc) => {
                const selected = documentId === doc.id;
                return (
                  <li key={doc.id}>
                    <button
                      type="button"
                      onClick={() => setDocumentId(doc.id)}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition",
                        selected
                          ? "border-brand bg-brand/5 shadow-apple-sm"
                          : "border-line bg-surface-card hover:bg-surface-sunken",
                      )}
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-[14px] font-medium text-ink">
                          {doc.file_name}
                        </span>
                        <span className="block text-[12px] text-ink-subtle">
                          {DOCUMENT_TYPE_LABELS[doc.document_type] ??
                            doc.document_type}
                        </span>
                      </span>
                      {selected && (
                        <span className="shrink-0 text-[12px] font-medium text-brand">
                          Selecionado
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      )}

      {/* 3) Ações */}
      {clientId && documentId && (
        <Card title="3 · Ações de IA sobre o documento">
          <div className="flex flex-wrap gap-2">
            {DOCUMENT_ACTIONS.map((a) => (
              <Button
                key={a.action}
                variant="secondary"
                size="sm"
                title={a.description}
                disabled={loading}
                onClick={() => onRunDocument(a.action)}
              >
                {a.label}
              </Button>
            ))}
          </div>
        </Card>
      )}

      {/* 4) Resultado */}
      <ResultPanel
        analysis={analysis}
        loading={loading}
        error={error}
        onRefresh={analysis?.status === "pronto" ? onRefresh : undefined}
      />
    </div>
  );
}
