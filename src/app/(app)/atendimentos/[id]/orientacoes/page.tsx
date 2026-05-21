"use client";

import { useEffect, useState } from "react";

import { LoadingState } from "@/components/feedback/LoadingState";
import { Card } from "@/components/ui/Card";
import { useAttendanceDetail } from "@/features/attendances/AttendanceDetailContext";
import { useAuth } from "@/features/auth/useAuth";
import { OrientationForm } from "@/features/orientations/OrientationForm";
import { OrientationsList } from "@/features/orientations/OrientationsList";
import { ApiError } from "@/services/api";
import {
  createOrientation,
  listOrientations,
} from "@/services/orientations";
import type { Orientation } from "@/types/orientation";

export default function OrientacoesTab() {
  const { attendance, reload } = useAttendanceDetail();
  const { hasRole } = useAuth();
  const canRegister = hasRole("professor_orientador", "admin_coordenacao");

  const [orientations, setOrientations] = useState<Orientation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    listOrientations(attendance.id)
      .then((rows) => {
        if (!cancelled) setOrientations(rows);
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(
            err instanceof ApiError
              ? err.detail
              : "Erro ao carregar orientações.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [attendance.id]);

  async function handleSubmit({
    orientation_text,
    teacher_notes,
    decision,
  }: {
    orientation_text: string;
    teacher_notes: string | null;
    decision: Orientation["decision"];
  }) {
    setServerError(null);
    setSuccessMessage(null);
    try {
      const created = await createOrientation(attendance.id, {
        orientation_text,
        teacher_notes,
        decision,
      });
      setOrientations((prev) => [created, ...prev]);
      // Status do atendimento pode ter mudado — recarrega o contexto pai
      await reload();
      setSuccessMessage(
        decision
          ? "Decisão registrada e status atualizado."
          : "Orientação salva.",
      );
      window.setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      setServerError(
        err instanceof ApiError
          ? err.detail
          : "Não foi possível registrar a orientação.",
      );
    }
  }

  if (loading) return <LoadingState message="Carregando orientações..." />;
  if (loadError) {
    return (
      <Card>
        <p className="text-sm text-red-700">{loadError}</p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <OrientationsList orientations={orientations} />

      {canRegister ? (
        <OrientationForm
          onSubmit={handleSubmit}
          serverError={serverError}
          successMessage={successMessage}
        />
      ) : (
        <Card>
          <p className="text-sm text-slate-600">
            Apenas o professor responsável e a coordenação podem registrar
            orientações neste atendimento.
          </p>
        </Card>
      )}
    </div>
  );
}
