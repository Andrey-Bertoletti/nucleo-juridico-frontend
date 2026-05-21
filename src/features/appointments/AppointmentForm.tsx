"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Combobox } from "@/components/ui/Combobox";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import {
  appointmentFormSchema,
  type AppointmentFormInput,
  type AppointmentFormOutput,
} from "@/features/appointments/AppointmentFormSchema";
import { maskCpf } from "@/lib/format";
import { ApiError } from "@/services/api";
import { listAttendances } from "@/services/attendances";
import {
  listStudents,
  listTeachers,
  type UserOption,
} from "@/services/catalogs";
import { listClients } from "@/services/clients";
import type { AttendanceListItem } from "@/types/attendance";
import type { ClientListItem } from "@/types/client";

interface AppointmentFormProps {
  defaultValues?: Partial<AppointmentFormInput>;
  /** Trava o cliente quando o form abre a partir de um cliente já escolhido. */
  lockedClientId?: string;
  onSubmit: (values: AppointmentFormOutput) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  serverError?: string | null;
}

export function AppointmentForm({
  defaultValues,
  lockedClientId,
  onSubmit,
  onCancel,
  submitLabel = "Salvar",
  serverError,
}: AppointmentFormProps) {
  const form = useForm<AppointmentFormInput>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      client_id: lockedClientId || "",
      attendance_id: "",
      responsible_id: "",
      appointment_date: "",
      appointment_time: "",
      reason: "",
      notes: "",
      ...defaultValues,
    },
  });

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  const clientId = watch("client_id");

  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [attendances, setAttendances] = useState<AttendanceListItem[]>([]);
  const [responsibles, setResponsibles] = useState<UserOption[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      listClients({ status: "ativo", limit: 200 }),
      listStudents(),
      listTeachers(),
    ])
      .then(([cs, ss, ts]) => {
        setClients(cs);
        // junta alunos e professores como possíveis responsáveis
        const merged: UserOption[] = [...ss, ...ts];
        const dedup = new Map<string, UserOption>();
        for (const m of merged) dedup.set(m.id, m);
        setResponsibles(Array.from(dedup.values()));
      })
      .catch((err) => {
        setLoadError(
          err instanceof ApiError
            ? err.detail
            : "Erro ao carregar dados do formulário.",
        );
      });
  }, []);

  // Carrega atendimentos do cliente selecionado (para vincular o retorno)
  useEffect(() => {
    let cancelled = false;
    if (!clientId) {
      setAttendances([]);
      return;
    }
    listAttendances({ client_id: clientId, limit: 50 })
      .then((rows) => {
        if (!cancelled) setAttendances(rows);
      })
      .catch(() => {
        if (!cancelled) setAttendances([]);
      });
    return () => {
      cancelled = true;
    };
  }, [clientId]);

  // Quando muda o cliente, limpa o vínculo de atendimento previamente selecionado
  useEffect(() => {
    if (clientId) setValue("attendance_id", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  useEffect(() => {
    if (defaultValues) {
      reset({ ...defaultValues } as AppointmentFormInput);
    }
  }, [defaultValues, reset]);

  async function handleValid(values: AppointmentFormInput) {
    await onSubmit(values as unknown as AppointmentFormOutput);
  }

  return (
    <form
      onSubmit={handleSubmit(handleValid)}
      noValidate
      className="flex flex-col gap-6"
    >
      {loadError && (
        <p
          role="alert"
          className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {loadError}
        </p>
      )}

      <Card title="Cliente e vínculo">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Controller
              control={control}
              name="client_id"
              render={({ field, fieldState }) => (
                <Combobox
                  label="Cliente / Assistido *"
                  placeholder="Busque por nome ou CPF..."
                  emptyMessage="Nenhum cliente encontrado."
                  value={field.value || null}
                  onChange={(key) => field.onChange(key || "")}
                  options={clients}
                  getKey={(c) => c.id}
                  getLabel={(c) => c.full_name}
                  getDescription={(c) =>
                    [c.cpf ? maskCpf(c.cpf) : null, c.city]
                      .filter(Boolean)
                      .join(" · ") || null
                  }
                  disabled={Boolean(lockedClientId)}
                  error={fieldState.error?.message}
                />
              )}
            />
          </div>

          <Select
            label="Atendimento vinculado (opcional)"
            disabled={!clientId}
            {...register("attendance_id")}
            error={errors.attendance_id?.message}
          >
            <option value="">Sem vínculo</option>
            {attendances.map((a) => (
              <option key={a.id} value={a.id}>
                {a.legal_area_name || "Sem área"} —{" "}
                {a.demand_type_name || "sem demanda"} ({a.status})
              </option>
            ))}
          </Select>

          <Controller
            control={control}
            name="responsible_id"
            render={({ field, fieldState }) => (
              <Combobox
                label="Responsável"
                placeholder="Buscar por nome..."
                emptyMessage="Nenhum usuário encontrado."
                value={field.value || null}
                onChange={(key) => field.onChange(key || "")}
                options={responsibles}
                getKey={(u) => u.id}
                getLabel={(u) => u.name}
                getDescription={(u) => u.email}
                error={fieldState.error?.message}
              />
            )}
          />
        </div>
      </Card>

      <Card title="Data e horário">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Data *"
            type="date"
            {...register("appointment_date")}
            error={errors.appointment_date?.message}
          />
          <Input
            label="Horário"
            type="time"
            {...register("appointment_time")}
            error={errors.appointment_time?.message}
          />
        </div>
      </Card>

      <Card title="Motivo e observações">
        <div className="flex flex-col gap-4">
          <Textarea
            label="Motivo do retorno"
            rows={3}
            {...register("reason")}
            error={errors.reason?.message}
            placeholder="Por que o cliente precisa retornar?"
          />
          <Textarea
            label="Observações"
            rows={3}
            {...register("notes")}
            error={errors.notes?.message}
            placeholder="Observações adicionais..."
          />
        </div>
      </Card>

      {serverError && (
        <p
          role="alert"
          className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {serverError}
        </p>
      )}

      <div className="flex items-center justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
