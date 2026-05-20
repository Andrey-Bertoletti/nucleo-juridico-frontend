"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { EmptyState } from "@/components/feedback/EmptyState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useAuth } from "@/features/auth/useAuth";
import { formatDateBR, maskCpf, maskPhone } from "@/lib/format";
import { ApiError } from "@/services/api";
import { listClients } from "@/services/clients";
import { CLIENT_STATUS_LABELS, type ClientListItem } from "@/types/client";

export default function ClientesPage() {
  const { hasRole } = useAuth();
  const canCreate = hasRole("aluno_estagiario", "admin_coordenacao");

  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "ativo" | "inativo">(
    "",
  );
  const [data, setData] = useState<ClientListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce simples para o campo de busca
  const debounced = useDebounced(search, 400);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listClients({
      search: debounced || undefined,
      city: city || undefined,
      status: statusFilter || undefined,
    })
      .then((rows) => {
        if (!cancelled) setData(rows);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(
          err instanceof ApiError ? err.detail : "Erro ao carregar clientes.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debounced, city, statusFilter]);

  const isFiltering = useMemo(
    () => Boolean(debounced || city || statusFilter),
    [debounced, city, statusFilter],
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Clientes / Assistidos
          </h1>
          <p className="text-sm text-slate-500">
            Cadastro centralizado dos assistidos do núcleo.
          </p>
        </div>
        {canCreate && (
          <Link href="/clientes/novo">
            <Button>Novo cliente</Button>
          </Link>
        )}
      </div>

      <Card>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="md:col-span-2">
            <Input
              label="Buscar"
              placeholder="Nome, CPF ou telefone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Input
            label="Cidade"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <Select
            label="Status"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "" | "ativo" | "inativo")
            }
          >
            <option value="">Todos</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </Select>
        </div>
      </Card>

      {loading ? (
        <LoadingState message="Carregando clientes..." />
      ) : error ? (
        <Card>
          <p className="text-sm text-red-700">{error}</p>
        </Card>
      ) : data.length === 0 ? (
        <EmptyState
          title={isFiltering ? "Nenhum cliente encontrado" : "Sem clientes ainda"}
          description={
            isFiltering
              ? "Tente ajustar a busca ou os filtros."
              : "Cadastre o primeiro assistido para começar."
          }
          action={
            canCreate && !isFiltering ? (
              <Link href="/clientes/novo">
                <Button>Cadastrar cliente</Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <ClientsTable rows={data} />
      )}
    </div>
  );
}

function ClientsTable({ rows }: { rows: ClientListItem[] }) {
  return (
    <Card className="overflow-x-auto !p-0">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Nome</th>
            <th className="px-4 py-3">CPF</th>
            <th className="px-4 py-3">Telefone</th>
            <th className="px-4 py-3">Cidade</th>
            <th className="px-4 py-3">Último atendimento</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => (
            <tr
              key={c.id}
              className="border-b border-slate-50 last:border-b-0 hover:bg-slate-50"
            >
              <td className="px-4 py-3 font-medium text-slate-900">
                <Link
                  href={`/clientes/${c.id}`}
                  className="hover:underline underline-offset-2"
                >
                  {c.full_name}
                </Link>
              </td>
              <td className="px-4 py-3 text-slate-700">
                {c.cpf ? maskCpf(c.cpf) : "—"}
              </td>
              <td className="px-4 py-3 text-slate-700">
                {c.phone ? maskPhone(c.phone) : "—"}
              </td>
              <td className="px-4 py-3 text-slate-700">{c.city || "—"}</td>
              <td className="px-4 py-3 text-slate-700">
                {formatDateBR(c.last_attendance_at)}
              </td>
              <td className="px-4 py-3">
                <StatusBadge value={c.status} />
              </td>
              <td className="px-4 py-3 text-right">
                <div className="inline-flex items-center gap-2">
                  <Link
                    href={`/clientes/${c.id}`}
                    className="text-xs font-medium text-slate-700 hover:underline"
                  >
                    Ver
                  </Link>
                  <Link
                    href={`/clientes/${c.id}/editar`}
                    className="text-xs font-medium text-slate-700 hover:underline"
                  >
                    Editar
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function StatusBadge({ value }: { value: keyof typeof CLIENT_STATUS_LABELS }) {
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

function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
