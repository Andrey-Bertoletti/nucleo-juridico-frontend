import type { Role } from "@/types/auth";
import type { AttendanceListItem } from "@/types/attendance";

export interface DashboardCounters {
  novo_atendimento: number;
  em_triagem: number;
  aguardando_documentos: number;
  encaminhado_ao_professor: number;
  em_analise_pelo_professor: number;
  correcao_solicitada: number;
  aguardando_retorno_cliente: number;
  encaminhamento_aprovado: number;
  finalizado: number;
  arquivado: number;
}

export interface DashboardResponse {
  role: Role;
  period_from: string | null;
  period_to: string | null;
  total: number;
  counters: DashboardCounters;
  urgentes: number;
  appointments_today: number;
  pending_documents: number;
  pending_teacher_analysis: number;
}

export interface ReportsSummary {
  role: Role;
  period_from: string | null;
  period_to: string | null;
  total: number;
  counters: DashboardCounters;
  urgentes: number;
}

export interface StatusCount {
  status: string;
  label: string;
  count: number;
}

export interface AreaCount {
  legal_area_id: string | null;
  legal_area_name: string | null;
  count: number;
}

export interface ProductivityRow {
  user_id: string;
  user_name: string;
  total: number;
  em_andamento: number;
  finalizados: number;
  urgentes: number;
}

export type PendingAttendance = AttendanceListItem;
