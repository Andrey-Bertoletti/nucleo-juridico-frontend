"use client";

import { Card } from "@/components/ui/Card";
import { useClientDetail } from "@/features/clients/ClientDetailContext";
import { formatCurrencyBR, formatDateBR } from "@/lib/format";
import { MARITAL_STATUS_LABELS } from "@/types/client";

export default function ClientDadosTab() {
  const { client } = useClientDetail();

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <Card title="Endereço">
        <dl className="space-y-2 text-sm">
          <Item label="Logradouro" value={client.address || "—"} />
          <Item label="Bairro" value={client.district || "—"} />
          <Item label="Cidade" value={client.city || "—"} />
          <Item label="UF" value={client.state || "—"} />
        </dl>
      </Card>

      <Card title="Perfil socioeconômico">
        <dl className="space-y-2 text-sm">
          <Item
            label="Estado civil"
            value={
              client.marital_status
                ? MARITAL_STATUS_LABELS[client.marital_status]
                : "—"
            }
          />
          <Item label="Profissão" value={client.profession || "—"} />
          <Item
            label="Renda familiar"
            value={formatCurrencyBR(client.family_income)}
          />
          <Item
            label="Data de nascimento"
            value={formatDateBR(client.birth_date)}
          />
          <Item label="RG" value={client.rg || "—"} />
        </dl>
      </Card>

      <Card title="Observações" className="md:col-span-2">
        {client.notes ? (
          <p className="whitespace-pre-wrap text-sm text-slate-700">
            {client.notes}
          </p>
        ) : (
          <p className="text-sm text-slate-500">Sem observações registradas.</p>
        )}
      </Card>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="col-span-2 text-slate-800">{value}</dd>
    </div>
  );
}
