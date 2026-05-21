import type { BadgeTone } from "@/types/attendance";

export type AppointmentStatus =
  | "agendado"
  | "confirmado"
  | "compareceu"
  | "nao_compareceu"
  | "remarcado"
  | "cancelado";

export interface Appointment {
  id: string;
  client_id: string;
  attendance_id: string | null;
  responsible_id: string | null;
  appointment_date: string;
  appointment_time: string | null;
  reason: string | null;
  status: AppointmentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AppointmentListItem {
  id: string;
  client_id: string;
  client_name: string;
  attendance_id: string | null;
  responsible_id: string | null;
  responsible_name: string | null;
  appointment_date: string;
  appointment_time: string | null;
  reason: string | null;
  status: AppointmentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  agendado: "Agendado",
  confirmado: "Confirmado",
  compareceu: "Compareceu",
  nao_compareceu: "Não compareceu",
  remarcado: "Remarcado",
  cancelado: "Cancelado",
};

export const APPOINTMENT_STATUS_TONES: Record<AppointmentStatus, BadgeTone> = {
  agendado: "blue",
  confirmado: "indigo",
  compareceu: "emerald",
  nao_compareceu: "rose",
  remarcado: "amber",
  cancelado: "neutral",
};
