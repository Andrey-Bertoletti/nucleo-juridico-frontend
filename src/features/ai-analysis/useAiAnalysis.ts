"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { ApiError } from "@/services/api";
import {
  getAnalysis,
  runDocumentAction,
  runGeneralReport,
} from "@/services/aiAnalysis";
import type { AiAction, AiAnalysis } from "@/types/aiAnalysis";

const POLL_INTERVAL_MS = 2000;
const MAX_POLLS = 40; // ~80s de teto

interface RunState {
  analysis: AiAnalysis | null;
  loading: boolean;
  error: string | null;
}

/**
 * Dispara uma ação de IA (documento ou análise geral) e faz polling do status
 * até `pronto`/`erro`. Cancela o polling ao desmontar ou ao iniciar nova ação.
 */
export function useAiAnalysis() {
  const [state, setState] = useState<RunState>({
    analysis: null,
    loading: false,
    error: null,
  });

  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollCount = useRef(0);
  const activeId = useRef<string | null>(null);

  const stopPolling = useCallback(() => {
    if (pollTimer.current) {
      clearTimeout(pollTimer.current);
      pollTimer.current = null;
    }
  }, []);

  useEffect(() => stopPolling, [stopPolling]);

  const poll = useCallback(
    (id: string) => {
      pollTimer.current = setTimeout(async () => {
        if (activeId.current !== id) return; // ação trocou
        try {
          const updated = await getAnalysis(id);
          if (activeId.current !== id) return;
          setState({ analysis: updated, loading: updated.status === "processando", error: null });
          pollCount.current += 1;
          if (updated.status === "processando" && pollCount.current < MAX_POLLS) {
            poll(id);
          } else if (updated.status === "processando") {
            setState((s) => ({
              ...s,
              loading: false,
              error: "A análise está demorando mais que o esperado. Tente novamente.",
            }));
          }
        } catch (err) {
          if (activeId.current !== id) return;
          setState({
            analysis: null,
            loading: false,
            error: err instanceof ApiError ? err.detail : "Erro ao consultar a análise.",
          });
        }
      }, POLL_INTERVAL_MS);
    },
    [],
  );

  const start = useCallback(
    async (runner: () => Promise<AiAnalysis>) => {
      stopPolling();
      pollCount.current = 0;
      setState({ analysis: null, loading: true, error: null });
      try {
        const created = await runner();
        activeId.current = created.id;
        setState({ analysis: created, loading: created.status === "processando", error: null });
        if (created.status === "processando") poll(created.id);
      } catch (err) {
        setState({
          analysis: null,
          loading: false,
          error: err instanceof ApiError ? err.detail : "Erro ao iniciar a análise.",
        });
      }
    },
    [poll, stopPolling],
  );

  const runDocument = useCallback(
    (documentId: string, action: AiAction, force = false) =>
      start(() => runDocumentAction(documentId, action, force)),
    [start],
  );

  const runGeneral = useCallback(
    (clientId: string, force = false) =>
      start(() => runGeneralReport(clientId, force)),
    [start],
  );

  const reset = useCallback(() => {
    stopPolling();
    activeId.current = null;
    setState({ analysis: null, loading: false, error: null });
  }, [stopPolling]);

  return { ...state, runDocument, runGeneral, reset };
}
