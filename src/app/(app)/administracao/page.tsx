"use client";

import Link from "next/link";

import { AccessDenied } from "@/components/feedback/AccessDenied";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/features/auth/useAuth";

const CARDS = [
  {
    href: "/admin/usuarios",
    title: "Usuários",
    description:
      "Cadastrar, editar e ativar/desativar contas (alunos, professores e coordenação).",
  },
  {
    href: "/admin/areas-juridicas",
    title: "Áreas jurídicas",
    description:
      "Manter as áreas do direito disponíveis para classificar atendimentos.",
  },
  {
    href: "/admin/tipos-demanda",
    title: "Tipos de demanda",
    description:
      "Gerenciar os tipos de demanda associados a cada área jurídica.",
  },
];

export default function AdministracaoPage() {
  const { hasRole } = useAuth();
  if (!hasRole("admin_coordenacao")) {
    return <AccessDenied message="Esta área é exclusiva para a coordenação." />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Administração</h1>
        <p className="text-sm text-slate-500">
          Gestão de usuários, áreas do direito e tipos de demanda.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {CARDS.map((c) => (
          <Link key={c.href} href={c.href}>
            <Card
              title={c.title}
              description={c.description}
              className="h-full transition-shadow hover:shadow-md"
            >
              <p className="text-sm font-medium text-slate-700">
                Acessar →
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
