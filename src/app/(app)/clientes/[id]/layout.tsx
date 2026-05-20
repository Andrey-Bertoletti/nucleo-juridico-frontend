"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { LoadingState } from "@/components/feedback/LoadingState";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/features/auth/useAuth";
import { ClientDetailContext } from "@/features/clients/ClientDetailContext";
import { formatDateBR, maskCpf, maskPhone } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ApiError } from "@/services/api";
import { deleteClient, getClient } from "@/services/clients";
import {
  CLIENT_STATUS_LABELS,
  MARITAL_STATUS_LABELS,
  type Client,
} from "@/types/client";

const TABS: Array<{ label: string; segment: string }> = [
  { label: "Dados", segment: "" },
  { label: "Atendimentos", segment: "atendimentos" },
  { label: "Documentos", segment: "documentos" },
  { label: "Histórico", segment: "historico" },
];

export default function ClientDetailLayout({
  children,
}: {
  children: ReactNode;
}) {
  const params = useParams<{ id: string }>();
  const pathname = usePathname();
  const { hasRole, user } = useAuth();

  const id = params.id;
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const canEdit = hasRole("aluno_estagiario", "admin_coordenacao");
  const canDelete = hasRole("admin_coordenacao");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getClient(id);
      setClient(data);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.detail : "Erro ao carregar cliente.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleDeactivate() {
    if (!client) return;
    if (
      !window.confirm(
        `Desativar o cliente "${client.full_name}"? Ele permanece no histórico, mas não aparecerá como ativo.`,
      )
    ) {
      return;
    }
    setDeleting(true);
    try {
      await deleteClient(client.id);
      await load();
    } catch (err) {
      window.alert(
        err instanceof ApiError ? err.detail : "Não foi possível desativar.",
      );
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <LoadingState message="Carregando cliente..." />;
  if (error || !client) {
    return (
      <Card>
        <p className="text-sm text-red-700">
          {error || "Cliente não encontrado."}
        </p>
      </Card>
    );
  }

  const basePath = `/clientes/${client.id}`;
  const activeSegment = pathname.startsWith(`${basePath}/`)
    ? pathname.replace(`${basePath}/`, "").split("/")[0] || ""
    : "";

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-slate-900">
                {client.full_name}
              </h1>
              <StatusBadge value={client.status} />
            </div>
            <dl className="grid grid-cols-1 gap-x-8 gap-y-1 text-sm text-slate-600 sm:grid-cols-2 md:grid-cols-3">
              <Field
                label="CPF"
                value={client.cpf ? maskCpf(client.cpf) : "—"}
              />
              <Field
                label="Telefone"
                value={client.phone ? maskPhone(client.phone) : "—"}
              />
              <Field label="E-mail" value={client.email || "—"} />
              <Field label="Cidade/UF" value={cityState(client)} />
              <Field
                label="Estado civil"
                value={
                  client.marital_status
                    ? MARITAL_STATUS_LABELS[client.marital_status]
                    : "—"
                }
              />
              <Field
                label="Cadastrado em"
                value={formatDateBR(client.created_at)}
              />
            </dl>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/atendimentos/novo">
              <Button>Novo atendimento</Button>
            </Link>
            {canEdit && (
              <Link href={`${basePath}/editar`}>
                <Button variant="secondary">Editar</Button>
              </Link>
            )}
            {canDelete && client.status === "ativo" && (
              <Button
                variant="danger"
                onClick={handleDeactivate}
                isLoading={deleting}
              >
                Desativar
              </Button>
            )}
          </div>
        </div>
      </Card>

      <div className="border-b border-slate-200">
        <nav className="-mb-px flex gap-6">
          {TABS.map((tab) => {
            const href = tab.segment ? `${basePath}/${tab.segment}` : basePath;
            const active = activeSegment === tab.segment;
            return (
              <Link
                key={tab.segment || "dados"}
                href={href}
                className={cn(
                  "border-b-2 px-1 pb-3 text-sm font-medium transition-colors",
                  active
                    ? "border-slate-900 text-slate-900"
                    : "border-transparent text-slate-500 hover:text-slate-700",
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <ClientDetailContext.Provider
        value={{ client, reload: load, currentUserId: user?.id }}
      >
        {children}
      </ClientDetailContext.Provider>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="text-sm text-slate-800">{value}</dd>
    </div>
  );
}

function StatusBadge({ value }: { value: Client["status"] }) {
  const colors =
    value === "ativo"
      ? "bg-emerald-50 text-emerald-700"
      : "bg-slate-100 text-slate-600";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors}`}
    >
      {CLIENT_STATUS_LABELS[value]}
    </span>
  );
}

function cityState(client: Client): string {
  const parts = [client.city, client.state].filter(Boolean);
  return parts.length > 0 ? parts.join(" / ") : "—";
}
