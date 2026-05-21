"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { LoadingState } from "@/components/feedback/LoadingState";
import { Card } from "@/components/ui/Card";
import { AppointmentForm } from "@/features/appointments/AppointmentForm";
import {
  type AppointmentFormInput,
  type AppointmentFormOutput,
} from "@/features/appointments/AppointmentFormSchema";
import { ApiError } from "@/services/api";
import { getAppointment, updateAppointment } from "@/services/appointments";
import type { Appointment } from "@/types/appointment";

export default function RemarcarPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [appt, setAppt] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getAppointment(params.id)
      .then((data) => {
        if (!cancelled) setAppt(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(
            err instanceof ApiError ? err.detail : "Erro ao carregar.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  if (loading) return <LoadingState message="Carregando retorno..." />;
  if (loadError || !appt) {
    return (
      <Card>
        <p className="text-sm text-red-700">
          {loadError || "Retorno não encontrado."}
        </p>
      </Card>
    );
  }

  const defaults: Partial<AppointmentFormInput> = {
    client_id: appt.client_id,
    attendance_id: appt.attendance_id ?? "",
    responsible_id: appt.responsible_id ?? "",
    appointment_date: appt.appointment_date,
    appointment_time: appt.appointment_time ?? "",
    reason: appt.reason ?? "",
    notes: appt.notes ?? "",
  };

  async function handleSubmit(values: AppointmentFormOutput) {
    setServerError(null);
    try {
      await updateAppointment(params.id, values as never);
      router.push(`/agenda/${params.id}`);
    } catch (err) {
      setServerError(
        err instanceof ApiError
          ? err.detail
          : "Não foi possível remarcar o retorno.",
      );
      throw err;
    }
  }

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Remarcar retorno</h1>
        <p className="text-sm text-slate-500">
          Ajuste a data, horário ou demais informações. O status passará a
          "Remarcado" automaticamente quando data ou horário mudarem.
        </p>
      </div>

      <AppointmentForm
        defaultValues={defaults}
        lockedClientId={appt.client_id}
        onSubmit={handleSubmit}
        submitLabel="Salvar remarcação"
        serverError={serverError}
        onCancel={() => router.push(`/agenda/${params.id}`)}
      />
    </div>
  );
}
