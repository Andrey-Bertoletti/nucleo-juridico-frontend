"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { EmptyState } from "@/components/feedback/EmptyState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ApiError } from "@/services/api";
import { listTemplates } from "@/services/templates";
import {
  TEMPLATE_TYPE_LABELS,
  type Template,
  type TemplateType,
} from "@/types/templates";

export default function ModelosPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TemplateType | "">("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        setTemplates(await listTemplates({ onlyActive: true }));
      } catch (err) {
        setError(
          err instanceof ApiError ? err.detail : "Erro ao carregar modelos.",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return templates.filter((t) => {
      if (typeFilter && t.type !== typeFilter) return false;
      if (q && !t.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [templates, search, typeFilter]);

  return (
    <div className="flex flex-col gap-6">
      <div className="animate-fade-in-down">
        <h1 className="text-[28px] font-semibold tracking-[-0.025em] text-ink">
          Modelos
        </h1>
        <p className="text-[14px] text-ink-muted">
          Selecione um modelo para gerar uma versão preenchida e pronta para
          impressão e assinatura.
        </p>
      </div>

      <Card>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Input
            label="Buscar"
            placeholder="Título do modelo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            label="Tipo"
            value={typeFilter}
            onChange={(e) =>
              setTypeFilter(e.target.value as TemplateType | "")
            }
          >
            <option value="">Todos</option>
            {(Object.keys(TEMPLATE_TYPE_LABELS) as TemplateType[]).map((t) => (
              <option key={t} value={t}>
                {TEMPLATE_TYPE_LABELS[t]}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {loading ? (
        <LoadingState message="Carregando modelos..." />
      ) : error ? (
        <Card>
          <p className="text-sm text-red-700">{error}</p>
        </Card>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Nenhum modelo disponível"
          description="A coordenação ainda não cadastrou modelos deste tipo."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t, i) => (
            <Card
              key={t.id}
              className="animate-fade-in"
              style={{ animationDelay: `${Math.min(i * 25, 200)}ms` }}
            >
              <div className="flex flex-col gap-3">
                <span className="text-[11px] uppercase tracking-[0.05em] text-ink-subtle">
                  {TEMPLATE_TYPE_LABELS[t.type]}
                </span>
                <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
                  {t.title}
                </h3>
                <p className="line-clamp-3 text-[13px] text-ink-muted">
                  {t.content.slice(0, 180)}
                  {t.content.length > 180 ? "..." : ""}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[11px] text-ink-subtle">
                    {t.dynamic_fields.length} campo(s)
                  </span>
                  <Link href={`/modelos/${t.id}/gerar`}>
                    <Button size="sm" variant="primary">
                      Gerar
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
