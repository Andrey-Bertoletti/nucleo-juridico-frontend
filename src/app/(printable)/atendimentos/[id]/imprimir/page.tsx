"use client";

/**
 * Impressão de um atendimento para coleta de assinatura física.
 *
 * Inclui:
 * - Cabeçalho institucional NPJ-ITES
 * - Dados do cliente (nome, CPF, endereço/contato)
 * - Classificação (área jurídica, tipo de demanda, status, urgência)
 * - Descrição do problema + observações
 * - **Bloco do aluno responsável** com nome/matrícula manuais + data
 * - **Duas linhas de assinatura**: aluno responsável e cliente/assistido
 *
 * O bloco de assinatura é o ponto central — confirma que o atendimento
 * realmente foi conduzido pelo aluno informado (login compartilhado) e que
 * o cliente reconhece o conteúdo.
 */

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { LoadingState } from "@/components/feedback/LoadingState";
import { formatDateBR, maskCpf, maskPhone } from "@/lib/format";
import { ApiError } from "@/services/api";
import { getAttendance } from "@/services/attendances";
import {
  listDemandTypes,
  listLegalAreas,
} from "@/services/catalogs";
import { getClient } from "@/services/clients";
import type { Attendance } from "@/types/attendance";
import type { Client } from "@/types/client";

const STATUS_LABELS: Record<string, string> = {
  novo_atendimento: "Novo atendimento",
  em_triagem: "Em triagem",
  aguardando_documentos: "Aguardando documentos",
  encaminhado_ao_professor: "Encaminhado ao professor",
  em_analise_pelo_professor: "Em análise pelo professor",
  correcao_solicitada: "Correção solicitada",
  aguardando_retorno_cliente: "Aguardando retorno do cliente",
  encaminhamento_aprovado: "Encaminhamento aprovado",
  finalizado: "Finalizado",
  arquivado: "Arquivado",
};

