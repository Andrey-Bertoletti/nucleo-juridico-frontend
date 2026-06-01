"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { LoadingState } from "@/components/feedback/LoadingState";
import { PieceStatusBadge } from "@/components/feedback/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PieceCorrectionForm } from "@/features/pieces/PieceCorrectionForm";
import { useAuth } from "@/features/auth/useAuth";
import { cn } from "@/lib/utils";
import { formatDateTimeBR } from "@/lib/format";
import { ApiError } from "@/services/api";
import {
  getPiece,
  downloadPiece,
  correctPiece,
  deletePiece,
} from "@/services/pieces";
import type { Piece, PieceStatus } from "@/types/piece";
import { PIECE_STATUS_LABELS } from "@/types/piece";

export default function PieceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { hasRole, user } = useAuth();
  const isTeacherOrAdmin = hasRole("professor_orientador", "admin_coordenacao");
  const isAdmin = hasRole("admin_coordenacao");
  const isStudent = hasRole("aluno_estagiario");

  const [piece, setPiece] = useState<Piece | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [correctionError, setCorrectionError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadPiece = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getPiece(id);
      setPiece(data);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.detail
          : "Erro ao carregar a peça.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadPiece();
  }, [loadPiece]);

  async function handleDownload() {
    if (!id) return;
    setDownloading(true);
    try {
      const data = await downloadPiece(id);
      window.open(data.signed_url, "_blank");
    } catch (err) {
      alert(
        err instanceof ApiError
          ? err.detail
          : "Erro ao gerar o link de download.",
      );
    } finally {
      setDownloading(false);
    }
  }

  async function handleCorrect(data: {
    status: "em_correcao" | "corrigida" | "devolvida_para_ajuste";
    correction_notes: string | null;
  }) {
    if (!id) return;
    setCorrectionError(null);
    try {
      const updated = await correctPiece(id, data);
      setPiece(updated);
    } catch (err) {
      setCorrectionError(
        err instanceof ApiError
          ? err.detail
          : "Erro ao salvar a correção.",
      );
      throw err;
    }
  }

  async function handleDelete() {
    if (!id) return;
    if (
      !window.confirm(
        "Tem certeza que deseja remover esta peça? Esta ação não pode ser desfeita.",
      )
    )
      return;

    setDeleting(true);
    try {
      await deletePiece(id);
      router.push("/pecas");
    } catch (err) {
      alert(
        err instanceof ApiError
          ? err.detail
          : "Erro ao remover a peça.",
      );
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return <LoadingState message="Carregando peça..." />;
  }

  if (error || !piece) {
    return (
      <Card>
        <p className="text-sm text-red-700">{error || "Peça não encontrada."}</p>
        <Link
          href="/pecas"
          className="mt-3 inline-block text-[13px] text-brand hover:text-brand-hover"
        >
          ← Voltar para a lista
        </Link>
      </Card>
    );
  }

  const canEdit =
    isAdmin ||
    (isStudent &&
      piece.student_id === user?.id &&
      (piece.status === "entregue" || piece.status === "devolvida_para_ajuste"));

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      {/* Back + Title */}
      <div className="animate-fade-in-down">
        <Link
          href="/pecas"
          className="mb-2 inline-flex items-center gap-1 text-[13px] text-ink-subtle transition-colors hover:text-ink"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.7}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Voltar
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-ink">
              {piece.title}
            </h1>
            <p className="mt-0.5 text-[13px] text-ink-muted">
              Entregue em {formatDateTimeBR(piece.delivered_at)}
            </p>
          </div>
          <PieceStatusBadge value={piece.status} />
        </div>
      </div>

      {/* Info Card */}
      <Card className="animate-fade-in-up">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InfoItem label="Aluno" value={piece.student_name || "—"} />
          <InfoItem label="Status" value={PIECE_STATUS_LABELS[piece.status]} />
          <InfoItem
            label="Arquivo"
            value={
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-brand transition-colors hover:text-brand-hover disabled:opacity-50"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.7}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                  aria-hidden
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                {downloading ? "Gerando link..." : piece.file_name}
              </button>
            }
          />
          <InfoItem
            label="Atendimento vinculado"
            value={piece.attendance_id ? piece.attendance_id : "Nenhum (avulsa)"}
          />
          {piece.corrected_by_name && (
            <InfoItem
              label="Corrigido por"
              value={piece.corrected_by_name}
            />
          )}
          {piece.corrected_at && (
            <InfoItem
              label="Data da correção"
              value={formatDateTimeBR(piece.corrected_at)}
            />
          )}
        </div>
      </Card>

      {/* Description */}
      {piece.description && (
        <Card className="animate-fade-in-up" style={{ animationDelay: "50ms" }}>
          <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-[0.05em] text-ink-subtle">
            Descrição
          </h3>
          <p className="whitespace-pre-wrap text-[14px] text-ink leading-relaxed">
            {piece.description}
          </p>
        </Card>
      )}

      {/* Student Notes */}
      {piece.student_notes && (
        <Card className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-[0.05em] text-ink-subtle">
            Observações do Aluno
          </h3>
          <p className="whitespace-pre-wrap text-[14px] text-ink leading-relaxed">
            {piece.student_notes}
          </p>
        </Card>
      )}

      {/* Correction Notes */}
      {piece.correction_notes && (
        <Card
          className="animate-fade-in-up border-l-4 border-l-accent-amber"
          style={{ animationDelay: "150ms" }}
        >
          <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-[0.05em] text-ink-subtle">
            Observações do Professor
          </h3>
          <p className="whitespace-pre-wrap text-[14px] text-ink leading-relaxed">
            {piece.correction_notes}
          </p>
          {piece.corrected_by_name && (
            <p className="mt-2 text-[12px] text-ink-subtle">
              — {piece.corrected_by_name}
              {piece.corrected_at && `, ${formatDateTimeBR(piece.corrected_at)}`}
            </p>
          )}
        </Card>
      )}

      {/* Correction Form (professor/admin) */}
      {isTeacherOrAdmin && (
        <div className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <PieceCorrectionForm
            currentStatus={piece.status}
            currentNotes={piece.correction_notes}
            onSubmit={handleCorrect}
            serverError={correctionError}
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3 animate-fade-in-up" style={{ animationDelay: "250ms" }}>
        {canEdit && (
          <Link href={`/pecas/${piece.id}`}>
            <Button variant="ghost">Editar peça</Button>
          </Link>
        )}
        {isAdmin && (
          <Button
            variant="ghost"
            onClick={handleDelete}
            isLoading={deleting}
            className="text-accent-rose hover:bg-accent-rose/10"
          >
            Excluir peça
          </Button>
        )}
      </div>
    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-medium uppercase tracking-[0.05em] text-ink-subtle">
        {label}
      </span>
      <span className="text-[14px] text-ink">{value}</span>
    </div>
  );
}
