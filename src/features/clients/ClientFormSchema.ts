import { z } from "zod";

import { onlyDigits } from "@/lib/format";

const optionalString = (max = 255) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null));

const cpfSchema = z
  .string({ required_error: "CPF é obrigatório." })
  .trim()
  .min(1, "CPF é obrigatório.")
  .refine((v) => onlyDigits(v).length === 11, "CPF deve ter 11 dígitos.")
  .transform((v) => onlyDigits(v));

const emailSchema = z
  .string()
  .trim()
  .email("E-mail inválido.")
  .optional()
  .or(z.literal(""))
  .transform((v) => (v && v.length > 0 ? v : null));

const stateSchema = z
  .string()
  .trim()
  .length(2, "UF deve ter 2 letras.")
  .optional()
  .or(z.literal(""))
  .transform((v) => (v && v.length === 2 ? v.toUpperCase() : null));

const birthDateSchema = z
  .string()
  .optional()
  .or(z.literal(""))
  .transform((v) => (v && v.length > 0 ? v : null));

const familyIncomeSchema = z
  .union([z.string(), z.number()])
  .optional()
  .transform((v) => {
    if (v === undefined || v === null || v === "") return null;
    const n = typeof v === "string" ? Number(v.replace(",", ".")) : v;
    return Number.isNaN(n) ? null : n;
  })
  .refine(
    (v) => v === null || v >= 0,
    "Renda familiar não pode ser negativa.",
  );

const maritalStatusSchema = z
  .enum([
    "solteiro",
    "casado",
    "divorciado",
    "viuvo",
    "uniao_estavel",
    "separado",
  ])
  .optional()
  .or(z.literal(""))
  .transform((v) => (v && v.length > 0 ? v : null));

export const clientFormSchema = z.object({
  full_name: z
    .string({ required_error: "Nome é obrigatório." })
    .trim()
    .min(3, "Informe o nome completo."),
  cpf: cpfSchema,
  rg: optionalString(30),
  birth_date: birthDateSchema,
  phone: optionalString(30).transform((v) =>
    v ? onlyDigits(v) : null,
  ),
  email: emailSchema,
  address: optionalString(255),
  district: optionalString(120),
  city: optionalString(120),
  state: stateSchema,
  marital_status: maritalStatusSchema,
  profession: optionalString(120),
  family_income: familyIncomeSchema,
  notes: optionalString(2000),
});

export type ClientFormInput = z.input<typeof clientFormSchema>;
export type ClientFormOutput = z.output<typeof clientFormSchema>;
