export type TemplateType = "relatorio" | "atendimento" | "documento";
export type TemplateStatus = "ativo" | "inativo";
export type DynamicFieldType = "text" | "textarea" | "number" | "date" | "select";

export interface DynamicField {
  name: string;
  label: string;
  type: DynamicFieldType;
  required: boolean;
  options?: string[] | null;
}

export interface Template {
  id: string;
  title: string;
  type: TemplateType;
  content: string;
  dynamic_fields: DynamicField[];
  status: TemplateStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface GeneratedDocument {
  id: string;
  template_id: string;
  template_type: TemplateType;
  template_title: string;
  generated_by_user_id: string | null;
  student_name: string;
  student_matricula: string;
  /** Data ISO (YYYY-MM-DD). */
  attendance_date: string;
  filled_data: Record<string, string | number | null>;
  final_content: string;
  attendance_id: string | null;
  client_id: string | null;
  generated_at: string;
}

export const TEMPLATE_TYPE_LABELS: Record<TemplateType, string> = {
  relatorio: "Relatório",
  atendimento: "Atendimento",
  documento: "Documento",
};

export const DYNAMIC_FIELD_TYPE_LABELS: Record<DynamicFieldType, string> = {
  text: "Texto curto",
  textarea: "Texto longo",
  number: "Número",
  date: "Data",
  select: "Seleção",
};
