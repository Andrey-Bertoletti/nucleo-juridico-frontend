"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AccessDenied } from "@/components/feedback/AccessDenied";
import { ClientForm } from "@/features/clients/ClientForm";
import { type ClientFormOutput } from "@/features/clients/ClientFormSchema";
import { useAuth } from "@/features/auth/useAuth";
import { ApiError } from "@/services/api";
import { createClient } from "@/services/clients";

export default function NovoClientePage() {
  const router = useRouter();
  const { hasRole } = useAuth();
  const allowed = hasRole("aluno_estagiario", "admin_coordenacao");

  const [serverError, setServerError] = useState<string | null>(null);

  if (!allowed) {
    return (
      <AccessDenied message="Apenas alunos/estagiários e a coordenação podem cadastrar clientes." />
    );
  }

  async function handleSubmit(values: ClientFormOutput) {
    setServerError(null);
    try {
      const created = await createClient(values as never);
      router.push(`/clientes/${created.id}`);
    } catch (err) {
      setServerError(
        err instanceof ApiError
          ? err.detail
          : "Não foi possível cadastrar o cliente.",
      );
      throw err; // mantém isSubmitting=false e exibe a mensagem
    }
  }

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Novo cliente</h1>
        <p className="text-sm text-slate-500">
          Preencha o cadastro do assistido. Campos com * são obrigatórios.
        </p>
      </div>

      <ClientForm
        onSubmit={handleSubmit}
        submitLabel="Cadastrar cliente"
        serverError={serverError}
        onCancel={() => router.push("/clientes")}
      />
    </div>
  );
}
