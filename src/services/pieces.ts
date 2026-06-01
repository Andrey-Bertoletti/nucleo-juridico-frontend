import { apiFetch, apiUpload } from "@/services/api";
import type {
  Piece,
  PieceDownloadResponse,
  PieceListItem,
  PieceStats,
  PieceStatus,
  PieceStudentSummary,
} from "@/types/piece";

export interface ListPiecesParams {
  status?: PieceStatus;
  student_id?: string;
  search?: string;
  from?: string;
  to?: string;
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

export function listPieces(
  params: ListPiecesParams = {},
): Promise<PieceListItem[]> {
  return apiFetch<PieceListItem[]>(`/pieces${toQuery(params)}`);
}

export function getPiece(id: string): Promise<Piece> {
  return apiFetch<Piece>(`/pieces/${id}`);
}

export interface CreatePiecePayload {
  title: string;
  file: File;
  description?: string;
  attendance_id?: string;
  student_notes?: string;
}

export function createPiece(payload: CreatePiecePayload): Promise<Piece> {
  const form = new FormData();
  form.append("title", payload.title);
  form.append("file", payload.file);
  if (payload.description) form.append("description", payload.description);
  if (payload.attendance_id) form.append("attendance_id", payload.attendance_id);
  if (payload.student_notes) form.append("student_notes", payload.student_notes);
  return apiUpload<Piece>("/pieces", form);
}

export interface UpdatePiecePayload {
  title?: string;
  description?: string | null;
  student_notes?: string | null;
}

export function updatePiece(
  id: string,
  payload: UpdatePiecePayload,
): Promise<Piece> {
  return apiFetch<Piece>(`/pieces/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export interface CorrectPiecePayload {
  status: "em_correcao" | "corrigida" | "devolvida_para_ajuste";
  correction_notes?: string | null;
}

export function correctPiece(
  id: string,
  payload: CorrectPiecePayload,
): Promise<Piece> {
  return apiFetch<Piece>(`/pieces/${id}/correct`, {
    method: "PATCH",
    body: payload,
  });
}

export function downloadPiece(id: string): Promise<PieceDownloadResponse> {
  return apiFetch<PieceDownloadResponse>(`/pieces/${id}/download`);
}

export function deletePiece(id: string): Promise<void> {
  return apiFetch<void>(`/pieces/${id}`, { method: "DELETE" });
}

export function getPieceSummary(): Promise<PieceStudentSummary[]> {
  return apiFetch<PieceStudentSummary[]>("/pieces/summary/by-student");
}

export function getPieceStats(): Promise<PieceStats> {
  return apiFetch<PieceStats>("/pieces/stats");
}
