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
    <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
      <h2 className="text-center text-base font-semibold text-slate-900">
        Entrar no Sistema
      </h2>
      <p className="mt-1 text-center text-xs text-slate-500">
        Sistema interno do Núcleo de Práticas Jurídicas.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-5 flex flex-col gap-4"
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
          className="!bg-slate-50 !border-slate-200"
        />
        <Input
          label="Senha"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="!bg-slate-50 !border-slate-200"
        />

        {error && (
          <p
            role="alert"
            className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <Link
          href="/forgot-password"
          className="-mt-1 text-sm font-medium text-blue-600 hover:underline"
        >
          Esqueci minha senha
        </Link>

        <Button type="submit" isLoading={submitting} className="w-full">
          Entrar
        </Button>

        <p className="mt-2 text-center text-xs text-slate-500">
          O cadastro de novos usuários é feito pela coordenação do NPJ.
          Se você ainda não tem acesso, procure a coordenação.
        </p>
      </form>
    </div>
  );
}
