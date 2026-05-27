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
  description: string | null;
  type: TemplateType;
  /** Conteúdo em HTML (vindo do editor Tiptap), com placeholders `{{...}}`. */
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

/** Biblioteca de campos pré-definidos pra inserção rápida no editor.
 * Cobre os dados mais usados em documentos jurídicos do NPJ — assim a
 * coordenação não precisa decorar nomes nem inventar a cada modelo novo. */
export interface StandardFieldDef extends DynamicField {
  group: "cliente" | "aluno" | "atendimento" | "assinatura";
  hint?: string;
}

export const STANDARD_FIELDS: StandardFieldDef[] = [
  // Cliente / assistido
  {
    group: "cliente",
    name: "nome_cliente",
    label: "Nome do cliente",
    type: "text",
    required: true,
  },
  {
    group: "cliente",
    name: "cpf_cliente",
    label: "CPF do cliente",
    type: "text",
    required: true,
  },
  {
    group: "cliente",
    name: "endereco_cliente",
    label: "Endereço do cliente",
    type: "textarea",
    required: false,
  },
  // Aluno responsável (login compartilhado — sempre manual)
  {
    group: "aluno",
    name: "nome_aluno",
    label: "Nome do aluno responsável",
    type: "text",
    required: true,
    hint: "Já é coletado no bloco de identificação, mas pode aparecer no corpo.",
  },
  {
    group: "aluno",
    name: "matricula_aluno",
    label: "Matrícula do aluno",
    type: "text",
    required: true,
  },
  // Atendimento
  {
    group: "atendimento",
    name: "data_atendimento",
    label: "Data do atendimento",
    type: "date",
    required: true,
  },
  {
    group: "atendimento",
    name: "descricao_atendimento",
    label: "Descrição do atendimento",
    type: "textarea",
    required: false,
  },
  // Assinaturas (são placeholders renderizados como linha de assinatura
  // na versão impressa — o valor digitado, se houver, vira "Por extenso:")
  {
    group: "assinatura",
    name: "assinatura_aluno",
    label: "Assinatura do aluno",
    type: "text",
    required: false,
    hint: "Renderizado como linha de assinatura no documento gerado.",
  },
  {
    group: "assinatura",
    name: "assinatura_cliente",
    label: "Assinatura do cliente",
    type: "text",
    required: false,
    hint: "Renderizado como linha de assinatura no documento gerado.",
  },
];

export const STANDARD_FIELD_GROUP_LABELS: Record<
  StandardFieldDef["group"],
  string
> = {
  cliente: "Cliente / Assistido",
  aluno: "Aluno responsável",
  atendimento: "Atendimento",
  assinatura: "Assinaturas",
};
