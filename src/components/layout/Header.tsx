"use client";

import { useAuth } from "@/features/auth/useAuth";
import { ROLE_LABELS } from "@/types/auth";

export function Header() {
  const { user } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div>
        <h2 className="text-sm font-medium text-slate-500">Bem-vindo(a)</h2>
        <p className="text-base font-semibold text-slate-900">
          {user?.name ?? "—"}
        </p>
      </div>
      {user && (
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-slate-900">{user.email}</p>
            <p className="text-xs text-slate-500">{ROLE_LABELS[user.role]}</p>
          </div>
          <div
            aria-hidden
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white"
          >
            {initials(user.name)}
          </div>
        </div>
      )}
    </header>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}
