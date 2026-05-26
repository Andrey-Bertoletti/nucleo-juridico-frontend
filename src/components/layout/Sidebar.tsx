"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactElement, ReactNode } from "react";

import { useAuth } from "@/features/auth/useAuth";
import { cn } from "@/lib/utils";
import type { Role } from "@/types/auth";

interface MenuItem {
  label: string;
  href: string;
  icon: (props: { className?: string }) => ReactElement;
  roles?: Role[];
}

const MENU: MenuItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: IconHome },
  { label: "Clientes / Assistidos", href: "/clientes", icon: IconUsers },
  { label: "Atendimentos", href: "/atendimentos", icon: IconFolder },
  { label: "Agenda", href: "/agenda", icon: IconCalendar },
  { label: "Documentos", href: "/documentos", icon: IconDoc },
  { label: "Modelos", href: "/modelos", icon: IconDoc },
  {
    label: "Casos para Análise",
    href: "/casos-analise",
    icon: IconScales,
    roles: ["professor_orientador", "admin_coordenacao"],
  },
  { label: "Relatórios", href: "/relatorios", icon: IconChart },
  {
    label: "Administração",
    href: "/administracao",
    icon: IconShield,
    roles: ["admin_coordenacao"],
  },
  { label: "Perfil", href: "/profile", icon: IconUser },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const visibleItems = MENU.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role)),
  );

  return (
    <aside className="sticky top-0 flex h-screen w-64 flex-col border-r border-line bg-surface-raised/80 backdrop-blur-xl">
      <div className="flex items-center gap-3 border-b border-line-subtle px-5 py-4">
        <div
          className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-hover text-white shadow-apple-sm ring-1 ring-white/15"
          aria-hidden
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.7}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6" />
          </svg>
        </div>
        <div className="min-w-0">
          <h1 className="text-[13px] font-semibold tracking-[-0.01em] text-ink leading-tight truncate">
            NPJ - ITES
          </h1>
          <p className="text-[11px] text-ink-subtle leading-tight truncate">
            Gestão de atendimento
          </p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-0.5">
          {visibleItems.map((item, i) => {
            const Icon = item.icon;
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li
                key={item.href}
                className="animate-fade-in"
                style={{ animationDelay: `${i * 25}ms` }}
              >
                <Link
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium tracking-[-0.005em]",
                    "transition-all duration-200 ease-apple-snap",
                    active
                      ? "bg-brand text-white shadow-apple-sm"
                      : "text-ink-muted hover:bg-surface-sunken hover:text-ink",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-[18px] w-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110",
                      active ? "text-white" : "text-ink-subtle group-hover:text-ink",
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-line-subtle p-3">
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
      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink-muted transition-all duration-200 ease-apple-snap hover:bg-accent-rose/10 hover:text-accent-rose"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-[18px] w-[18px]"
        aria-hidden
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
      {children}
    </button>
  );
}

// ---------- Icons ----------
function IconHome({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-5h-2v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  );
}
function IconUsers({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function IconFolder({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  );
}
function IconCalendar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="3" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
function IconDoc({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="13" y2="17" />
    </svg>
  );
}
function IconScales({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M12 3v18" />
      <path d="M5 6h14" />
      <path d="m5 6 3 6a3 3 0 1 1-6 0z" />
      <path d="m19 6 3 6a3 3 0 1 1-6 0z" />
    </svg>
  );
}
function IconChart({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
      <line x1="3" y1="20" x2="21" y2="20" />
    </svg>
  );
}
function IconShield({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
function IconUser({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
