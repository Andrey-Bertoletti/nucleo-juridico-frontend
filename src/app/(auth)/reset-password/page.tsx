"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { createClient } from "@supabase/supabase-js";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
        setExpired(false);
      }
    });

    // Check if there's already a session (user may have arrived with valid tokens)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setReady(true);
      }
    });

    // After a short delay, if still not ready, the link may be expired
    const timeout = setTimeout(() => {
      setReady((current) => {
        if (!current) setExpired(true);
        return current;
      });
    }, 4000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setSubmitting(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Erro inesperado ao redefinir a senha. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="glass rounded-2xl px-7 py-8 shadow-apple-md">
      <h2 className="text-center text-[17px] font-semibold tracking-[-0.01em] text-ink">
        Redefinir senha
      </h2>
      <p className="mt-1 text-center text-[12px] text-ink-muted">
        Escolha uma nova senha para sua conta.
      </p>

      {success ? (
        <div className="mt-6 flex flex-col gap-4 animate-fade-in-up">
          <div className="rounded-xl border border-accent-emerald/25 bg-accent-emerald/10 px-3.5 py-2.5 text-[13px] text-accent-emerald">
            Senha redefinida com sucesso! Você já pode fazer login com a nova
            senha.
          </div>
          <Link href="/login">
            <Button variant="primary" size="lg" className="w-full">
              Ir para o login
            </Button>
          </Link>
        </div>
      ) : expired && !ready ? (
        <div className="mt-6 flex flex-col gap-4 animate-fade-in-up">
          <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700">
            O link de redefinição expirou ou é inválido. Solicite um novo link de
            recuperação de senha.
          </div>
          <Link href="/forgot-password">
            <Button variant="secondary" size="lg" className="w-full">
              Solicitar novo link
            </Button>
          </Link>
          <Link
            href="/login"
            className="text-center text-[13px] font-medium text-brand transition-colors hover:text-brand-hover"
          >
            Voltar ao login
          </Link>
        </div>
      ) : !ready ? (
        <div className="mt-6 flex flex-col items-center gap-3">
          <span
            aria-hidden
            className="h-5 w-5 animate-spin rounded-full border-2 border-brand/30 border-t-brand"
          />
          <p className="text-[13px] text-ink-muted">
            Verificando link de recuperação...
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mt-6 flex flex-col gap-4"
          noValidate
        >
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700 animate-fade-in">
              {error}
            </div>
          )}
          <Input
            label="Nova senha"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            placeholder="Mínimo de 6 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Input
            label="Confirmar nova senha"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            placeholder="Repita a nova senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={submitting}
            className="w-full"
          >
            Redefinir senha
          </Button>
          <Link
            href="/login"
            className="text-center text-[13px] font-medium text-brand transition-colors hover:text-brand-hover"
          >
            Voltar ao login
          </Link>
        </form>
      )}
    </div>
  );
}
