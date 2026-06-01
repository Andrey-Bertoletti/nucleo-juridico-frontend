"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AccessDenied } from "@/components/feedback/AccessDenied";
import { PieceForm } from "@/features/pieces/PieceForm";
import { type PieceFormOutput } from "@/features/pieces/PieceFormSchema";
import { useAuth } from "@/features/auth/useAuth";
import { ApiError } from "@/services/api";
import { createPiece } from "@/services/pieces";

export default function NovaPecaPage() {
  const router = useRouter();
  const { hasRole } = useAuth();
  const allowed = hasRole("aluno_estagiario", "admin_coordenacao");

  const [serverError, setServerError] = useState<string | null>(null);

  if (!allowed) {
    return (
      <AccessDenied message="Apenas alunos/estagiários e a coordenação podem entregar peças." />
    );
  }

  async function handleSubmit(values: PieceFormOutput, file: File) {
    setServerError(null);
    try {
      const created = await createPiece({
        title: values.title,
        file,
        description: values.description ?? undefined,
        attendance_id: values.attendance_id ?? undefined,
        student_notes: values.student_notes ?? undefined,
      });
      router.push(`/pecas/${created.id}`);
    } catch (err) {
      setServerError(
        err instanceof ApiError
          ? err.detail
          : "Não foi possível entregar a peça.",
      );
      throw err;
    }
  }

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div className="animate-fade-in-down">
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-ink">
          Nova Entrega de Peça
        </h1>
        <p className="text-[14px] text-ink-muted">
          Preencha os dados e envie o arquivo da peça processual.
        </p>
      </div>

      <PieceForm
        onSubmit={handleSubmit}
        submitLabel="Entregar peça"
        serverError={serverError}
        onCancel={() => router.push("/pecas")}
      />
    </div>
  );
}
