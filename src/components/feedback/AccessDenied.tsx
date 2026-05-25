"use client";

import Link from "next/link";

import { Button } from "@/components/ui/Button";

interface AccessDeniedProps {
  message?: string;
}

export function AccessDenied({
  message = "Você não tem permissão para acessar esta página.",
}: AccessDeniedProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-line bg-surface-card p-10 text-center shadow-apple-sm animate-fade-in-up">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-rose/12 text-accent-rose">
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          className="h-7 w-7"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m0 3v.008M5.07 19h13.86a2 2 0 0 0 1.74-3l-6.93-12a2 2 0 0 0-3.48 0l-6.93 12a2 2 0 0 0 1.74 3Z"
          />
        </svg>
      </div>
      <div>
        <h2 className="text-[17px] font-semibold tracking-[-0.01em] text-ink">
          Acesso negado
        </h2>
        <p className="mt-1 max-w-md text-[13px] text-ink-muted">{message}</p>
      </div>
      <Link href="/dashboard">
        <Button variant="secondary">Voltar ao painel</Button>
      </Link>
    </div>
  );
}
