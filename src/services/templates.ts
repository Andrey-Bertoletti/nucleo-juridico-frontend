import { apiFetch } from "@/services/api";
import type {
  DynamicField,
  GeneratedDocument,
  Template,
  TemplateStatus,
  TemplateType,
} from "@/types/templates";

// ---------------------------------------------------------------------------
// Templates (modelos)
// ---------------------------------------------------------------------------
export interface ListTemplatesParams {
  type?: TemplateType;
  onlyActive?: boolean;
}

export function listTemplates(
  params: ListTemplatesParams = {},
): Promise<Template[]> {
  const qs = new URLSearchParams();
  if (params.type) qs.set("type", params.type);
  if (params.onlyActive) qs.set("only_active", "true");
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return apiFetch<Template[]>(`/templates${suffix}`);
}

export function getTemplate(id: string): Promise<Template> {
  return apiFetch<Template>(`/templates/${id}`);
}

export interface TemplateCreatePayload {
  title: string;
  description?: string | null;
  type: TemplateType;
  content: string;
  dynamic_fields: DynamicField[];
  status?: TemplateStatus;
}

export function createTemplate(
  payload: TemplateCreatePayload,
): Promise<Template> {
  return apiFetch<Template>("/templates", { method: "POST", body: payload });
}

export interface TemplateUpdatePayload {
  title?: string;
  description?: string | null;
  type?: TemplateType;
  content?: string;
  dynamic_fields?: DynamicField[];
  status?: TemplateStatus;
}

export function updateTemplate(
  id: string,
  payload: TemplateUpdatePayload,
): Promise<Template> {
  return apiFetch<Template>(`/templates/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

/** Alterna ativo/inativo (reversível). */
export function changeTemplateStatus(
  id: string,
  status: TemplateStatus,
): Promise<Template> {
  return apiFetch<Template>(`/templates/${id}/status`, {
    method: "PATCH",
    body: { status },
  });
}

/** Soft delete — mantém histórico, marca status=inativo. */
export function deleteTemplate(id: string): Promise<void> {
  return apiFetch<void>(`/templates/${id}`, { method: "DELETE" });
}

/** Exclusão permanente — só funciona se nenhum documento foi gerado. */
export function deleteTemplatePermanent(id: string): Promise<void> {
  return apiFetch<void>(`/templates/${id}/permanent`, { method: "DELETE" });
}

// ---------------------------------------------------------------------------
// Geração + histórico
// ---------------------------------------------------------------------------
export interface GenerateDocumentPayload {
  student_name: string;
  student_matricula: string;
  /** ISO yyyy-mm-dd. */
  attendance_date: string;
  filled_data: Record<string, string | number | null>;
  attendance_id?: string | null;
  client_id?: string | null;
}

export function generateFromTemplate(
  templateId: string,
  payload: GenerateDocumentPayload,
): Promise<GeneratedDocument> {
  return apiFetch<GeneratedDocument>(`/templates/${templateId}/generate`, {
    method: "POST",
    body: payload,
  });
}

export function getGeneratedDocument(id: string): Promise<GeneratedDocument> {
  return apiFetch<GeneratedDocument>(`/generated-documents/${id}`);
}

export interface ListGeneratedParams {
  templateId?: string;
  attendanceId?: string;
  clientId?: string;
}

export function listGeneratedDocuments(
  params: ListGeneratedParams = {},
): Promise<GeneratedDocument[]> {
  const qs = new URLSearchParams();
  if (params.templateId) qs.set("template_id", params.templateId);
  if (params.attendanceId) qs.set("attendance_id", params.attendanceId);
  if (params.clientId) qs.set("client_id", params.clientId);
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return apiFetch<GeneratedDocument[]>(`/generated-documents${suffix}`);
}
