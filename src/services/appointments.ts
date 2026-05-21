import { apiFetch } from "@/services/api";
import type {
  Appointment,
  AppointmentListItem,
  AppointmentStatus,
} from "@/types/appointment";

export interface ListAppointmentsParams {
  from?: string;
  to?: string;
  responsible_id?: string;
  status?: AppointmentStatus;
  client_id?: string;
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

export function listAppointments(
  params: ListAppointmentsParams = {},
): Promise<AppointmentListItem[]> {
  return apiFetch<AppointmentListItem[]>(`/appointments${toQuery(params)}`);
}

export function getAppointment(id: string): Promise<Appointment> {
  return apiFetch<Appointment>(`/appointments/${id}`);
}

export interface AppointmentPayload {
  client_id: string;
  attendance_id?: string | null;
  responsible_id?: string | null;
  appointment_date: string;
  appointment_time?: string | null;
  reason?: string | null;
  notes?: string | null;
}

export function createAppointment(
  payload: AppointmentPayload,
): Promise<Appointment> {
  return apiFetch<Appointment>("/appointments", {
    method: "POST",
    body: payload,
  });
}

export function updateAppointment(
  id: string,
  payload: Partial<AppointmentPayload>,
): Promise<Appointment> {
  return apiFetch<Appointment>(`/appointments/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export function changeAppointmentStatus(
  id: string,
  payload: { status: AppointmentStatus; note?: string },
): Promise<Appointment> {
  return apiFetch<Appointment>(`/appointments/${id}/status`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteAppointment(id: string): Promise<Appointment | void> {
  return apiFetch<Appointment | void>(`/appointments/${id}`, {
    method: "DELETE",
  });
}
