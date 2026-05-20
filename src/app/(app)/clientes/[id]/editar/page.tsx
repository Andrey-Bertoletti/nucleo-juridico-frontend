"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AccessDenied } from "@/components/feedback/AccessDenied";
import { LoadingState } from "@/components/feedback/LoadingState";
import { useAuth } from "@/features/auth/useAuth";
import { ClientForm } from "@/features/clients/ClientForm";
import {
  type ClientFormInput,
  type ClientFormOutput,
} from "@/features/clients/ClientFormSchema";
import { maskCpf, maskPhone } from "@/lib/format";
import { ApiError } from "@/services/api";
import { getClient, updateClient } from "@/services/clients";
import type { Client } from "@/types/client";

export default function EditarClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { hasRole } = useAuth();
  const canEdit = hasRole("aluno_estagiario", "admin_coordenacao");

  const [id, setId] = useState<string | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    void params.then((p) => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getClient(id)
      .then(setClient)
      .catch((err) =>
        setError(err instanceof ApiError ? err.detail : "Erro ao carregar."),
      )
      .finally(() => setLoading(false));
  }, [id]);

  if (!canEdit) {
    return (
      <AccessDenied message="Apenas alunos/estagiários e a coordenação podem editar clientes." />
    );
  }
  if (loading || !id) return <LoadingState message="Carregando cliente..." />;
  if (error || !client) {
    return (
      <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
        {error || "Cliente não encontrado."}
      </p>
    );
  }

  const defaults: Partial<ClientFormInput> = {
    full_name: client.full_name,
    cpf: client.cpf ? maskCpf(client.cpf) : "",
    rg: client.rg ?? "",
    birth_date: client.birth_date ?? "",
    phone: client.phone ? maskPhone(client.phone) : "",
    email: client.email ?? "",
    address: client.address ?? "",
    district: client.district ?? "",
    city: client.city ?? "",
    state: client.state ?? "",
    marital_status: (client.marital_status ?? "") as ClientFormInput["marital_status"],
    profession: client.profession ?? "",
    family_income:
      client.family_income !== null ? String(client.family_income) : "",
    notes: client.notes ?? "",
  };

  async function handleSubmit(values: ClientFormOutput) {
    setServerError(null);
    try {
      await updateClient(id!, values as never);
      router.push(`/clientes/${id}`);
    } catch (err) {
      setServerError(
        err instanceof ApiError ? err.detail : "Não foi possível atualizar.",
      );
      throw err;
    }
  }

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Editar cliente</h1>
        <p className="text-sm text-slate-500">
          Ajuste os dados cadastrais. Alterações geram histórico.
        </p>
      </div>

      <ClientForm
        defaultValues={defaults}
        onSubmit={handleSubmit}
        submitLabel="Salvar alterações"
        serverError={serverError}
        onCancel={() => router.push(`/clientes/${id}`)}
      />
    </div>
  );
}
