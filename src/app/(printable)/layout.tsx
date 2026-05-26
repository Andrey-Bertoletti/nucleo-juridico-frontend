"use client";

/**
 * Layout para páginas imprimíveis (documentos gerados a partir de modelos).
 *
 * Mantém a autenticação do app — o backend exige Bearer pra `/generated-documents/{id}`
 * — mas SEM sidebar/header, tipografia limpa e CSS `@media print` na própria
 * página de impressão. Diferente de `(app)/layout.tsx`, que injeta o shell
 * completo.
 */

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { LoadingState } from "@/components/feedback/LoadingState";
import { useAuth } from "@/features/auth/useAuth";

export default function PrintableLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <LoadingState message="Verificando sessão..." />
      </div>
    );
  }

  return <div className="min-h-screen bg-white text-slate-900">{children}</div>;
}
