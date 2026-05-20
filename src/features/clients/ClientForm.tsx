"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import {
  clientFormSchema,
  type ClientFormInput,
  type ClientFormOutput,
} from "@/features/clients/ClientFormSchema";
import { maskCpf, maskPhone } from "@/lib/format";
import { BR_STATES, MARITAL_STATUS_LABELS } from "@/types/client";

interface ClientFormProps {
  defaultValues?: Partial<ClientFormInput>;
  onSubmit: (values: ClientFormOutput) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  serverError?: string | null;
}

export function ClientForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = "Salvar",
  serverError,
}: ClientFormProps) {
  const form = useForm<ClientFormInput>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      full_name: "",
      cpf: "",
      rg: "",
      birth_date: "",
      phone: "",
      email: "",
      address: "",
      district: "",
      city: "",
      state: "",
      marital_status: "",
      profession: "",
      family_income: "",
      notes: "",
      ...defaultValues,
    },
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  useEffect(() => {
    if (defaultValues) {
      reset({ ...defaultValues } as ClientFormInput);
    }
  }, [defaultValues, reset]);

  async function handleValid(values: ClientFormInput) {
    await onSubmit(values as unknown as ClientFormOutput);
  }

  return (
    <form onSubmit={handleSubmit(handleValid)} noValidate className="flex flex-col gap-6">
      <Card title="Identificação">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Input
              label="Nome completo *"
              {...register("full_name")}
              error={errors.full_name?.message}
            />
          </div>
          <Controller
            control={control}
            name="cpf"
            render={({ field, fieldState }) => (
              <Input
                label="CPF *"
                value={maskCpf(field.value as string)}
                onChange={(e) => field.onChange(e.target.value)}
                onBlur={field.onBlur}
                placeholder="000.000.000-00"
                inputMode="numeric"
                error={fieldState.error?.message}
              />
            )}
          />
          <Input label="RG" {...register("rg")} error={errors.rg?.message} />
          <Input
            label="Data de nascimento"
            type="date"
            {...register("birth_date")}
            error={errors.birth_date?.message}
          />
          <Controller
            control={control}
            name="phone"
            render={({ field, fieldState }) => (
              <Input
                label="Telefone"
                value={maskPhone(field.value as string)}
                onChange={(e) => field.onChange(e.target.value)}
                onBlur={field.onBlur}
                placeholder="(00) 00000-0000"
                inputMode="tel"
                error={fieldState.error?.message}
              />
            )}
          />
          <Input
            label="E-mail"
            type="email"
            {...register("email")}
            error={errors.email?.message}
          />
        </div>
      </Card>

      <Card title="Endereço">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Input
              label="Endereço"
              {...register("address")}
              error={errors.address?.message}
            />
          </div>
          <Input
            label="Bairro"
            {...register("district")}
            error={errors.district?.message}
          />
          <Input label="Cidade" {...register("city")} error={errors.city?.message} />
          <Select label="Estado (UF)" {...register("state")} error={errors.state?.message}>
            <option value="">Selecione...</option>
            {BR_STATES.map((uf) => (
              <option key={uf} value={uf}>
                {uf}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <Card title="Perfil socioeconômico">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Select
            label="Estado civil"
            {...register("marital_status")}
            error={errors.marital_status?.message}
          >
            <option value="">Selecione...</option>
            {(Object.keys(MARITAL_STATUS_LABELS) as Array<
              keyof typeof MARITAL_STATUS_LABELS
            >).map((key) => (
              <option key={key} value={key}>
                {MARITAL_STATUS_LABELS[key]}
              </option>
            ))}
          </Select>
          <Input
            label="Profissão"
            {...register("profession")}
            error={errors.profession?.message}
          />
          <Input
            label="Renda familiar (R$)"
            type="number"
            step="0.01"
            min="0"
            {...register("family_income")}
            error={errors.family_income?.message}
          />
        </div>
      </Card>

      <Card title="Observações">
        <Textarea
          {...register("notes")}
          error={errors.notes?.message}
          placeholder="Observações relevantes sobre o assistido..."
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
