import { z } from "zod";

const optionalUuid = z
  .string()
  .optional()
  .or(z.literal(""))
  .transform((v) => (v && v.length > 0 ? v : null));

const optionalText = (max = 4000) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null));

export const attendanceFormSchema = z.object({
  client_id: z
    .string({ required_error: "Selecione o cliente." })
    .min(1, "Selecione o cliente."),
  legal_area_id: optionalUuid,
  demand_type_id: optionalUuid,
  teacher_id: optionalUuid,
  description: optionalText(4000),
  notes: optionalText(4000),
  urgency: z.boolean().optional().transform((v) => Boolean(v)),
  // Identificação manual do aluno responsável — obrigatória porque o login
  // de aluno é compartilhado entre estagiários no NPJ.
  responsible_student_name: z
    .string({ required_error: "Informe o nome do aluno responsável." })
    .trim()
    .min(2, "Informe o nome completo do aluno responsável.")
    .max(200),
  responsible_student_matricula: z
    .string({ required_error: "Informe a matrícula do aluno." })
    .trim()
    .min(1, "Informe a matrícula do aluno.")
    .max(50),
});

export type AttendanceFormInput = z.input<typeof attendanceFormSchema>;
export type AttendanceFormOutput = z.output<typeof attendanceFormSchema>;
