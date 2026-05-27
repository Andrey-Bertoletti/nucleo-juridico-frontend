"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { AccessDenied } from "@/components/feedback/AccessDenied";
import { EmptyState } from "@/components/feedback/EmptyState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { useAuth } from "@/features/auth/useAuth";
import { ApiError } from "@/services/api";
import {
  changeTemplateStatus,
  deleteTemplate,
  deleteTemplatePermanent,
  listTemplates,
} from "@/services/templates";
import {
  TEMPLATE_TYPE_LABELS,
  type Template,
  type TemplateStatus,
  type TemplateType,
} from "@/types/templates";

export default function AdminModelosPage() {
  const { hasRole } = useAuth();
  const allowed = hasRole("admin_coordenacao");

  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TemplateType | "">("");
  const [statusFilter, setStatusFilter] = useState<TemplateStatus | "">("");

  // Modal de inativar (soft delete). `permanent` abre um modal separado.
  const [confirm, setConfirm] = useState<Template | null>(null);
  const [permanentConfirm, setPermanentConfirm] = useState<Template | null>(
    null,
  );
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<
    { type: "success" | "error"; message: string } | null
  >(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setTemplates(await listTemplates());
    } catch (err) {
      setError(
        err instanceof ApiError ? err.detail : "Erro ao carregar modelos.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!allowed) return;
    void load();
  }, [allowed]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return templates.filter((t) => {
      if (typeFilter && t.type !== typeFilter) return false;
      if (statusFilter && t.status !== statusFilter) return false;
      if (q && !t.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [templates, search, typeFilter, statusFilter]);

  async function applyDelete() {
    if (!confirm) return;
    setBusy(true);
    try {
      await deleteTemplate(confirm.id);
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === confirm.id ? { ...t, status: "inativo" as const } : t,
        ),
      );
      setFeedback({
        type: "success",
        message: `Modelo "${confirm.title}" inativado.`,
      });
      setConfirm(null);
      window.setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      setFeedback({
        type: "error",
        message:
          err instanceof ApiError
            ? err.detail
            : "Não foi possível inativar o modelo.",
      });
    } finally {
      setBusy(false);
    }
  }

  async function toggleStatus(template: Template) {
    setBusy(true);
    try {
      const next = template.status === "ativo" ? "inativo" : "ativo";
      const updated = await changeTemplateStatus(template.id, next);
      setTemplates((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t)),
      );
      setFeedback({
        type: "success",
        message: `Modelo "${updated.title}" agora está ${updated.status}.`,
      });
      window.setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      setFeedback({
        type: "error",
        message:
          err instanceof ApiError
            ? err.detail
            : "Não foi possível alterar o status.",
      });
    } finally {
      setBusy(false);
    }
  }

  async function applyPermanentDelete() {
    if (!permanentConfirm) return;
    setBusy(true);
    try {
      await deleteTemplatePermanent(permanentConfirm.id);
      setTemplates((prev) => prev.filter((t) => t.id !== permanentConfirm.id));
      setFeedback({
        type: "success",
        message: `Modelo "${permanentConfirm.title}" excluído permanentemente.`,
      });
      setPermanentConfirm(null);
      window.setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      setFeedback({
        type: "error",
        message:
          err instanceof ApiError
            ? err.detail
            : "Não foi possível excluir permanentemente.",
      });
    } finally {
      setBusy(false);
    }
  }

  if (!allowed) {
    return <AccessDenied message="Esta área é exclusiva para a coordenação." />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3 animate-fade-in-down">
        <div>
          <h1 className="text-[28px] font-semibold tracking-[-0.025em] text-ink">
            Modelos do sistema
          </h1>
          <p className="text-[14px] text-ink-muted">
            Modelos reutilizáveis para relatórios, atendimentos e documentos.
            Cada modelo cadastrado pode ser usado para gerar uma versão
            preenchida e imprimível.
          </p>
        </div>
        <Link href="/admin/modelos/novo">
          <Button variant="brand">+ Novo modelo</Button>
        </Link>
      </div>

      {feedback && (
        <p
          role="status"
          className={
            feedback.type === "success"
              ? "animate-fade-in rounded-xl border border-accent-emerald/25 bg-accent-emerald/10 px-3.5 py-2.5 text-[13px] text-accent-emerald"
              : "animate-fade-in rounded-xl border border-accent-rose/25 bg-accent-rose/10 px-3.5 py-2.5 text-[13px] text-accent-rose"
          }
        >
          {feedback.message}
        </p>
      )}

      <Card>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Input
            label="Buscar"
            placeholder="Título do modelo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            label="Tipo"
            value={typeFilter}
            onChange={(e) =>
              setTypeFilter(e.target.value as TemplateType | "")
            }
          >
            <option value="">Todos</option>
            {(Object.keys(TEMPLATE_TYPE_LABELS) as TemplateType[]).map((t) => (
              <option key={t} value={t}>
                {TEMPLATE_TYPE_LABELS[t]}
              </option>
            ))}
          </Select>
          <Select
            label="Status"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as TemplateStatus | "")
            }
          >
            <option value="">Todos</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </Select>
        </div>
      </Card>

      {loading ? (
        <LoadingState message="Carregando modelos..." />
      ) : error ? (
        <Card>
          <p className="text-sm text-red-700">{error}</p>
        </Card>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Nenhum modelo cadastrado"
          description="Crie o primeiro modelo para padronizar relatórios, atendimentos ou documentos."
          action={
            <Link href="/admin/modelos/novo">
              <Button>Novo modelo</Button>
            </Link>
          }
        />
      ) : (
        <Card className="overflow-x-auto !p-0">
          <table className="w-full text-left text-[13px]">
            <thead className="border-b border-line-subtle bg-surface-sunken/60 text-[11px] uppercase tracking-[0.05em] text-ink-subtle">
              <tr>
                <th className="px-4 py-3 font-medium">Título</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Atualizado</th>
                <th className="px-4 py-3 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => (
                <tr
                  key={t.id}
                  className="border-b border-line-subtle last:border-b-0 transition-colors hover:bg-surface-sunken/60 animate-fade-in"
                  style={{ animationDelay: `${Math.min(i * 20, 200)}ms` }}
                >
                  <td className="px-4 py-3 font-medium text-ink">{t.title}</td>
                  <td className="px-4 py-3 text-ink-muted">
                    {TEMPLATE_TYPE_LABELS[t.type]}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      tone={t.status === "ativo" ? "emerald" : "neutral"}
                    >
                      {t.status === "ativo" ? "Ativo" : "Inativo"}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-3 text-ink-muted">
                    {new Date(t.updated_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex flex-wrap items-center justify-end gap-2">
                      <Link href={`/admin/modelos/${t.id}`}>
                        <Button size="sm" variant="ghost">
                          Ver
                        </Button>
                      </Link>
                      <Link href={`/admin/modelos/${t.id}/editar`}>
                        <Button size="sm" variant="secondary">
                          Editar
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => void toggleStatus(t)}
                        disabled={busy}
                      >
                        {t.status === "ativo" ? "Inativar" : "Ativar"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="!text-accent-rose hover:!bg-accent-rose/10"
                        onClick={() => setPermanentConfirm(t)}
                      >
                        Excluir
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal
        open={confirm !== null}
        onClose={() => setConfirm(null)}
        locked={busy}
        title="Inativar modelo"
        footer={
          <>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setConfirm(null)}
              disabled={busy}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={() => void applyDelete()}
              isLoading={busy}
            >
              Inativar
            </Button>
          </>
        }
      >
        {confirm && (
          <p className="text-sm text-slate-700">
            Deseja inativar o modelo <strong>{confirm.title}</strong>? Ele não
            poderá ser usado para gerar novos documentos. O histórico de
            documentos já gerados é preservado.
          </p>
        )}
      </Modal>

      <Modal
        open={permanentConfirm !== null}
        onClose={() => setPermanentConfirm(null)}
        locked={busy}
        title="Excluir modelo permanentemente"
        footer={
          <>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setPermanentConfirm(null)}
              disabled={busy}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={() => void applyPermanentDelete()}
              isLoading={busy}
            >
              Excluir definitivamente
            </Button>
          </>
        }
      >
        {permanentConfirm && (
          <div className="flex flex-col gap-2 text-sm text-slate-700">
            <p>
              Esta ação <strong>não pode ser desfeita</strong>. O modelo{" "}
              <strong>{permanentConfirm.title}</strong> será removido do banco.
            </p>
            <p className="text-slate-600">
              Se o modelo já tiver gerado documentos, a exclusão será bloqueada
              (auditoria). Nesse caso, use "Inativar" — o modelo some das
              listagens mas o histórico fica preservado.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
