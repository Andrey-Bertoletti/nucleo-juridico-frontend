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

export const pieceFormSchema = z.object({
  title: z
    .string({ required_error: "Informe o título da peça." })
    .trim()
    .min(2, "O título deve ter pelo menos 2 caracteres.")
    .max(300, "O título deve ter no máximo 300 caracteres."),
  description: optionalText(4000),
  attendance_id: optionalUuid,
  student_notes: optionalText(4000),
});

export type PieceFormInput = z.input<typeof pieceFormSchema>;
export type PieceFormOutput = z.output<typeof pieceFormSchema>;
