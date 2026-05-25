"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { EmptyState } from "@/components/feedback/EmptyState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { maskCpf, maskPhone } from "@/lib/format";
import { ApiError } from "@/services/api";
import { listClients } from "@/services/clients";
import type { ClientListItem } from "@/types/client";

/**
 * Tela /documentos — entrada por cliente.
 *
 * Lista os clientes ativos; clicar em um deles abre
 * `/clientes/[id]/documentos`, que agrega todos os documentos vinculados ao
 * cliente (via atendimentos). O upload em si é feito por dentro de cada
 * atendimento.
 */
export default function DocumentosPage() {
  const [search, setSearch] = useState("");
  const [data, setData] = useState<ClientListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const debounced = useDebounced(search, 400);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listClients({
      search: debounced || undefined,
      status: "ativo",
      limit: 100,
    })
      .then((rows) => {
        if (!cancelled) setData(rows);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof ApiError ? err.detail : "Erro ao carregar clientes.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  const isFiltering = useMemo(() => Boolean(debounced), [debounced]);

  return (
    <div className="flex flex-col gap-6">
      <div className="animate-fade-in-down">
        <h1 className="text-[28px] font-semibold tracking-[-0.025em] text-ink">
          Documentos
        </h1>
        <p className="text-[14px] text-ink-muted">
          Selecione um cliente para ver todos os documentos vinculados a ele.
          O upload é feito por dentro do atendimento correspondente.
        </p>
      </div>

      <Card>
        <Input
          label="Buscar cliente"
          placeholder="Nome do assistido..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Card>

      {loading ? (
        <LoadingState message="Carregando clientes..." />
      ) : error ? (
        <Card>
          <p className="text-sm text-red-700">{error}</p>
        </Card>
      ) : data.length === 0 ? (
        <EmptyState
          title={isFiltering ? "Nenhum cliente encontrado" : "Sem clientes ativos"}
          description={
            isFiltering
              ? "Tente outro termo de busca."
              : "Cadastre um cliente para começar a anexar documentos."
          }
        />
      ) : (
        <Card className="overflow-x-auto !p-0">
          <table className="w-full text-left text-[13px]">
            <thead className="border-b border-line-subtle bg-surface-sunken/60 text-[11px] uppercase tracking-[0.05em] text-ink-subtle">
              <tr>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">CPF</th>
                <th className="px-4 py-3 font-medium">Telefone</th>
                <th className="px-4 py-3 font-medium">Cidade</th>
                <th className="px-4 py-3 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {data.map((c, i) => (
                <tr
                  key={c.id}
                  className="border-b border-line-subtle last:border-b-0 transition-colors hover:bg-surface-sunken/60 animate-fade-in"
                  style={{ animationDelay: `${Math.min(i * 20, 200)}ms` }}
                >
                  <td className="px-4 py-3 font-medium text-ink">
                    <Link
                      href={`/clientes/${c.id}/documentos`}
                      className="transition-colors hover:text-brand"
                    >
                      {c.full_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-muted">
                    {c.cpf ? maskCpf(c.cpf) : "—"}
                  </td>
                  <td className="px-4 py-3 text-ink-muted">
                    {c.phone ? maskPhone(c.phone) : "—"}
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{c.city || "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/clientes/${c.id}/documentos`}>
                      <Button variant="secondary" size="sm">
                        Ver documentos
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
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
