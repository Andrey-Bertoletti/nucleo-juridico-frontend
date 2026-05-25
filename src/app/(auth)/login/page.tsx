"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/features/auth/useAuth";
import { ApiError } from "@/services/api";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      router.replace("/dashboard");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.detail
          : "Não foi possível entrar. Tente novamente.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="glass rounded-2xl px-7 py-8 shadow-apple-md">
      <h2 className="text-center text-[17px] font-semibold tracking-[-0.01em] text-ink">
        Entrar no Sistema
      </h2>
      <p className="mt-1 text-center text-[12px] text-ink-muted">
        Sistema interno do Núcleo de Práticas Jurídicas.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 flex flex-col gap-4"
        noValidate
      >
        <Input
          label="E-mail"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="seu.email@ites.edu.br"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Senha"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <div
            role="alert"
            className="animate-fade-in rounded-xl border border-accent-rose/25 bg-accent-rose/10 px-3.5 py-2.5 text-[13px] text-accent-rose"
          >
            {error}
          </div>
        )}

        <Link
          href="/forgot-password"
          className="-mt-1 text-[13px] font-medium text-brand transition-colors hover:text-brand-hover"
        >
          Esqueci minha senha
        </Link>

        <Button
          type="submit"
          isLoading={submitting}
          variant="primary"
          size="lg"
          className="w-full"
        >
          Entrar
        </Button>

        <p className="mt-1 text-center text-[11px] text-ink-subtle">
          Para acessar o sistema, utilize suas credenciais fornecidas pela
          coordenação do NPJ.
        </p>
      </form>
    </div>
  );
}
