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
import { changeUserStatus, listUsers } from "@/services/admin";
import { ROLE_LABELS, type Role, type User, type UserStatus } from "@/types/auth";

const STATUS_LABELS: Record<UserStatus, string> = {
  ativo: "Ativo",
  inativo: "Inativo",
  bloqueado: "Bloqueado",
};
const STATUS_TONES: Record<UserStatus, "emerald" | "neutral" | "rose"> = {
  ativo: "emerald",
  inativo: "neutral",
  bloqueado: "rose",
};

export default function AdminUsuariosPage() {
  const { hasRole } = useAuth();
  const allowed = hasRole("admin_coordenacao");

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "">("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "">("");

  const [confirm, setConfirm] = useState<{
    user: User;
    target: UserStatus;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<
    { type: "success" | "error"; message: string } | null
  >(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setUsers(await listUsers());
    } catch (err) {
      setError(
        err instanceof ApiError ? err.detail : "Erro ao carregar usuários.",
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
    return users.filter((u) => {
      if (roleFilter && u.role !== roleFilter) return false;
      if (statusFilter && u.status !== statusFilter) return false;
      if (
        q &&
        !u.name.toLowerCase().includes(q) &&
        !u.email.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [users, search, roleFilter, statusFilter]);

  async function applyStatus() {
    if (!confirm) return;
    setBusy(true);
    try {
      const updated = await changeUserStatus(confirm.user.id, confirm.target);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      setFeedback({
        type: "success",
        message: `Usuário "${updated.name}" agora está ${STATUS_LABELS[updated.status]}.`,
      });
      setConfirm(null);
      window.setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      setFeedback({
        type: "error",
        message:
          err instanceof ApiError
            ? err.detail
            : "Não foi possível atualizar o status.",
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Usuários</h1>
          <p className="text-sm text-slate-500">
            Cadastre, edite e gerencie o acesso de alunos, professores e
            coordenação.
          </p>
        </div>
        <Link href="/admin/usuarios/novo">
          <Button>Novo usuário</Button>
        </Link>
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
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Input
            label="Buscar"
            placeholder="Nome ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            label="Perfil"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as Role | "")}
          >
            <option value="">Todos</option>
            {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </Select>
          <Select
            label="Status"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as UserStatus | "")
            }
          >
            <option value="">Todos</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
            <option value="bloqueado">Bloqueado</option>
          </Select>
        </div>
      </Card>

      {loading ? (
        <LoadingState message="Carregando usuários..." />
      ) : error ? (
        <Card>
          <p className="text-sm text-red-700">{error}</p>
        </Card>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Nenhum usuário encontrado"
          description="Ajuste a busca ou crie um novo usuário."
          action={
            <Link href="/admin/usuarios/novo">
              <Button>Novo usuário</Button>
            </Link>
          }
        />
      ) : (
        <Card className="overflow-x-auto !p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">E-mail</th>
                <th className="px-4 py-3">Perfil</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-slate-50 last:border-b-0 hover:bg-slate-50"
                >
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {u.name}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{u.email}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {ROLE_LABELS[u.role]}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge tone={STATUS_TONES[u.status]}>
                      {STATUS_LABELS[u.status]}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <Link href={`/admin/usuarios/${u.id}/editar`}>
                        <Button size="sm" variant="secondary">
                          Editar
                        </Button>
                      </Link>
                      {u.status === "ativo" ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="!text-red-600 hover:!bg-red-50"
                          onClick={() =>
                            setConfirm({ user: u, target: "inativo" })
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
                            setConfirm({ user: u, target: "ativo" })
                          }
                        >
                          Reativar
                        </Button>
                      )}
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
        title={confirm?.target === "ativo" ? "Reativar usuário" : "Desativar usuário"}
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
              {confirm?.target === "ativo" ? "Reativar" : "Desativar"}
            </Button>
          </>
        }
      >
        {confirm && (
          <p className="text-sm text-slate-700">
            Deseja realmente{" "}
            <strong>
              {confirm.target === "ativo" ? "reativar" : "desativar"}
            </strong>{" "}
            o acesso de <strong>{confirm.user.name}</strong>?{" "}
            {confirm.target === "inativo"
              ? "O usuário não conseguirá entrar no sistema enquanto estiver inativo."
              : "Ele poderá entrar novamente após a reativação."}
          </p>
        )}
      </Modal>
    </div>
  );
}
