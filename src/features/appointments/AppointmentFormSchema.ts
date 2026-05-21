import { z } from "zod";

const optionalUuid = z
  .string()
  .optional()
  .or(z.literal(""))
  .transform((v) => (v && v.length > 0 ? v : null));

const optionalText = (max = 2000) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null));

export const appointmentFormSchema = z.object({
  client_id: z
    .string({ required_error: "Selecione o cliente." })
    .min(1, "Selecione o cliente."),
  attendance_id: optionalUuid,
  responsible_id: optionalUuid,
  appointment_date: z
    .string({ required_error: "Informe a data do retorno." })
    .min(1, "Informe a data do retorno."),
  appointment_time: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v && v.length > 0 ? v : null)),
  reason: optionalText(2000),
  notes: optionalText(2000),
});

export type AppointmentFormInput = z.input<typeof appointmentFormSchema>;
export type AppointmentFormOutput = z.output<typeof appointmentFormSchema>;
