"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { supabase } from "@/lib/supabase";

/** Lê erros que o Supabase devolve no hash (#error=...) ou na query (?error=...). */
function readUrlError(): string | null {
  if (typeof window === "undefined") return null;
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const query = new URLSearchParams(window.location.search);
  return (
    hash.get("error_description") ||
    hash.get("error") ||
    query.get("error_description") ||
    query.get("error")
  );
}

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // 1. Erro explícito na URL (link expirado, otp_expired etc.) → mostra
    //    direto a tela "solicite novo link", sem esperar timeout.
    const urlError = readUrlError();
    if (urlError) {
      setExpired(true);
      return;
    }

    // 2. PKCE flow: o Supabase entrega `?code=...` no querystring. Como o
    //    cliente foi criado com `detectSessionInUrl: true`, ele já faz o
    //    `exchangeCodeForSession` sozinho assim que carrega. Aqui só precisamos
    //    esperar a sessão aparecer.
    //    Implicit flow (legado): o token vem em `#access_token=...` e o
    //    Supabase dispara `onAuthStateChange("PASSWORD_RECOVERY")`.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setReady(true);
        setExpired(false);
        return;
      }
      // Se a troca do code por sessão falhar, o supabase-js emite SIGNED_OUT
      // ou simplesmente não emite nada — o timeout abaixo cobre esse caso.
      if (event === "SIGNED_OUT" && !session) {
        // Não marca expired imediatamente: pode ser apenas o estado inicial.
      }
    });

    // 3. Checagem direta: se já existe sessão (ex.: usuário recarregou a
    //    página depois do exchange), marca pronto.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      if (session) {
        setReady(true);
      }
    });

    // 4. Timeout de fallback: 8s costuma bastar para o exchange terminar
    //    mesmo em redes ruins. Se ainda não estiver pronto, assume expirado.
    const timeout = setTimeout(() => {
      if (cancelled) return;
      setReady((current) => {
        if (!current) setExpired(true);
        return current;
      });
    }, 8000);

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("A senha deve ter no mínimo 8 caracteres.");
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
        // Mensagens comuns: "Auth session missing" quando o link já foi usado
        // ou expirou no meio do fluxo.
        if (/session/i.test(updateError.message)) {
          setExpired(true);
          setReady(false);
        } else {
          setError(updateError.message);
        }
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
            placeholder="Mínimo de 8 caracteres"
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
