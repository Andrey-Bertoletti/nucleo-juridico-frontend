"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { BrandHeader } from "@/components/branding/BrandHeader";
import { LoadingState } from "@/components/feedback/LoadingState";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
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
      <div className="flex min-h-screen items-center justify-center auth-bg">
        <LoadingState message="Carregando..." />
      </div>
    );
  }

  const year = new Date().getFullYear();

  return (
    <div className="relative min-h-screen auth-bg px-4 py-10">
      {/* Decorative orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-brand/20 blur-3xl animate-float"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-accent-indigo/20 blur-3xl animate-float"
        style={{ animationDelay: "1.5s" }}
      />

      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="relative mx-auto flex w-full max-w-md flex-col items-stretch gap-7">
        <BrandHeader />
        <div className="animate-fade-in-up">{children}</div>
        <p className="text-center text-[11px] text-ink-subtle animate-fade-in">
          © {year} ITES — Núcleo de Práticas Jurídicas
        </p>
      </div>
    </div>
  );
}
