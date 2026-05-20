import { apiFetch } from "@/services/api";
import type { Triage, TriagePayload } from "@/types/triage";

export function getTriage(attendanceId: string): Promise<Triage> {
  return apiFetch<Triage>(`/attendances/${attendanceId}/triage`);
}

export function createTriage(
  attendanceId: string,
  payload: TriagePayload,
): Promise<Triage> {
  return apiFetch<Triage>(`/attendances/${attendanceId}/triage`, {
    method: "POST",
    body: payload,
  });
}

export function updateTriage(
  attendanceId: string,
  payload: TriagePayload,
): Promise<Triage> {
  return apiFetch<Triage>(`/attendances/${attendanceId}/triage`, {
    method: "PATCH",
    body: payload,
  });
}
