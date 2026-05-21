"use client";

import { useEffect, useState, type FormEvent } from "react";

import { AccessDenied } from "@/components/feedback/AccessDenied";
import { EmptyState } from "@/components/feedback/EmptyState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/features/auth/useAuth";
import { ApiError } from "@/services/api";
import {
  adminCreateLegalArea,
  adminListLegalAreas,
  adminUpdateLegalArea,
} from "@/services/admin";
import type { LegalArea } from "@/services/catalogs";

export default function AreasJuridicasPage() {
  const { hasRole } = useAuth();
  const allowed = hasRole("admin_coordenacao");

  const [areas, setAreas] = useState<LegalArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [feedback, setFeedback] = useState<
    { type: "success" | "error"; message: string } | null
  >(null);

  const [confirm, setConfirm] = useState<{
    area: LegalArea;
    target: "ativo" | "inativo";
  } | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setAreas(await adminListLegalAreas());
    } catch (err) {
      setError(
        err instanceof ApiError ? err.detail : "Erro ao carregar áreas.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!allowed) return;
    void load();
  }, [allowed]);

  function flash(type: "success" | "error", message: string) {
    setFeedback({ type, message });
    window.setTimeout(() => setFeedback(null), 4000);
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      const created = await adminCreateLegalArea({ name: name.trim() });
      setAreas((prev) =>
        [...prev, created].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setName("");
      flash("success", `Área "${created.name}" criada.`);
    } catch (err) {
      flash(
        "error",
        err instanceof ApiError ? err.detail : "Erro ao criar área.",
      );
    } finally {
      setCreating(false);
    }
  }

  async function applyStatus() {
    if (!confirm) return;
    setBusy(true);
    try {
      const updated = await adminUpdateLegalArea(confirm.area.id, {
        status: confirm.target,
      });
      setAreas((prev) =>
        prev.map((a) => (a.id === updated.id ? updated : a)),
      );
      flash(
        "success",
        `"${updated.name}" agora está ${
          updated.status === "ativo" ? "ativa" : "inativa"
        }.`,
      );
      setConfirm(null);
    } catch (err) {
      flash(
        "error",
        err instanceof ApiError ? err.detail : "Não foi possível atualizar.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (!allowed) {
    return <AccessDenied message="Esta área é exclusiva para a coordenação." />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          Áreas jurídicas
        </h1>
        <p className="text-sm text-slate-500">
          Mantenha as áreas do direito atendidas pelo núcleo. Áreas inativas
          deixam de aparecer nos selects de cadastro.
        </p>
      </div>

      {feedback && (
        <p
          role="status"
          className={
            feedback.type === "success"
              ? "rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
              : "rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
          }
        >
          {feedback.message}
        </p>
      )}

      <Card title="Nova área">
        <form
          onSubmit={handleCreate}
          className="flex flex-col gap-3 md:flex-row md:items-end"
        >
          <div className="flex-1">
            <Input
              label="Nome da área"
              placeholder="Ex.: Direito Empresarial"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <Button type="submit" isLoading={creating} disabled={!name.trim()}>
            Adicionar
          </Button>
        </form>
      </Card>

      {loading ? (
        <LoadingState message="Carregando áreas..." />
      ) : error ? (
        <Card>
          <p className="text-sm text-red-700">{error}</p>
        </Card>
      ) : areas.length === 0 ? (
        <EmptyState
          title="Nenhuma área cadastrada"
          description="Use o formulário acima para criar a primeira área."
        />
      ) : (
        <Card className="overflow-x-auto !p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {areas.map((a) => (
                <tr
                  key={a.id}
                  className="border-b border-slate-50 last:border-b-0"
                >
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {a.name}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      tone={a.status === "ativo" ? "emerald" : "neutral"}
                    >
                      {a.status === "ativo" ? "Ativa" : "Inativa"}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {a.status === "ativo" ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="!text-red-600 hover:!bg-red-50"
                        onClick={() =>
                          setConfirm({ area: a, target: "inativo" })
                        }
                      >
                        Desativar
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="!text-emerald-700 hover:!bg-emerald-50"
                        onClick={() =>
                          setConfirm({ area: a, target: "ativo" })
                        }
                      >
                        Reativar
                      </Button>
                    )}
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
        title={
          confirm?.target === "ativo" ? "Reativar área" : "Desativar área"
        }
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
              variant={confirm?.target === "ativo" ? "primary" : "danger"}
              onClick={() => void applyStatus()}
              isLoading={busy}
            >
              Confirmar
            </Button>
          </>
        }
      >
        {confirm && (
          <p className="text-sm text-slate-700">
            Deseja{" "}
            <strong>
              {confirm.target === "ativo" ? "reativar" : "desativar"}
            </strong>{" "}
            a área <strong>{confirm.area.name}</strong>?{" "}
            {confirm.target === "inativo"
              ? "Ela continuará no histórico mas não aparecerá nos selects de novos atendimentos."
              : "Ela voltará a aparecer nos selects."}
          </p>
        )}
      </Modal>
    </div>
  );
}
