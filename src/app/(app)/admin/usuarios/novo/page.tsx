"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AccessDenied } from "@/components/feedback/AccessDenied";
import { UserForm, type UserFormValues } from "@/features/admin/UserForm";
import { useAuth } from "@/features/auth/useAuth";
import { ApiError } from "@/services/api";
import { createUser } from "@/services/admin";

export default function NovoUsuarioPage() {
  const router = useRouter();
  const { hasRole } = useAuth();
  const allowed = hasRole("admin_coordenacao");

  const [serverError, setServerError] = useState<string | null>(null);

  if (!allowed) {
    return <AccessDenied message="Esta área é exclusiva para a coordenação." />;
  }

  async function handleSubmit(values: UserFormValues) {
    setServerError(null);
    try {
      await createUser({
        name: values.name,
        email: values.email,
        password: values.password!,
        role: values.role,
      });
      router.push("/admin/usuarios");
    } catch (err) {
      setServerError(
        err instanceof ApiError
          ? err.detail
          : "Não foi possível cadastrar o usuário.",
      );
    }
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Novo usuário</h1>
        <p className="text-sm text-slate-500">
          Cadastre uma conta para um aluno, professor ou membro da coordenação.
        </p>
      </div>

      <UserForm
        mode="create"
        onSubmit={handleSubmit}
        onCancel={() => router.push("/admin/usuarios")}
        serverError={serverError}
      />
    </div>
  );
}
