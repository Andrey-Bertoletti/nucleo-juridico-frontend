"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AccessDenied } from "@/components/feedback/AccessDenied";
import { LoadingState } from "@/components/feedback/LoadingState";
import { Card } from "@/components/ui/Card";
import { UserForm, type UserFormValues } from "@/features/admin/UserForm";
import { useAuth } from "@/features/auth/useAuth";
import { ApiError } from "@/services/api";
import { getUser, updateUser } from "@/services/admin";
import type { User } from "@/types/auth";

export default function EditarUsuarioPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { hasRole } = useAuth();
  const allowed = hasRole("admin_coordenacao");

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!allowed) return;
    let cancelled = false;
    setLoading(true);
    getUser(params.id)
      .then((u) => {
        if (!cancelled) setUser(u);
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(
            err instanceof ApiError ? err.detail : "Erro ao carregar usuário.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [allowed, params.id]);

  if (!allowed) {
    return <AccessDenied message="Esta área é exclusiva para a coordenação." />;
  }
  if (loading) return <LoadingState message="Carregando usuário..." />;
  if (loadError || !user) {
    return (
      <Card>
        <p className="text-sm text-red-700">
          {loadError || "Usuário não encontrado."}
        </p>
      </Card>
    );
  }

  async function handleSubmit(values: UserFormValues) {
    setServerError(null);
    setSuccess(null);
    try {
      const updated = await updateUser(user!.id, {
        name: values.name,
        email: values.email,
        role: values.role,
      });
      setUser(updated);
      setSuccess("Dados atualizados com sucesso.");
      window.setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setServerError(
        err instanceof ApiError
          ? err.detail
          : "Não foi possível atualizar o usuário.",
      );
    }
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Editar usuário</h1>
        <p className="text-sm text-slate-500">
          Ajuste nome, e-mail ou perfil. Para mudar o status, use a tela de
          usuários.
        </p>
      </div>

      <UserForm
        mode="edit"
        defaultValues={{
          name: user.name,
          email: user.email,
          role: user.role,
        }}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/admin/usuarios")}
        serverError={serverError}
        successMessage={success}
      />
    </div>
  );
}
