"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { useAuth } from "@/features/auth/useAuth";
import { cn } from "@/lib/utils";
import type { Role } from "@/types/auth";

interface MenuItem {
  label: string;
  href: string;
  /**
   * Papéis que enxergam o item. Se omitido, todos os papéis veem.
   * Regras:
   *  - aluno_estagiario não vê Administração
   *  - professor_orientador vê Casos para Análise
   *  - admin_coordenacao vê tudo
   */
  roles?: Role[];
}

const MENU: MenuItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Clientes / Assistidos", href: "/clientes" },
  { label: "Atendimentos", href: "/atendimentos" },
  { label: "Agenda", href: "/agenda" },
  { label: "Documentos", href: "/documentos" },
  {
    label: "Casos para Análise",
    href: "/casos-analise",
    roles: ["professor_orientador", "admin_coordenacao"],
  },
  { label: "Relatórios", href: "/relatorios" },
  {
    label: "Administração",
    href: "/administracao",
    roles: ["admin_coordenacao"],
  },
  { label: "Perfil", href: "/profile" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const visibleItems = MENU.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role)),
  );

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-5 py-4">
        <h1 className="text-base font-semibold text-slate-900">
          Núcleo Jurídico
        </h1>
        <p className="text-xs text-slate-500">Gestão de atendimento</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-1">
          {visibleItems.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "block rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-slate-900 text-white"
                      : "text-slate-700 hover:bg-slate-100",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-slate-100 p-3">
        <SidebarLogout onClick={() => void logout()}>Sair</SidebarLogout>
      </div>
    </aside>
  );
}

function SidebarLogout({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-100"
    >
      {children}
    </button>
  );
}
