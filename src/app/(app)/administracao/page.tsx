"use client";

// TODO: módulo em desenvolvimento — gestão de usuários, áreas, tipos de demanda e configurações.

import { AccessDenied } from "@/components/feedback/AccessDenied";
import { EmptyState } from "@/components/feedback/EmptyState";
import { useAuth } from "@/features/auth/useAuth";

export default function AdministracaoPage() {
  const { hasRole } = useAuth();
  const allowed = hasRole("admin_coordenacao");

  if (!allowed) {
    return (
      <AccessDenied message="Esta área é exclusiva para a coordenação." />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Administração</h1>
        <p className="text-sm text-slate-500">
          Gestão de usuários, áreas do direito, tipos de demanda e configurações do núcleo.
        </p>
      </div>

      <EmptyState
        title="Em desenvolvimento"
        description="O painel administrativo (CRUD de usuários, áreas e tipos de demanda) será habilitado em breve. Por enquanto, as operações podem ser feitas pela API ou pelo Supabase Studio."
      />
    </div>
  );
}
