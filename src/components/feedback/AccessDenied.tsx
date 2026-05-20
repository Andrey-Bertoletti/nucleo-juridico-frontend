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
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-slate-200 bg-white p-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m0 3v.008M5.07 19h13.86a2 2 0 0 0 1.74-3l-6.93-12a2 2 0 0 0-3.48 0l-6.93 12a2 2 0 0 0 1.74 3Z"
          />
        </svg>
      </div>
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Acesso negado</h2>
        <p className="mt-1 max-w-md text-sm text-slate-500">{message}</p>
      </div>
      <Link href="/dashboard">
        <Button variant="secondary">Voltar ao painel</Button>
      </Link>
    </div>
  );
}
