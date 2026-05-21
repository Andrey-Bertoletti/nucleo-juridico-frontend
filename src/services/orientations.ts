import { apiFetch } from "@/services/api";
import type {
  Orientation,
  OrientationDecision,
  TeacherCaseItem,
} from "@/types/orientation";

// ---------------------------------------------------------------------------
// Fila do professor
// ---------------------------------------------------------------------------
export interface ListTeacherCasesParams {
  legal_area_id?: string;
  student_id?: string;
  urgency?: boolean;
  from?: string;
  to?: string;
  search?: string;
  include_finished?: boolean;
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

export function listTeacherCases(
  params: ListTeacherCasesParams = {},
): Promise<TeacherCaseItem[]> {
  return apiFetch<TeacherCaseItem[]>(`/teacher/cases${toQuery(params)}`);
}

// ---------------------------------------------------------------------------
// Orientations
// ---------------------------------------------------------------------------
export function listOrientations(
  attendanceId: string,
): Promise<Orientation[]> {
  return apiFetch<Orientation[]>(`/attendances/${attendanceId}/orientations`);
}

export interface OrientationCreatePayload {
  orientation_text: string;
  teacher_notes?: string | null;
  decision?: OrientationDecision | null;
}

export function createOrientation(
  attendanceId: string,
  payload: OrientationCreatePayload,
): Promise<Orientation> {
  return apiFetch<Orientation>(`/attendances/${attendanceId}/orientation`, {
    method: "POST",
    body: payload,
  });
}

export function updateOrientation(
  orientationId: string,
  payload: { orientation_text?: string; teacher_notes?: string | null },
): Promise<Orientation> {
  return apiFetch<Orientation>(`/orientations/${orientationId}`, {
    method: "PATCH",
    body: payload,
  });
}
