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
  changeUserStatus,
  listUsers,
  resetUserPassword,
} from "@/services/admin";
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
  const [resetConfirm, setResetConfirm] = useState<User | null>(null);
  const [resetResult, setResetResult] = useState<{
    user: User;
    password: string;
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

  async function applyReset() {
    if (!resetConfirm) return;
    setBusy(true);
    try {
      const result = await resetUserPassword(resetConfirm.user_id);
      setResetConfirm(null);
      // Mostra a senha em um segundo modal — ela só vem do servidor uma vez.
      setResetResult({ user: result.user, password: result.temp_password });
    } catch (err) {
      setFeedback({
        type: "error",
        message:
          err instanceof ApiError
            ? err.detail
            : "Não foi possível redefinir a senha.",
      });
      setResetConfirm(null);
    } finally {
      setBusy(false);
    }
  }

  async function copyPassword(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setFeedback({ type: "success", message: "Senha copiada para a área de transferência." });
      window.setTimeout(() => setFeedback(null), 3000);
    } catch {
      setFeedback({
        type: "error",
        message: "Não foi possível copiar — selecione manualmente.",
      });
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
            Usuários
          </h1>
          <p className="text-[14px] text-ink-muted">
            Cadastre, edite e gerencie o acesso de alunos, professores e
            coordenação.
          </p>
        </div>
        <Link href="/admin/usuarios/novo">
          <Button variant="brand">+ Novo usuário</Button>
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
          <table className="w-full text-left text-[13px]">
            <thead className="border-b border-line-subtle bg-surface-sunken/60 text-[11px] uppercase tracking-[0.05em] text-ink-subtle">
              <tr>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">E-mail</th>
                <th className="px-4 py-3 font-medium">Perfil</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr
                  key={u.id}
                  className="border-b border-line-subtle last:border-b-0 transition-colors hover:bg-surface-sunken/60 animate-fade-in"
                  style={{ animationDelay: `${Math.min(i * 20, 200)}ms` }}
                >
                  <td className="px-4 py-3 font-medium text-ink">{u.name}</td>
                  <td className="px-4 py-3 text-ink-muted">{u.email}</td>
                  <td className="px-4 py-3 text-ink-muted">
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
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setResetConfirm(u)}
                      >
                        Resetar senha
                      </Button>
                      {u.status === "ativo" ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="!text-accent-rose hover:!bg-accent-rose/10"
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
                          className="!text-accent-emerald hover:!bg-accent-emerald/10"
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

      {/* Confirmação do reset de senha */}
      <Modal
        open={resetConfirm !== null}
        onClose={() => setResetConfirm(null)}
        locked={busy}
        title="Redefinir senha"
        footer={
          <>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setResetConfirm(null)}
              disabled={busy}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => void applyReset()}
              isLoading={busy}
            >
              Gerar nova senha
            </Button>
          </>
        }
      >
        {resetConfirm && (
          <div className="flex flex-col gap-2 text-sm text-slate-700">
            <p>
              O sistema vai gerar uma <strong>senha temporária aleatória</strong>{" "}
              para <strong>{resetConfirm.name}</strong> ({resetConfirm.email}) e
              já aplicá-la no Supabase Auth.
            </p>
            <p className="text-slate-600">
              A senha aparecerá UMA VEZ na próxima tela — anote ou copie antes
              de fechar. Não há como recuperá-la depois (apenas gerar outra).
            </p>
            <p className="text-slate-600">
              Entregue a senha ao usuário pessoalmente e oriente que ele a
              troque pelo fluxo "Esqueci minha senha" no primeiro login.
            </p>
          </div>
        )}
      </Modal>

      {/* Resultado: mostra a senha gerada */}
      <Modal
        open={resetResult !== null}
        onClose={() => setResetResult(null)}
        title="Senha temporária gerada"
        footer={
          <Button
            type="button"
            variant="primary"
            onClick={() => setResetResult(null)}
          >
            Fechar
          </Button>
        }
      >
        {resetResult && (
          <div className="flex flex-col gap-3 text-sm text-slate-700">
            <p>
              Senha temporária para <strong>{resetResult.user.name}</strong> (
              {resetResult.user.email}):
            </p>
            <div className="flex items-center gap-2 rounded-xl border border-line bg-surface-sunken px-3 py-3">
              <code className="flex-1 select-all font-mono text-[15px] tracking-wide text-ink">
                {resetResult.password}
              </code>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => void copyPassword(resetResult.password)}
              >
                Copiar
              </Button>
            </div>
            <p className="text-[12px] text-accent-rose">
              ⚠ Esta é a única vez que a senha aparece. Anote ou copie antes de
              fechar. Se perder, é só gerar outra.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
