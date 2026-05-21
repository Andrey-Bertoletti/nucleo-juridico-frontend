/**
 * Validadores compartilhados (mantém paridade com o backend em
 * `app/utils/validators.py`).
 */

import { onlyDigits } from "@/lib/format";

// ---------------------------------------------------------------------------
// CPF
// ---------------------------------------------------------------------------
export function isValidCpf(value: string | null | undefined): boolean {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11) return false;
  // Rejeita CPFs com todos os dígitos iguais (000..., 111...).
  if (cpf === cpf[0]!.repeat(11)) return false;

  // Primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += Number(cpf[i]) * (10 - i);
  let digito1 = (soma * 10) % 11;
  if (digito1 === 10) digito1 = 0;
  if (digito1 !== Number(cpf[9])) return false;

  // Segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) soma += Number(cpf[i]) * (11 - i);
  let digito2 = (soma * 10) % 11;
  if (digito2 === 10) digito2 = 0;
  if (digito2 !== Number(cpf[10])) return false;

  return true;
}

// ---------------------------------------------------------------------------
// RG — formato (varia por estado, então validamos só tamanho + não-trivial)
// ---------------------------------------------------------------------------
export function isValidRg(value: string | null | undefined): boolean {
  if (!value) return true; // opcional
  const cleaned = value.replace(/[^0-9Xx]/g, "");
  if (cleaned.length < 5 || cleaned.length > 14) return false;
  if (cleaned === cleaned[0]!.repeat(cleaned.length)) return false;
  return true;
}

// ---------------------------------------------------------------------------
// Telefone BR (10 ou 11 dígitos com DDD)
// ---------------------------------------------------------------------------
export function isValidPhone(value: string | null | undefined): boolean {
  if (!value) return true; // opcional
  const digits = onlyDigits(value);
  if (digits.length !== 10 && digits.length !== 11) return false;
  if (digits[0] === "0") return false; // DDD não começa com 0
  return true;
}

// ---------------------------------------------------------------------------
// Data de nascimento
// ---------------------------------------------------------------------------
export const MIN_BIRTH_YEAR = 1900;

export function isValidBirthDate(value: string | null | undefined): boolean {
  if (!value) return true; // opcional
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date > today) return false;
  if (date.getFullYear() < MIN_BIRTH_YEAR) return false;
  return true;
}

// ---------------------------------------------------------------------------
// UF
// ---------------------------------------------------------------------------
const BR_STATES_SET = new Set([
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO",
]);

export function isValidUf(value: string | null | undefined): boolean {
  if (!value) return true; // opcional
  return BR_STATES_SET.has(value.toUpperCase());
}
