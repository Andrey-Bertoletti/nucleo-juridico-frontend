"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { LoadingState } from "@/components/feedback/LoadingState";
import { useAuth } from "@/features/auth/useAuth";

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tokenHash = searchParams.get("token_hash");
    const type = searchParams.get("type");
    if (tokenHash && (type === "recovery" || type === "invite")) {
      const target = new URL("/reset-password", window.location.origin);
      target.searchParams.set("token_hash", tokenHash);
      target.searchParams.set("type", type);
      router.replace(target.pathname + target.search);
      return;
    }

    if (loading) return;
    router.replace(user ? "/dashboard" : "/login");
  }, [loading, user, router]);

  return <LoadingState message="Redirecionando..." />;
}
