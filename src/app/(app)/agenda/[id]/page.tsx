"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { LoadingState } from "@/components/feedback/LoadingState";
import { AppointmentStatusBadge } from "@/components/feedback/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/features/auth/useAuth";
import { formatDateBR } from "@/lib/format";
import { ApiError } from "@/services/api";
import {
  changeAppointmentStatus,
  deleteAppointment,
  getAppointment,
} from "@/services/appointments";
import { getClient } from "@/services/clients";
import type {
  Appointment,
  AppointmentStatus,
} from "@/types/appointment";
import type { Client } from "@/types/client";

export default function AppointmentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { hasRole } = useAuth();
  const canDelete = hasRole(
    "admin_coordenacao",
    "aluno_estagiario",
    "professor_orientador",
  );

  const [appt, setAppt] = useState<Appointment | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAppointment(params.id);
      setAppt(data);
      try {
        const c = await getClient(data.client_id);
        setClient(c);
      } catch {
        setClient(null);
      }
    } catch (err) {
      setError(
        err instanceof ApiError ? err.detail : "Erro ao carregar retorno.",
      );
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleStatus(status: AppointmentStatus) {
    if (!appt || appt.status === status) return;
    setBusy(true);
    setMessage(null);
    try {
      await changeAppointmentStatus(appt.id, { status });
      await load();
      setMessage(`Status atualizado para "${status}".`);
      window.setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      setMessage(
        err instanceof ApiError
          ? err.detail
          : "Não foi possível atualizar o status.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!appt) return;
    if (
      !window.confirm(
        appt.attendance_id
          ? "Cancelar este retorno? Ele continuará no histórico do atendimento."
          : "Excluir este retorno? Esta ação não pode ser desfeita.",
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      await deleteAppointment(appt.id);
      router.push("/agenda");
    } catch (err) {
      setMessage(
        err instanceof ApiError ? err.detail : "Não foi possível excluir.",
      );
      setBusy(false);
    }
  }

  if (loading) return <LoadingState message="Carregando retorno..." />;
  if (error || !appt) {
    return (
      <Card>
        <p className="text-sm text-red-700">{error || "Retorno não encontrado."}</p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-semibold text-slate-900">
                Retorno · {formatDateBR(appt.appointment_date)}
                {appt.appointment_time
                  ? ` · ${appt.appointment_time.slice(0, 5)}`
                  : ""}
              </h1>
              <AppointmentStatusBadge value={appt.status} />
            </div>
            <p className="text-sm text-slate-600">
              {client ? client.full_name : "Cliente"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/agenda/${appt.id}/remarcar`}>
              <Button variant="secondary">Remarcar</Button>
            </Link>
            {canDelete && (
              <Button
                variant="danger"
                onClick={() => void handleDelete()}
                isLoading={busy}
              >
                {appt.attendance_id ? "Cancelar retorno" : "Excluir retorno"}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {message && (
        <p
          role="status"
          className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
        >
          {message}
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card title="Informações do retorno">
          <dl className="space-y-2 text-sm">
            <Item label="Data" value={formatDateBR(appt.appointment_date)} />
            <Item
              label="Horário"
              value={
                appt.appointment_time ? appt.appointment_time.slice(0, 5) : "—"
              }
            />
            <Item label="Motivo" value={appt.reason || "—"} />
            <Item label="Observações" value={appt.notes || "—"} />
            <Item
              label="Atendimento vinculado"
              value={
                appt.attendance_id ? (
                  <Link
                    href={`/atendimentos/${appt.attendance_id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Abrir atendimento
                  </Link>
                ) : (
                  "—"
                )
              }
            />
          </dl>
        </Card>

        <Card title="Ações rápidas">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Button
              type="button"
              variant="secondary"
              disabled={busy}
              onClick={() => void handleStatus("confirmado")}
            >
              Confirmar
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={busy}
              onClick={() => void handleStatus("compareceu")}
            >
              Marcar compareceu
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={busy}
              onClick={() => void handleStatus("nao_compareceu")}
            >
              Marcar não compareceu
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={busy}
              onClick={() => void handleStatus("cancelado")}
              className="!text-red-600 hover:!bg-red-50"
            >
              Cancelar
            </Button>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Para alterar data ou horário, use{" "}
            <Link
              href={`/agenda/${appt.id}/remarcar`}
              className="underline-offset-2 hover:underline"
            >
              Remarcar
            </Link>
            .
          </p>
        </Card>
      </div>
    </div>
  );
}

function Item({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="col-span-2 text-slate-800">{value}</dd>
    </div>
  );
}
