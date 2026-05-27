"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { LoadingState } from "@/components/feedback/LoadingState";
import { ApiError } from "@/services/api";
import { getGeneratedDocument } from "@/services/templates";
import {
  TEMPLATE_TYPE_LABELS,
  type GeneratedDocument,
} from "@/types/templates";

/**
 * Página de impressão de um documento gerado.
 *
 * - Layout A4-friendly em monospace/serifa institucional
 * - Cabeçalho NPJ-ITES
 * - Conteúdo final já interpolado
 * - Bloco "Identificação do aluno responsável" com nome, matrícula, data
 *   e linha de assinatura — obrigatório porque o login de aluno é compartilhado
 * - Espaço para assinatura do(a) destinatário(a)
 * - Controles `.no-print` ficam ocultos na impressão via `@media print`.
 */
export default function ImprimirDocumentoPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [doc, setDoc] = useState<GeneratedDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        setDoc(await getGeneratedDocument(id));
      } catch (err) {
        setError(
          err instanceof ApiError
            ? err.detail
            : "Documento não encontrado.",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <LoadingState message="Carregando documento..." />;
  if (error || !doc) return <p className="p-8 text-red-700">{error}</p>;

  const formattedDate = new Date(doc.attendance_date + "T00:00:00").toLocaleDateString(
    "pt-BR",
  );

  return (
    <>
      {/* Estilos específicos de impressão. Inclui margens A4, escondida sidebar,
          bordas finas e tipografia serifada. */}
      <style jsx global>{`
        @page {
          size: A4;
          margin: 20mm 18mm;
        }
        @media print {
          .no-print {
            display: none !important;
          }
          html,
          body {
            background: white !important;
          }
          .print-page {
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 !important;
            max-width: none !important;
          }
        }
        .print-page {
          font-family: "Georgia", "Times New Roman", serif;
          color: #111;
        }
      `}</style>

      {/* Barra de ações (escondida na impressão). */}
      <div className="no-print sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-3 backdrop-blur">
        <a
          href="/modelos"
          className="text-[13px] font-medium text-slate-600 hover:text-slate-900"
        >
          ← Voltar aos modelos
        </a>
        <div className="flex items-center gap-2 text-[12px] text-slate-500">
          <span>{TEMPLATE_TYPE_LABELS[doc.template_type]}</span>
          <span>•</span>
          <span>Gerado em {new Date(doc.generated_at).toLocaleString("pt-BR")}</span>
          <button
            type="button"
            onClick={() => window.print()}
            className="ml-3 rounded-lg bg-slate-900 px-3 py-1.5 text-[13px] font-medium text-white hover:bg-slate-800"
          >
            Imprimir
          </button>
        </div>
      </div>

      <article className="print-page mx-auto my-8 max-w-3xl bg-white p-12 shadow-sm">
        {/* Cabeçalho institucional. */}
        <header className="mb-8 border-b border-slate-300 pb-4 text-center">
          <h1 className="text-[18px] font-bold tracking-wide text-slate-900">
            NÚCLEO DE PRÁTICAS JURÍDICAS — NPJ
          </h1>
          <p className="text-[12px] text-slate-600">
            Instituto Taquaritinguense de Ensino Superior — ITES
          </p>
        </header>

        {/* Título do documento. */}
        <h2 className="mb-6 text-center text-[16px] font-semibold uppercase tracking-wider text-slate-900">
          {doc.template_title}
        </h2>

        {/* Conteúdo já interpolado vindo do backend — HTML enriquecido vindo
            do editor Tiptap, com valores HTML-escapados pelo `_interpolate`. */}
        <div
          className="template-content text-[13px] leading-relaxed text-slate-900"
          dangerouslySetInnerHTML={{ __html: doc.final_content }}
        />

        {/* Identificação do aluno responsável + linha de assinatura. */}
        <section className="mt-12 border-t border-slate-300 pt-6">
          <h3 className="mb-4 text-[13px] font-semibold uppercase tracking-wider text-slate-700">
            Identificação do aluno responsável
          </h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-[12px] text-slate-800">
            <div>
              <span className="text-slate-500">Nome completo:</span>{" "}
              <strong className="text-slate-900">{doc.student_name}</strong>
            </div>
            <div>
              <span className="text-slate-500">Matrícula:</span>{" "}
              <strong className="text-slate-900">{doc.student_matricula}</strong>
            </div>
            <div className="col-span-2">
              <span className="text-slate-500">Data do atendimento:</span>{" "}
              <strong className="text-slate-900">{formattedDate}</strong>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-x-12">
            <div>
              <div className="border-t border-slate-700" />
              <p className="mt-1 text-center text-[11px] text-slate-700">
                Assinatura do aluno responsável
              </p>
            </div>
            <div>
              <div className="border-t border-slate-700" />
              <p className="mt-1 text-center text-[11px] text-slate-700">
                Assinatura do(a) atendido(a)
              </p>
            </div>
          </div>
        </section>

        {/* Rodapé com identificador do documento — útil pra rastrear no sistema. */}
        <footer className="mt-10 text-center text-[9px] text-slate-400">
          Documento gerado pelo sistema NPJ-ITES — ID {doc.id}
        </footer>
      </article>
    </>
  );
}
