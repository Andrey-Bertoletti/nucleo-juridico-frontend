import { z } from "zod";

import { onlyDigits } from "@/lib/format";
import {
  MIN_BIRTH_YEAR,
  isValidBirthDate,
  isValidCpf,
  isValidPhone,
  isValidRg,
  isValidUf,
} from "@/lib/validators";

const optionalString = (max = 255) =>
  z
    .string()
    .trim()
    .max(max, `Máximo ${max} caracteres.`)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null));

// ---------------------------------------------------------------------------
// Campos específicos
// ---------------------------------------------------------------------------
const fullNameSchema = z
  .string({ required_error: "Nome é obrigatório." })
  .trim()
  .min(3, "Informe o nome completo.")
  .max(200, "Máximo 200 caracteres.");

const cpfSchema = z
  .string({ required_error: "CPF é obrigatório." })
  .trim()
  .min(1, "CPF é obrigatório.")
  .refine((v) => onlyDigits(v).length === 11, "CPF deve ter 11 dígitos.")
  .refine(isValidCpf, "CPF inválido — confira os dígitos verificadores.")
  .transform((v) => onlyDigits(v));

const rgSchema = z
  .string()
  .trim()
  .max(30, "Máximo 30 caracteres.")
  .optional()
  .or(z.literal(""))
  .transform((v) => (v && v.length > 0 ? v : null))
  .refine(
    (v) => v === null || isValidRg(v),
    "RG inválido — informe um número válido (5 a 14 caracteres).",
  );

const phoneSchema = z
  .string()
  .trim()
  .max(30, "Máximo 30 caracteres.")
  .optional()
  .or(z.literal(""))
  .transform((v) => (v && v.length > 0 ? onlyDigits(v) : null))
  .refine(
    (v) => v === null || isValidPhone(v),
    "Telefone inválido — informe DDD + número (10 ou 11 dígitos).",
  );

const emailSchema = z
  .string()
  .trim()
  .email("E-mail inválido.")
  .optional()
  .or(z.literal(""))
  .transform((v) => (v && v.length > 0 ? v : null));

const birthDateSchema = z
  .string()
  .optional()
  .or(z.literal(""))
  .transform((v) => (v && v.length > 0 ? v : null))
  .refine(
    (v) => v === null || isValidBirthDate(v),
    `Data inválida — deve ser entre ${MIN_BIRTH_YEAR} e hoje.`,
  );

const stateSchema = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((v) => (v && v.length > 0 ? v.toUpperCase() : null))
  .refine(
    (v) => v === null || isValidUf(v),
    "UF inválida — use uma das 27 siglas oficiais.",
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
  )
  .refine(
    (v) => v === null || v <= 10_000_000,
    "Renda familiar fora do intervalo permitido.",
  );

// ---------------------------------------------------------------------------
// Schema final
// ---------------------------------------------------------------------------
export const clientFormSchema = z.object({
  full_name: fullNameSchema,
  cpf: cpfSchema,
  rg: rgSchema,
  birth_date: birthDateSchema,
  phone: phoneSchema,
  email: emailSchema,
  address: optionalString(255),
  district: optionalString(120),
  city: optionalString(120),
  state: stateSchema,
  marital_status: maritalStatusSchema,
  profession: optionalString(120),
  family_income: familyIncomeSchema,
  notes: optionalString(4000),
});

export type ClientFormInput = z.input<typeof clientFormSchema>;
export type ClientFormOutput = z.output<typeof clientFormSchema>;
