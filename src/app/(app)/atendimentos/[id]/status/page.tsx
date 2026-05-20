"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import {
  AttendanceStatusBadge,
} from "@/components/feedback/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useAttendanceDetail } from "@/features/attendances/AttendanceDetailContext";
import { ApiError } from "@/services/api";
import { changeAttendanceStatus } from "@/services/attendances";
import {
  ATTENDANCE_STATUS_GROUPS,
  ATTENDANCE_STATUS_LABELS,
  type AttendanceStatus,
} from "@/types/attendance";

export default function AtualizarStatusPage() {
  const router = useRouter();
  const { attendance, reload } = useAttendanceDetail();

  const [status, setStatus] = useState<AttendanceStatus>(attendance.status);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await changeAttendanceStatus(attendance.id, {
        status,
        note: note.trim() || undefined,
      });
      await reload();
      router.push(`/atendimentos/${attendance.id}`);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.detail
          : "Não foi possível atualizar o status.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card title="Atualizar status do atendimento" className="max-w-2xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div className="rounded-md bg-slate-50 px-3 py-2 text-sm">
          <span className="text-slate-600">Status atual: </span>
          <AttendanceStatusBadge value={attendance.status} />
        </div>

        <Select
          label="Novo status *"
          value={status}
          onChange={(e) => setStatus(e.target.value as AttendanceStatus)}
        >
          {ATTENDANCE_STATUS_GROUPS.map((group) => (
            <optgroup key={group.label} label={group.label}>
              {group.values.map((s) => (
                <option key={s} value={s}>
                  {ATTENDANCE_STATUS_LABELS[s]}
                </option>
              ))}
            </optgroup>
          ))}
        </Select>

        <Textarea
          label="Anotação (opcional)"
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Justifique a mudança de status ou descreva o que motivou..."
        />

        {error && (
          <p
            role="alert"
            className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push(`/atendimentos/${attendance.id}`)}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={submitting}
            disabled={status === attendance.status && !note.trim()}
          >
            Salvar alteração
          </Button>
        </div>
      </form>
    </Card>
  );
}
