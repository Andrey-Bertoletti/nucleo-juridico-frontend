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
import { maskCpf } from "@/lib/format";
import {
  attendanceFormSchema,
  type AttendanceFormInput,
  type AttendanceFormOutput,
} from "@/features/attendances/AttendanceFormSchema";
import { ApiError } from "@/services/api";
import {
  listDemandTypes,
  listLegalAreas,
  listTeachers,
  type DemandType,
  type LegalArea,
  type UserOption,
} from "@/services/catalogs";
import { listClients } from "@/services/clients";
import type { ClientListItem } from "@/types/client";

interface AttendanceFormProps {
  defaultValues?: Partial<AttendanceFormInput>;
  onSubmit: (values: AttendanceFormOutput) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  serverError?: string | null;
}

export function AttendanceForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = "Salvar",
  serverError,
}: AttendanceFormProps) {
  const form = useForm<AttendanceFormInput>({
    resolver: zodResolver(attendanceFormSchema),
    defaultValues: {
      client_id: "",
      legal_area_id: "",
      demand_type_id: "",
      teacher_id: "",
      description: "",
      notes: "",
      urgency: false,
      responsible_student_name: "",
      responsible_student_matricula: "",
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

  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [legalAreas, setLegalAreas] = useState<LegalArea[]>([]);
  const [demandTypes, setDemandTypes] = useState<DemandType[]>([]);
  const [teachers, setTeachers] = useState<UserOption[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const legalAreaId = watch("legal_area_id");

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      listClients({ status: "ativo", limit: 200 }),
      listLegalAreas(),
      listTeachers(),
    ])
      .then(([cs, las, ts]) => {
        if (cancelled) return;
        setClients(cs);
        setLegalAreas(las);
        setTeachers(ts);
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(
          err instanceof ApiError
            ? err.detail
            : "Erro ao carregar dados do formulário.",
        );
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!legalAreaId) {
      setDemandTypes([]);
      return;
    }
    listDemandTypes(legalAreaId)
      .then((dts) => {
        if (!cancelled) setDemandTypes(dts);
      })
      .catch(() => {
        if (!cancelled) setDemandTypes([]);
      });
    return () => {
      cancelled = true;
    };
  }, [legalAreaId]);

  useEffect(() => {
    if (defaultValues) {
      reset({ ...defaultValues } as AttendanceFormInput);
    }
  }, [defaultValues, reset]);

  async function handleValid(values: AttendanceFormInput) {
    await onSubmit(values as unknown as AttendanceFormOutput);
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

      <Card title="Cliente e classificação">
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
                  error={fieldState.error?.message}
                />
              )}
            />
          </div>

          <Select
            label="Área jurídica"
            {...register("legal_area_id", {
              onChange: () => setValue("demand_type_id", ""),
            })}
            error={errors.legal_area_id?.message}
          >
            <option value="">Selecione...</option>
            {legalAreas.map((la) => (
              <option key={la.id} value={la.id}>
                {la.name}
              </option>
            ))}
          </Select>

          <Select
            label="Tipo de demanda"
            disabled={!legalAreaId}
            {...register("demand_type_id")}
            error={errors.demand_type_id?.message}
          >
            <option value="">
              {legalAreaId ? "Selecione..." : "Selecione a área primeiro"}
            </option>
            {demandTypes.map((dt) => (
              <option key={dt.id} value={dt.id}>
                {dt.name}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <Card title="Detalhes do atendimento">
        <div className="flex flex-col gap-4">
          <Textarea
            label="Descrição do problema"
            rows={4}
            {...register("description")}
            error={errors.description?.message}
            placeholder="Descreva o problema relatado pelo assistido..."
          />
          <Textarea
            label="Observações iniciais"
            rows={3}
            {...register("notes")}
            error={errors.notes?.message}
            placeholder="Anotações iniciais do estagiário (opcional)."
          />

          <Controller
            control={control}
            name="urgency"
            render={({ field }) => (
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  checked={Boolean(field.value)}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
                Marcar como urgente
              </label>
            )}
          />
        </div>
      </Card>

      <Card
        title="Identificação do aluno responsável *"
        description="O login de aluno é compartilhado entre estagiários. Por isso, todo atendimento precisa identificar manualmente quem o conduziu — esses dados serão exibidos também nas versões impressas."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <Input
              label="Nome completo do aluno *"
              placeholder="Ex.: Maria Souza Silva"
              {...register("responsible_student_name")}
              error={errors.responsible_student_name?.message}
            />
          </div>
          <Input
            label="Matrícula *"
            placeholder="Ex.: 20231234"
            {...register("responsible_student_matricula")}
            error={errors.responsible_student_matricula?.message}
          />
        </div>
      </Card>

      <Card title="Responsável (opcional)">
        <Controller
          control={control}
          name="teacher_id"
          render={({ field, fieldState }) => (
            <Combobox
              label="Professor / Orientador"
              placeholder="Busque pelo nome..."
              emptyMessage="Nenhum professor encontrado."
              value={field.value || null}
              onChange={(key) => field.onChange(key || "")}
              options={teachers}
              getKey={(t) => t.id}
              getLabel={(t) => t.name}
              getDescription={(t) => t.email}
              error={fieldState.error?.message}
            />
          )}
        />
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
