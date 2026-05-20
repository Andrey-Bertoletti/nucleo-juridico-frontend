"use client";

import { Card } from "@/components/ui/Card";
import { useAuth } from "@/features/auth/useAuth";
import { ROLE_LABELS } from "@/types/auth";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">
          Visão geral inicial. Indicadores e listas serão adicionados em
          próximas iterações.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card title="Atendimentos abertos" description="Total no núcleo">
          <p className="text-3xl font-semibold text-slate-900">—</p>
        </Card>
        <Card title="Pendências" description="Documentos / orientações">
          <p className="text-3xl font-semibold text-slate-900">—</p>
        </Card>
        <Card title="Agendamentos hoje" description="Retornos do dia">
          <p className="text-3xl font-semibold text-slate-900">—</p>
        </Card>
      </div>

      <Card title="Sua sessão">
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Nome
            </dt>
            <dd className="text-sm text-slate-900">{user?.name}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
              E-mail
            </dt>
            <dd className="text-sm text-slate-900">{user?.email}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Perfil
            </dt>
            <dd className="text-sm text-slate-900">
              {user ? ROLE_LABELS[user.role] : "—"}
            </dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
