export type AttendanceStatus =
  | "novo_atendimento"
  | "em_triagem"
  | "aguardando_documentos"
  | "encaminhado_ao_professor"
  | "em_analise_pelo_professor"
  | "correcao_solicitada"
  | "aguardando_retorno_cliente"
  | "encaminhamento_aprovado"
  | "finalizado"
  | "arquivado";

export type HistoryEventType =
  | "abertura"
  | "triagem"
  | "orientacao"
  | "encaminhamento"
  | "documento_adicionado"
  | "documento_aprovado"
  | "documento_rejeitado"
  | "agendamento"
  | "retorno"
  | "mudanca_status"
  | "observacao"
  | "encerramento"
  | "arquivamento";

export interface Attendance {
  id: string;
  client_id: string;
  legal_area_id: string | null;
  demand_type_id: string | null;
  student_id: string | null;
  teacher_id: string | null;
  description: string | null;
  notes: string | null;
  urgency: boolean;
  status: AttendanceStatus;
  created_at: string;
  updated_at: string;
  finished_at: string | null;
}

export interface AttendanceListItem {
  id: string;
  client_id: string;
  client_name: string;
  legal_area_id: string | null;
  legal_area_name: string | null;
  demand_type_id: string | null;
  demand_type_name: string | null;
  student_id: string | null;
  student_name: string | null;
  teacher_id: string | null;
  teacher_name: string | null;
  status: AttendanceStatus;
  urgency: boolean;
  created_at: string;
  updated_at: string;
}

export interface AttendanceHistoryItem {
  id: string;
  attendance_id: string;
  user_id: string | null;
  event_type: HistoryEventType;
  description: string | null;
  old_status: AttendanceStatus | null;
  new_status: AttendanceStatus | null;
  created_at: string;
}

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  novo_atendimento: "Novo atendimento",
  em_triagem: "Em triagem",
  aguardando_documentos: "Aguardando documentos",
  encaminhado_ao_professor: "Encaminhado ao professor",
  em_analise_pelo_professor: "Em análise pelo professor",
  correcao_solicitada: "Correção solicitada",
  aguardando_retorno_cliente: "Aguardando retorno do cliente",
  encaminhamento_aprovado: "Encaminhamento aprovado",
  finalizado: "Finalizado",
  arquivado: "Arquivado",
};

export type BadgeTone =
  | "slate"
  | "blue"
  | "amber"
  | "emerald"
  | "rose"
  | "violet"
  | "indigo"
  | "neutral";

export const ATTENDANCE_STATUS_TONES: Record<AttendanceStatus, BadgeTone> = {
  novo_atendimento: "blue",
  em_triagem: "amber",
  aguardando_documentos: "amber",
  encaminhado_ao_professor: "indigo",
  em_analise_pelo_professor: "indigo",
  correcao_solicitada: "rose",
  aguardando_retorno_cliente: "amber",
  encaminhamento_aprovado: "violet",
  finalizado: "emerald",
  arquivado: "neutral",
};

export const ATTENDANCE_STATUS_GROUPS: Array<{
  label: string;
  values: AttendanceStatus[];
}> = [
  { label: "Triagem", values: ["novo_atendimento", "em_triagem", "aguardando_documentos"] },
  {
    label: "Análise do professor",
    values: [
      "encaminhado_ao_professor",
      "em_analise_pelo_professor",
      "correcao_solicitada",
      "encaminhamento_aprovado",
    ],
  },
  { label: "Acompanhamento", values: ["aguardando_retorno_cliente"] },
  { label: "Encerramento", values: ["finalizado", "arquivado"] },
];

export const HISTORY_EVENT_LABELS: Record<HistoryEventType, string> = {
  abertura: "Atendimento aberto",
  triagem: "Triagem preenchida",
  orientacao: "Orientação registrada",
  encaminhamento: "Encaminhado ao professor",
  documento_adicionado: "Documento anexado",
  documento_aprovado: "Documento aprovado",
  documento_rejeitado: "Documento rejeitado",
  agendamento: "Agendamento criado",
  retorno: "Retorno do cliente",
  mudanca_status: "Mudança de status",
  observacao: "Observação registrada",
  encerramento: "Atendimento finalizado",
  arquivamento: "Atendimento arquivado",
};
