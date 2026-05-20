export interface Triage {
  id: string;
  attendance_id: string;
  client_report: string | null;
  has_urgent_deadline: boolean;
  urgency_description: string | null;
  presented_documents: string | null;
  pending_documents: string | null;
  suggested_forwarding: string | null;
  student_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TriagePayload {
  client_report?: string | null;
  has_urgent_deadline?: boolean;
  urgency_description?: string | null;
  presented_documents?: string | null;
  pending_documents?: string | null;
  suggested_forwarding?: string | null;
  student_notes?: string | null;
}
