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
import { Select } from "@/components/ui/Select";
import { useAuth } from "@/features/auth/useAuth";
import { ApiError } from "@/services/api";
import {
  adminCreateDemandType,
  adminListDemandTypes,
  adminListLegalAreas,
  adminUpdateDemandType,
} from "@/services/admin";
import type { DemandType, LegalArea } from "@/services/catalogs";

export default function TiposDemandaPage() {
  const { hasRole } = useAuth();
  const allowed = hasRole("admin_coordenacao");

  const [areas, setAreas] = useState<LegalArea[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>("");
  const [types, setTypes] = useState<DemandType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [feedback, setFeedback] = useState<
    { type: "success" | "error"; message: string } | null
  >(null);

  const [confirm, setConfirm] = useState<{
    type: DemandType;
    target: "ativo" | "inativo";
  } | null>(null);
  const [busy, setBusy] = useState(false);

  // Carrega áreas uma vez
  useEffect(() => {
    if (!allowed) return;
    adminListLegalAreas()
      .then((rows) => {
        const onlyActive = rows.filter((a) => a.status === "ativo");
        setAreas(rows);
        if (onlyActive.length > 0) setSelectedArea(onlyActive[0]!.id);
        else if (rows.length > 0) setSelectedArea(rows[0]!.id);
      })
      .catch((err) =>
        setError(
          err instanceof ApiError ? err.detail : "Erro ao carregar áreas.",
        ),
      );
  }, [allowed]);

  // Carrega tipos da área selecionada
  useEffect(() => {
    if (!allowed || !selectedArea) {
      setTypes([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    adminListDemandTypes(selectedArea)
      .then((rows) => {
        if (!cancelled) setTypes(rows);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof ApiError ? err.detail : "Erro ao carregar tipos.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [allowed, selectedArea]);

  function flash(type: "success" | "error", message: string) {
    setFeedback({ type, message });
    window.setTimeout(() => setFeedback(null), 4000);
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !selectedArea) return;
    setCreating(true);
    try {
      const created = await adminCreateDemandType({
        legal_area_id: selectedArea,
        name: name.trim(),
      });
      setTypes((prev) =>
        [...prev, created].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setName("");
      flash("success", `Tipo "${created.name}" criado.`);
    } catch (err) {
      flash(
        "error",
        err instanceof ApiError ? err.detail : "Erro ao criar tipo de demanda.",
      );
    } finally {
      setCreating(false);
    }
  }

  async function applyStatus() {
    if (!confirm) return;
    setBusy(true);
    try {
      const updated = await adminUpdateDemandType(confirm.type.id, {
        status: confirm.target,
      });
      setTypes((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t)),
      );
      flash(
        "success",
        `"${updated.name}" agora está ${
          updated.status === "ativo" ? "ativo" : "inativo"
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
          Tipos de demanda
        </h1>
        <p className="text-sm text-slate-500">
          Gerencie os tipos de demanda associados a cada área jurídica.
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

      <Card>
        <Select
          label="Área jurídica"
          value={selectedArea}
          onChange={(e) => setSelectedArea(e.target.value)}
        >
          {areas.length === 0 && <option value="">Sem áreas cadastradas</option>}
          {areas.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
              {a.status === "inativo" ? " (inativa)" : ""}
            </option>
          ))}
        </Select>
      </Card>

      <Card title="Novo tipo de demanda">
        <form
          onSubmit={handleCreate}
          className="flex flex-col gap-3 md:flex-row md:items-end"
        >
          <div className="flex-1">
            <Input
              label="Nome do tipo"
              placeholder="Ex.: Revisão de contrato"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!selectedArea}
            />
          </div>
          <Button
            type="submit"
            isLoading={creating}
            disabled={!name.trim() || !selectedArea}
          >
            Adicionar
          </Button>
        </form>
      </Card>

      {loading ? (
        <LoadingState message="Carregando tipos..." />
      ) : error ? (
        <Card>
          <p className="text-sm text-red-700">{error}</p>
        </Card>
      ) : types.length === 0 ? (
        <EmptyState
          title="Nenhum tipo cadastrado nesta área"
          description="Use o formulário acima para criar o primeiro tipo de demanda."
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
              {types.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-slate-50 last:border-b-0"
                >
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {t.name}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      tone={t.status === "ativo" ? "emerald" : "neutral"}
                    >
                      {t.status === "ativo" ? "Ativo" : "Inativo"}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {t.status === "ativo" ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="!text-red-600 hover:!bg-red-50"
                        onClick={() =>
                          setConfirm({ type: t, target: "inativo" })
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
                          setConfirm({ type: t, target: "ativo" })
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
          confirm?.target === "ativo"
            ? "Reativar tipo de demanda"
            : "Desativar tipo de demanda"
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
            o tipo <strong>{confirm.type.name}</strong>?
          </p>
        )}
      </Modal>
    </div>
  );
}
