"use client";

import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useAuth } from "@/features/auth/useAuth";
import { ROLE_LABELS } from "@/types/auth";

export function Header() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-line-subtle bg-surface-raised/70 px-6 backdrop-blur-xl">
      <div>
        <h2 className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink-subtle">
          Bem-vindo(a)
        </h2>
        <p className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
          {user?.name ?? "—"}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        {user && (
          <>
            <div className="hidden text-right md:block">
              <p className="text-[13px] font-medium text-ink">{user.email}</p>
              <p className="text-[11px] text-ink-subtle">
                {ROLE_LABELS[user.role]}
              </p>
            </div>
            <div
              aria-hidden
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand to-accent-indigo text-[13px] font-semibold text-white shadow-apple-sm ring-1 ring-white/20 transition-transform duration-300 ease-apple hover:scale-105"
            >
              {initials(user.name)}
            </div>
          </>
        )}
      </div>
    </header>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}
