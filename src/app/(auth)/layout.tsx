"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { BrandHeader } from "@/components/branding/BrandHeader";
import { LoadingState } from "@/components/feedback/LoadingState";
import { useAuth } from "@/features/auth/useAuth";

export default function AuthLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [loading, user, router]);

  if (loading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingState message="Carregando..." />
      </div>
    );
  }

  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/60 px-4 py-10">
      <div className="mx-auto flex w-full max-w-md flex-col items-stretch gap-8">
        <BrandHeader />
        <div>{children}</div>
        <p className="text-center text-xs text-slate-400">
          © {year} ITES — Núcleo de Práticas Jurídicas
        </p>
      </div>
    </div>
  );
}
