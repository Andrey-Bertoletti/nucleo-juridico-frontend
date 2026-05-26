"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/features/auth/useAuth";
import { supabase } from "@/lib/supabase";
import { ApiError } from "@/services/api";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loginWithTokens } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  /** OAuth pode levar ~1s entre o redirect e o /auth/me — exibe spinner. */
  const [exchangingOAuth, setExchangingOAuth] = useState(false);

  // Trata o retorno do OAuth: Supabase devolve para /login?code=...
  // O cliente Supabase (detectSessionInUrl: true) faz o exchange sozinho;
  // aqui só esperamos a sessão materializar, pegamos os tokens e completamos
  // o login no backend chamando /auth/me com o access_token do Google.
  useEffect(() => {
    const hasCode = searchParams.get("code") !== null;
    // Erro vindo do provedor (usuário cancelou no Google, escopo recusado...)
    const oauthError = searchParams.get("error_description") || searchParams.get("error");
    if (oauthError) {
      setError(decodeURIComponent(oauthError));
      // Limpa o ?error= da URL para não re-disparar este effect em rerenders.
      router.replace("/login");
      return;
    }

    if (!hasCode) return;

    setExchangingOAuth(true);
    let active = true;

    /** Finaliza o fluxo OAuth — desliga spinner SEM esperar o signOut e
     * limpa o ?code= da URL para evitar reentrada do effect. */
    const finishWithError = (message: string) => {
      if (!active) return;
      setError(message);
      setExchangingOAuth(false);
      // signOut em background — não bloqueia a UI; falha de rede aqui
      // não pode segurar o spinner ligado.
      void supabase.auth.signOut().catch(() => {});
      router.replace("/login");
    };

    const handleSession = async (session: {
      access_token: string;
      refresh_token: string;
      expires_in: number;
    }) => {
      try {
        await loginWithTokens({
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
          expiresIn: session.expires_in,
        });
        if (!active) return;
        router.replace("/dashboard");
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          // Backend já apagou o auth.users criado pelo Supabase OAuth.
          finishWithError(
            "Você ainda não foi cadastrado no sistema. " +
              "Entre em contato com a coordenação do NPJ para solicitar acesso.",
          );
        } else {
          finishWithError(
            err instanceof ApiError
              ? err.detail
              : "Não foi possível concluir o login com Google.",
          );
        }
      }
    };

    // Caminho A: o exchange já completou antes deste effect montar
    // (acontece com frequência — `detectSessionInUrl: true` é síncrono em
    // muitas versões do supabase-js). Nesse caso, getSession() já tem a sessão.
    let handled = false;
    void supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (!active || handled || !session) return;
        handled = true;
        void handleSession(session);
      })
      .catch(() => {
        // Ignora — o caminho B (onAuthStateChange) ainda pode resolver.
      });

    // Caminho B: o exchange ainda está em andamento; ouvimos SIGNED_IN.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active || handled || !session) return;
      if (event === "SIGNED_IN") {
        handled = true;
        void handleSession(session);
      }
    });

    // Salvaguarda: se nada resolver em 10 s, libera a UI com mensagem.
    const timeout = setTimeout(() => {
      if (!active || handled) return;
      handled = true;
      finishWithError(
        "O login com Google demorou demais. Recarregue a página e tente novamente.",
      );
    }, 10_000);

    return () => {
      active = false;
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [searchParams, loginWithTokens, router]);

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

  async function handleGoogleLogin() {
    setError(null);
    setGoogleLoading(true);
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/login`,
          queryParams: {
            // Força a tela de seleção de conta — evita "logar como o usuário
            // errado" silenciosamente quando o navegador já tem uma sessão Google.
            prompt: "select_account",
          },
        },
      });
      if (oauthError) {
        setError(oauthError.message);
        setGoogleLoading(false);
      }
      // Em caso de sucesso, signInWithOAuth redireciona — não voltamos aqui.
    } catch {
      setError("Não foi possível iniciar o login com Google.");
      setGoogleLoading(false);
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

      {exchangingOAuth ? (
        <div className="mt-8 flex flex-col items-center gap-3">
          <span
            aria-hidden
            className="h-5 w-5 animate-spin rounded-full border-2 border-brand/30 border-t-brand"
          />
          <p className="text-[13px] text-ink-muted">Concluindo login com Google...</p>
        </div>
      ) : (
        <>
          <div className="mt-6 flex flex-col gap-3">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              isLoading={googleLoading}
              onClick={handleGoogleLogin}
              className="w-full"
            >
              <span className="inline-flex items-center justify-center gap-2">
                <GoogleIcon />
                Entrar com Google
              </span>
            </Button>

            <div className="my-1 flex items-center gap-3 text-[11px] uppercase tracking-wide text-ink-subtle">
              <span className="h-px flex-1 bg-ink-subtle/20" />
              <span>ou</span>
              <span className="h-px flex-1 bg-ink-subtle/20" />
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-2 flex flex-col gap-4"
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
        </>
      )}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.71H.957v2.332A8.997 8.997 0 0 0 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.708A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.708V4.96H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.04l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.96L3.964 7.29C4.672 5.164 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}
