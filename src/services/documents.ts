import { apiFetch, apiUpload } from "@/services/api";
import type {
  DocumentItem,
  DocumentStatus,
  DocumentType,
} from "@/types/document";

export function listAttendanceDocuments(
  attendanceId: string,
): Promise<DocumentItem[]> {
  return apiFetch<DocumentItem[]>(
    `/attendances/${attendanceId}/documents`,
  );
}

export function listClientDocuments(
  clientId: string,
): Promise<DocumentItem[]> {
  return apiFetch<DocumentItem[]>(`/clients/${clientId}/documents`);
}

export function getDocument(documentId: string): Promise<DocumentItem> {
  return apiFetch<DocumentItem>(`/documents/${documentId}`);
}

export interface UploadDocumentPayload {
  document_type: DocumentType;
  file: File;
  notes?: string;
}

export function uploadAttendanceDocument(
  attendanceId: string,
  payload: UploadDocumentPayload,
): Promise<DocumentItem> {
  const form = new FormData();
  form.append("document_type", payload.document_type);
  form.append("file", payload.file);
  if (payload.notes) form.append("notes", payload.notes);
  return apiUpload<DocumentItem>(
    `/attendances/${attendanceId}/documents`,
    form,
  );
}

export function changeDocumentStatus(
  documentId: string,
  status: DocumentStatus,
): Promise<DocumentItem> {
  return apiFetch<DocumentItem>(`/documents/${documentId}/status`, {
    method: "PATCH",
    body: { status },
  });
}

export function deleteDocument(documentId: string): Promise<DocumentItem> {
  return apiFetch<DocumentItem>(`/documents/${documentId}`, {
    method: "DELETE",
  });
}
