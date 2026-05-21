export type OrientationDecision =
  | "solicitar_correcao"
  | "solicitar_documentos"
  | "aprovar_encaminhamento"
  | "finalizar_atendimento";

export interface Orientation {
  id: string;
  attendance_id: string;
  teacher_id: string | null;
  orientation_text: string;
  teacher_notes: string | null;
  decision: OrientationDecision | null;
  created_at: string;
  updated_at: string;
}

export interface TeacherCaseItem {
  id: string;
  client_id: string;
  client_name: string;
  legal_area_id: string | null;
  legal_area_name: string | null;
  student_id: string | null;
  student_name: string | null;
  status: string;
  urgency: boolean;
  created_at: string;
  updated_at: string;
}

export const DECISION_LABELS: Record<OrientationDecision, string> = {
  solicitar_correcao: "Solicitar correção ao aluno",
  solicitar_documentos: "Solicitar documentos ao cliente",
  aprovar_encaminhamento: "Aprovar encaminhamento",
  finalizar_atendimento: "Finalizar atendimento",
};

export const DECISION_DESCRIPTIONS: Record<OrientationDecision, string> = {
  solicitar_correcao:
    "Devolve o caso ao aluno para ajustes — status passa a 'Correção solicitada'.",
  solicitar_documentos:
    "Aguarda novos documentos do cliente — status passa a 'Aguardando documentos'.",
  aprovar_encaminhamento:
    "Valida o encaminhamento jurídico — status passa a 'Encaminhamento aprovado'.",
  finalizar_atendimento:
    "Encerra o caso — status passa a 'Finalizado'.",
};
