export type PieceStatus =
  | "entregue"
  | "em_correcao"
  | "corrigida"
  | "devolvida_para_ajuste";

export interface Piece {
  id: string;
  student_id: string | null;
  student_name: string | null;
  attendance_id: string | null;
  title: string;
  description: string | null;
  file_name: string;
  file_url: string | null;
  storage_path: string;
  status: PieceStatus;
  corrected_by: string | null;
  corrected_by_name: string | null;
  correction_notes: string | null;
  student_notes: string | null;
  delivered_at: string;
  corrected_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PieceListItem {
  id: string;
  student_id: string | null;
  student_name: string | null;
  attendance_id: string | null;
  title: string;
  file_name: string;
  status: PieceStatus;
  delivered_at: string;
  corrected_at: string | null;
  corrected_by_name: string | null;
}

export interface PieceStudentSummary {
  student_id: string;
  student_name: string;
  total: number;
  entregue: number;
  em_correcao: number;
  corrigida: number;
  devolvida_para_ajuste: number;
}

export interface PieceStats {
  total: number;
  entregue: number;
  em_correcao: number;
  corrigida: number;
  devolvida_para_ajuste: number;
}

export interface PieceDownloadResponse {
  file_name: string;
  signed_url: string;
}

export const PIECE_STATUS_LABELS: Record<PieceStatus, string> = {
  entregue: "Entregue",
  em_correcao: "Em Correção",
  corrigida: "Corrigida",
  devolvida_para_ajuste: "Devolvida p/ Ajuste",
};

import type { BadgeTone } from "@/types/attendance";

export const PIECE_STATUS_TONES: Record<PieceStatus, BadgeTone> = {
  entregue: "blue",
  em_correcao: "amber",
  corrigida: "emerald",
  devolvida_para_ajuste: "rose",
};

export const MAX_PIECE_FILE_SIZE_MB = 10;

export const ALLOWED_PIECE_MIME = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const ALLOWED_PIECE_EXTENSIONS = ".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx";
