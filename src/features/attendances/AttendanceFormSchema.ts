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
});

export type AttendanceFormInput = z.input<typeof attendanceFormSchema>;
export type AttendanceFormOutput = z.output<typeof attendanceFormSchema>;
