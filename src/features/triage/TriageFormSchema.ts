import { z } from "zod";

const optionalText = (max = 4000) =>
  z
    .string()
    .max(max)
    .optional()
    .transform((v) => (v && v.trim().length > 0 ? v : null));

/**
 * Schema "rascunho" — não exige campos obrigatórios. Permite salvar
 * progresso parcial. (O backend rejeita criação sem `client_report`; nesse
 * caso a tela trata o erro.)
 */
export const triageDraftSchema = z.object({
  client_report: optionalText(8000),
  has_urgent_deadline: z.boolean().default(false),
  urgency_description: optionalText(2000),
  presented_documents: optionalText(4000),
  pending_documents: optionalText(4000),
  suggested_forwarding: optionalText(2000),
  student_notes: optionalText(4000),
});

/**
 * Schema "completo" — usado em "Salvar triagem" e "Encaminhar ao professor".
 *
 * Regras:
 *  - client_report obrigatório (não pode ser vazio).
 *  - Se has_urgent_deadline=true, urgency_description é obrigatório.
 */
export const triageFullSchema = triageDraftSchema.superRefine((data, ctx) => {
  if (!data.client_report || data.client_report.trim().length === 0) {
    ctx.addIssue({
      path: ["client_report"],
      code: z.ZodIssueCode.custom,
      message: "Descreva o relato do cliente antes de salvar a triagem.",
    });
  }
  if (
    data.has_urgent_deadline &&
    (!data.urgency_description || data.urgency_description.trim().length === 0)
  ) {
    ctx.addIssue({
      path: ["urgency_description"],
      code: z.ZodIssueCode.custom,
      message: "Descreva a urgência informada.",
    });
  }
});

export type TriageFormInput = z.input<typeof triageDraftSchema>;
export type TriageFormOutput = z.output<typeof triageDraftSchema>;
