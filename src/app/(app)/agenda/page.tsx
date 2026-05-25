"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { EmptyState } from "@/components/feedback/EmptyState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { AppointmentStatusBadge } from "@/components/feedback/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { AppointmentsCalendar } from "@/features/appointments/AppointmentsCalendar";
import { useAuth } from "@/features/auth/useAuth";
import { cn } from "@/lib/utils";
import { ApiError } from "@/services/api";
import { listAppointments } from "@/services/appointments";
import {
  listStudents,
  listTeachers,
  type UserOption,
} from "@/services/catalogs";
import {
  APPOINTMENT_STATUS_LABELS,
  type AppointmentListItem,
  type AppointmentStatus,
} from "@/types/appointment";

type View = "list" | "calendar";

export default function AgendaPage() {
  const { hasRole } = useAuth();
  const canCreate = hasRole(
    "aluno_estagiario",
    "professor_orientador",
    "admin_coordenacao",
  );

  const [view, setView] = useState<View>("list");

  const today = useMemo(() => toIsoLocal(new Date()), []);
  const [listDate, setListDate] = useState(today);

  const now = useMemo(() => new Date(), []);
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth() + 1);

  const [responsibleId, setResponsibleId] = useState("");
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "">("");
  const [responsibles, setResponsibles] = useState<UserOption[]>([]);

  const [items, setItems] = useState<AppointmentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([listStudents(), listTeachers()])
      .then(([ss, ts]) => {
        const merged = new Map<string, UserOption>();
        for (const u of [...ss, ...ts]) merged.set(u.id, u);
        setResponsibles(Array.from(merged.values()));
      })
      .catch(() => {
        /* auxiliar */
      });
  }, []);

  const { from, to } = useMemo(() => {
    if (view === "list") {
      return { from: listDate, to: listDate };
    }
    const first = new Date(calYear, calMonth - 1, 1);
    const last = new Date(calYear, calMonth, 0);
    const fromD = new Date(first);
    fromD.setDate(fromD.getDate() - 7);
    const toD = new Date(last);
    toD.setDate(toD.getDate() + 7);
    return { from: toIsoLocal(fromD), to: toIsoLocal(toD) };
  }, [view, listDate, calYear, calMonth]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listAppointments({
      from,
      to,
      responsible_id: responsibleId || undefined,
      status: statusFilter || undefined,
    })
      .then((rows) => {
        if (!cancelled) setItems(rows);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof ApiError ? err.detail : "Erro ao carregar a agenda.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [from, to, responsibleId, statusFilter]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3 animate-fade-in-down">
        <div>
          <h1 className="text-[28px] font-semibold tracking-[-0.025em] text-ink">
            Agenda
          </h1>
          <p className="text-[14px] text-ink-muted">
            Retornos do núcleo. Aluno vê os próprios; professor vê os
            atendimentos sob sua orientação; coordenação vê tudo.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ViewToggle value={view} onChange={setView} />
          {canCreate && (
            <Link href="/agenda/novo">
              <Button variant="brand">+ Novo retorno</Button>
            </Link>
          )}
        </div>
      </div>

      <Card>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {view === "list" && (
            <Input
              label="Data"
              type="date"
              value={listDate}
              onChange={(e) => setListDate(e.target.value || today)}
            />
          )}
          <Select
            label="Responsável"
            value={responsibleId}
            onChange={(e) => setResponsibleId(e.target.value)}
          >
            <option value="">Todos</option>
            {responsibles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </Select>
          <Select
            label="Status"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as AppointmentStatus | "")
            }
          >
            <option value="">Todos</option>
            {(
              Object.keys(APPOINTMENT_STATUS_LABELS) as AppointmentStatus[]
            ).map((s) => (
              <option key={s} value={s}>
                {APPOINTMENT_STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {loading ? (
        <LoadingState message="Carregando agenda..." />
      ) : error ? (
        <Card>
          <p className="text-sm text-red-700">{error}</p>
        </Card>
      ) : view === "list" ? (
        <ListView items={items} listDate={listDate} canCreate={canCreate} />
      ) : (
        <AppointmentsCalendar
          appointments={items}
          month={calMonth}
          year={calYear}
          onChangeMonth={(y, m) => {
            setCalYear(y);
            setCalMonth(m);
          }}
        />
      )}
    </div>
  );
}

function ViewToggle({
  value,
  onChange,
}: {
  value: View;
  onChange: (v: View) => void;
}) {
  return (
    <div className="flex gap-1 rounded-xl border border-line bg-surface-sunken p-1">
      <button
        type="button"
        onClick={() => onChange("list")}
        className={cn(
          "rounded-lg px-3 py-1.5 text-[12px] font-medium tracking-[-0.005em]",
          "transition-all duration-200 ease-apple-snap",
          value === "list"
            ? "bg-surface-card text-ink shadow-apple-sm"
            : "text-ink-muted hover:text-ink",
        )}
      >
        Lista
      </button>
      <button
        type="button"
        onClick={() => onChange("calendar")}
        className={cn(
          "rounded-lg px-3 py-1.5 text-[12px] font-medium tracking-[-0.005em]",
          "transition-all duration-200 ease-apple-snap",
          value === "calendar"
            ? "bg-surface-card text-ink shadow-apple-sm"
            : "text-ink-muted hover:text-ink",
        )}
      >
        Calendário
      </button>
    </div>
  );
}

function ListView({
  items,
  listDate,
  canCreate,
}: {
  items: AppointmentListItem[];
  listDate: string;
  canCreate: boolean;
}) {
  if (items.length === 0) {
    return (
      <EmptyState
        title={`Sem retornos para ${formatBrDate(listDate)}`}
        description="Mude o filtro de data ou crie um novo retorno."
        action={
          canCreate ? (
            <Link href="/agenda/novo">
              <Button>Novo retorno</Button>
            </Link>
          ) : undefined
        }
      />
    );
  }

  return (
    <Card className="overflow-x-auto !p-0">
      <table className="w-full text-left text-[13px]">
        <thead className="border-b border-line-subtle bg-surface-sunken/60 text-[11px] uppercase tracking-[0.05em] text-ink-subtle">
          <tr>
            <th className="px-4 py-3 font-medium">Horário</th>
            <th className="px-4 py-3 font-medium">Cliente</th>
            <th className="px-4 py-3 font-medium">Motivo</th>
            <th className="px-4 py-3 font-medium">Atendimento</th>
            <th className="px-4 py-3 font-medium">Responsável</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 text-right font-medium">Ações</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => (
            <tr
              key={it.id}
              className="border-b border-line-subtle last:border-b-0 transition-colors hover:bg-surface-sunken/60 animate-fade-in"
              style={{ animationDelay: `${Math.min(i * 20, 200)}ms` }}
            >
              <td className="px-4 py-3 font-semibold text-ink tabular-nums">
                {it.appointment_time ? it.appointment_time.slice(0, 5) : "—"}
              </td>
              <td className="px-4 py-3 text-ink-muted">
                <Link
                  href={`/clientes/${it.client_id}`}
                  className="transition-colors hover:text-brand"
                >
                  {it.client_name}
                </Link>
              </td>
              <td className="px-4 py-3 text-ink-muted">{it.reason || "—"}</td>
              <td className="px-4 py-3 text-ink-muted">
                {it.attendance_id ? (
                  <Link
                    href={`/atendimentos/${it.attendance_id}`}
                    className="text-brand transition-colors hover:text-brand-hover"
                  >
                    Abrir atendimento
                  </Link>
                ) : (
                  "—"
                )}
              </td>
              <td className="px-4 py-3 text-ink-muted">
                {it.responsible_name || "—"}
              </td>
              <td className="px-4 py-3">
                <AppointmentStatusBadge value={it.status} />
              </td>
              <td className="px-4 py-3 text-right">
                <Link href={`/agenda/${it.id}`}>
                  <Button size="sm" variant="secondary">
                    Abrir
                  </Button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function toIsoLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatBrDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
