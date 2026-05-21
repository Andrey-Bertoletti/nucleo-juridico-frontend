import { apiFetch } from "@/services/api";
import type {
  AreaCount,
  DashboardResponse,
  PendingAttendance,
  ProductivityRow,
  ReportsSummary,
  StatusCount,
} from "@/types/reports";

export interface ReportFilters {
  from?: string;
  to?: string;
  legal_area_id?: string;
  student_id?: string;
  teacher_id?: string;
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

export function getDashboard(
  filters: Pick<ReportFilters, "from" | "to" | "legal_area_id"> = {},
): Promise<DashboardResponse> {
  return apiFetch<DashboardResponse>(`/dashboard${toQuery(filters)}`);
}

export function getReportsSummary(
  filters: ReportFilters = {},
): Promise<ReportsSummary> {
  return apiFetch<ReportsSummary>(`/reports/summary${toQuery(filters)}`);
}

export function getReportsByStatus(
  filters: ReportFilters = {},
): Promise<StatusCount[]> {
  return apiFetch<StatusCount[]>(`/reports/by-status${toQuery(filters)}`);
}

export function getReportsByArea(
  filters: Omit<ReportFilters, "legal_area_id"> = {},
): Promise<AreaCount[]> {
  return apiFetch<AreaCount[]>(`/reports/by-area${toQuery(filters)}`);
}

export function getReportsByStudent(
  filters: Pick<ReportFilters, "from" | "to" | "legal_area_id"> = {},
): Promise<ProductivityRow[]> {
  return apiFetch<ProductivityRow[]>(
    `/reports/by-student${toQuery(filters)}`,
  );
}

export function getReportsByTeacher(
  filters: Pick<ReportFilters, "from" | "to" | "legal_area_id"> = {},
): Promise<ProductivityRow[]> {
  return apiFetch<ProductivityRow[]>(
    `/reports/by-teacher${toQuery(filters)}`,
  );
}

export function getPendingDocuments(): Promise<PendingAttendance[]> {
  return apiFetch<PendingAttendance[]>("/reports/pending-documents");
}

export function getPendingTeacherAnalysis(): Promise<PendingAttendance[]> {
  return apiFetch<PendingAttendance[]>("/reports/pending-teacher-analysis");
}
