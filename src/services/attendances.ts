import { apiFetch } from "@/services/api";
import type {
  Attendance,
  AttendanceHistoryItem,
  AttendanceListItem,
  AttendanceStatus,
} from "@/types/attendance";

export interface ListAttendancesParams {
  status?: AttendanceStatus;
  legal_area_id?: string;
  demand_type_id?: string;
  student_id?: string;
  teacher_id?: string;
  client_id?: string;
  urgency?: boolean;
  from?: string;
  to?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

function toQuery(params: object): string {
  const entries = Object.entries(params as Record<string, unknown>).filter(
    ([, v]) => v !== undefined && v !== null && v !== "",
  );
  if (entries.length === 0) return "";
  const usp = new URLSearchParams();
  for (const [k, v] of entries) usp.set(k, String(v));
  return `?${usp.toString()}`;
}

export function listAttendances(
  params: ListAttendancesParams = {},
): Promise<AttendanceListItem[]> {
  return apiFetch<AttendanceListItem[]>(`/attendances${toQuery(params)}`);
}

export function getAttendance(id: string): Promise<Attendance> {
  return apiFetch<Attendance>(`/attendances/${id}`);
}

export interface AttendancePayload {
  client_id: string;
  legal_area_id?: string | null;
  demand_type_id?: string | null;
  teacher_id?: string | null;
  description?: string | null;
  notes?: string | null;
  urgency?: boolean;
  /** Identificação manual do aluno responsável (login compartilhado). */
  responsible_student_name?: string | null;
  responsible_student_matricula?: string | null;
}

export function createAttendance(
  payload: AttendancePayload,
): Promise<Attendance> {
  return apiFetch<Attendance>("/attendances", {
    method: "POST",
    body: payload,
  });
}

export function updateAttendance(
  id: string,
  payload: Partial<AttendancePayload>,
): Promise<Attendance> {
  return apiFetch<Attendance>(`/attendances/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export function changeAttendanceStatus(
  id: string,
  payload: { status: AttendanceStatus; note?: string },
): Promise<Attendance> {
  return apiFetch<Attendance>(`/attendances/${id}/status`, {
    method: "PATCH",
    body: payload,
  });
}

export function sendAttendanceToTeacher(
  id: string,
  payload: { teacher_id?: string; note?: string } = {},
): Promise<Attendance> {
  return apiFetch<Attendance>(`/attendances/${id}/send-to-teacher`, {
    method: "POST",
    body: payload,
  });
}

export function getAttendanceHistory(
  id: string,
): Promise<AttendanceHistoryItem[]> {
  return apiFetch<AttendanceHistoryItem[]>(`/attendances/${id}/history`);
}
