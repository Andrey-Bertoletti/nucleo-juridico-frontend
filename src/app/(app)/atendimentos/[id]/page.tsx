"use client";

import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAttendanceDetail } from "@/features/attendances/AttendanceDetailContext";
import { formatDateBR, maskCpf, maskPhone } from "@/lib/format";

export default function ResumoTab() {
  const { attendance, client } = useAttendanceDetail();

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <Card title="Descrição do problema" className="md:col-span-2">
        {attendance.description ? (
          <p className="whitespace-pre-wrap text-sm text-slate-700">
            {attendance.description}
          </p>
        ) : (
          <p className="text-sm text-slate-500">
            Nenhuma descrição registrada.
          </p>
        )}
      </Card>

      <Card title="Observações iniciais">
        {attendance.notes ? (
          <p className="whitespace-pre-wrap text-sm text-slate-700">
            {attendance.notes}
          </p>
        ) : (
          <p className="text-sm text-slate-500">Sem observações iniciais.</p>
        )}
      </Card>

      <Card
        title="Dados do cliente"
        footer={
          client && (
            <Link href={`/clientes/${client.id}`}>
              <Button variant="ghost">Ver ficha completa</Button>
            </Link>
          )
        }
      >
        {client ? (
          <dl className="space-y-2 text-sm">
            <Item label="Nome" value={client.full_name} />
            <Item
              label="CPF"
              value={client.cpf ? maskCpf(client.cpf) : "—"}
            />
            <Item
              label="Telefone"
              value={client.phone ? maskPhone(client.phone) : "—"}
            />
            <Item label="E-mail" value={client.email || "—"} />
            <Item
              label="Cidade/UF"
              value={
                [client.city, client.state].filter(Boolean).join(" / ") || "—"
              }
            />
            <Item
              label="Data de nascimento"
              value={formatDateBR(client.birth_date)}
            />
          </dl>
        ) : (
          <p className="text-sm text-slate-500">
            Cliente não disponível ou removido.
          </p>
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