export default function ImprimirAtendimentoPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [legalAreaName, setLegalAreaName] = useState<string | null>(null);
  const [demandTypeName, setDemandTypeName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const att = await getAttendance(id);
        setAttendance(att);
        const [c, las, dts] = await Promise.all([
          getClient(att.client_id).catch(() => null),
          att.legal_area_id ? listLegalAreas() : Promise.resolve([]),
          att.demand_type_id
            ? listDemandTypes(att.legal_area_id || undefined)
            : Promise.resolve([]),
        ]);
        setClient(c);
        setLegalAreaName(
          las.find((la) => la.id === att.legal_area_id)?.name ?? null,
        );
        setDemandTypeName(
          dts.find((dt) => dt.id === att.demand_type_id)?.name ?? null,
        );
      } catch (err) {
        setError(
          err instanceof ApiError ? err.detail : "Erro ao carregar atendimento.",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <LoadingState message="Carregando atendimento..." />;
  if (error || !attendance)
    return <p className="p-8 text-red-700">{error || "Atendimento não encontrado."}</p>;

  // Os campos de identificação ficam SEMPRE em branco na versão impressa
  // para o aluno preencher de próprio punho — isso reforça a autenticidade
  // (letra dele junto com a assinatura), independente do que estiver salvo
  // no banco.

  return (
    <>
      <style jsx global>{`
        @page {
          size: A4;
          margin: 18mm 16mm;
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

      <div className="no-print sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-3 backdrop-blur">
        <a
          href={`/atendimentos/${attendance.id}`}
          className="text-[13px] font-medium text-slate-600 hover:text-slate-900"
        >
          ← Voltar ao atendimento
        </a>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-lg bg-slate-900 px-3 py-1.5 text-[13px] font-medium text-white hover:bg-slate-800"
        >
          Imprimir
        </button>
      </div>

      <article className="print-page mx-auto my-8 max-w-3xl bg-white p-12 shadow-sm">
        <header className="mb-6 border-b border-slate-300 pb-4 text-center">
          <h1 className="text-[18px] font-bold tracking-wide text-slate-900">
            NÚCLEO DE PRÁTICAS JURÍDICAS — NPJ
          </h1>
          <p className="text-[12px] text-slate-600">
            Instituto Taquaritinguense de Ensino Superior — ITES
          </p>
        </header>

        <h2 className="mb-6 text-center text-[15px] font-semibold uppercase tracking-wider text-slate-900">
          Ficha de Atendimento
        </h2>

        {/* Identificação do cliente */}
        <section className="mb-5">
          <h3 className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-slate-700">
            Cliente / Assistido
          </h3>
          <PrintRow label="Nome completo" value={client?.full_name ?? "—"} />
          <PrintRow
            label="CPF"
            value={client?.cpf ? maskCpf(client.cpf) : "—"}
          />
          <PrintRow
            label="Telefone"
            value={client?.phone ? maskPhone(client.phone) : "—"}
          />
          <PrintRow label="E-mail" value={client?.email || "—"} />
          <PrintRow
            label="Cidade/UF"
            value={
              [client?.city, client?.state].filter(Boolean).join(" / ") || "—"
            }
          />
          <PrintRow
            label="Data de nascimento"
            value={
              client?.birth_date ? formatDateBR(client.birth_date) : "—"
            }
          />
        </section>

        {/* Classificação */}
        <section className="mb-5">
          <h3 className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-slate-700">
            Classificação
          </h3>
          <PrintRow label="Área jurídica" value={legalAreaName || "—"} />
          <PrintRow label="Tipo de demanda" value={demandTypeName || "—"} />
          <PrintRow
            label="Status"
            value={STATUS_LABELS[attendance.status] || attendance.status}
          />
          <PrintRow
            label="Urgência"
            value={attendance.urgency ? "Sim" : "Não"}
          />
          <PrintRow
            label="Aberto em"
            value={new Date(attendance.created_at).toLocaleString("pt-BR")}
          />
        </section>

        {/* Descrição */}
        <section className="mb-5">
          <h3 className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-slate-700">
            Descrição do problema
          </h3>
          <div className="whitespace-pre-wrap rounded border border-slate-200 px-3 py-2 text-[12px] text-slate-900 min-h-[80px]">
            {attendance.description || "—"}
          </div>
        </section>

        {/* Observações */}
        {attendance.notes && (
          <section className="mb-5">
            <h3 className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-slate-700">
              Observações
            </h3>
            <div className="whitespace-pre-wrap rounded border border-slate-200 px-3 py-2 text-[12px] text-slate-900">
              {attendance.notes}
            </div>
          </section>
        )}

        {/* Identificação do aluno responsável + assinaturas */}
        <section className="mt-10 border-t border-slate-300 pt-5">
          <h3 className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-slate-700">
            Identificação do aluno responsável
          </h3>
          <p className="mb-3 text-[10px] italic text-slate-500">
            A preencher pelo próprio aluno, de próprio punho, no ato da assinatura.
          </p>
          <div className="grid grid-cols-2 gap-x-8 gap-y-5 text-[12px] text-slate-800">
            <FillField label="Nome completo" />
            <FillField label="Matrícula" />
            <div className="col-span-2 grid grid-cols-2 gap-x-8">
              <FillField label="Data do atendimento" />
              <FillField label="RG ou CPF" />
            </div>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-x-12">
            <div>
              <div className="border-t border-slate-700" />
              <p className="mt-1 text-center text-[10px] text-slate-700">
                Assinatura do aluno responsável
              </p>
            </div>
            <div>
              <div className="border-t border-slate-700" />
              <p className="mt-1 text-center text-[10px] text-slate-700">
                Assinatura do(a) atendido(a)
              </p>
            </div>
          </div>
        </section>

        <footer className="mt-8 text-center text-[9px] text-slate-400">
          Atendimento {attendance.id} · NPJ-ITES
        </footer>
      </article>
    </>
  );
}

function PrintRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[160px_1fr] gap-x-3 py-0.5 text-[12px]">
      <span className="text-slate-500">{label}:</span>
      <span className="text-slate-900">{value}</span>
    </div>
  );
}

function FillField({ label }: { label: string }) {
  return (
    <div>
      <div className="h-5 border-b border-slate-700" />
      <p className="mt-1 text-[10px] text-slate-600">{label}</p>
    </div>
  );
}
