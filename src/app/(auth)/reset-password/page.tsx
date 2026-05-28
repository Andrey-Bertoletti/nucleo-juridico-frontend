"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import type { EmailOtpType } from "@supabase/supabase-js";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { supabase } from "@/lib/supabase";

type UrlAuthInfo = {
  error: string | null;
  errorCode: string | null;
  errorDescription: string | null;
  hasCode: boolean;
};

/** Lê erros e parâmetros que o Supabase devolve no hash (#...) ou na query (?...). */
function readUrlAuthInfo(): UrlAuthInfo {
  if (typeof window === "undefined") {
    return { error: null, errorCode: null, errorDescription: null, hasCode: false };
  }
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const query = new URLSearchParams(window.location.search);
  const pick = (key: string) => hash.get(key) ?? query.get(key);
  return {
    error: pick("error"),
    errorCode: pick("error_code"),
    errorDescription: pick("error_description"),
    hasCode: query.get("code") !== null,
  };
}

/** Heurística: erros com `error_code=otp_expired` ou `error_code` começando
 * com "token_" vêm do fluxo de recovery (link expirado). Tudo o mais (incluindo
 * `access_denied`, `server_error`, `signup_disabled`, ou sem `error_code`)
 * indica callback OAuth que caiu aqui por engano — devolver pro /login. */
function looksLikeRecoveryError(errorCode: string | null): boolean {
  if (!errorCode) return false;
  return errorCode === "otp_expired" || errorCode.startsWith("token_");
}

type ResetEmailType = Extract<EmailOtpType, "recovery" | "invite">;

function readEmailToken():
  | { tokenHash: string; type: ResetEmailType }
  | null {
  if (typeof window === "undefined") return null;
  const query = new URLSearchParams(window.location.search);
  const tokenHash = query.get("token_hash");
  const type = query.get("type");
  if (!tokenHash || (type !== "recovery" && type !== "invite")) {
    return null;
  }
  return { tokenHash, type };
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    let cancelled = false;

    /** Sessão vinda do Google (provider != "email") significa que o callback
     * do OAuth caiu aqui em vez de `/login` — Supabase Dashboard com Site URL
     * apontando pra `/reset-password` ou allowlist sem `/login`. Devolvemos
     * o usuário pro `/login`, que sabe completar o fluxo OAuth (chamar
     * `/auth/me` e mostrar mensagem se não estiver cadastrado). */
    const isOAuthSession = (session: { user?: { app_metadata?: { provider?: string } } } | null) => {
      const provider = session?.user?.app_metadata?.provider;
      return Boolean(provider && provider !== "email");
    };

    // 1. Erro explícito na URL. Pode ser:
    //    (a) recovery link expirado (`error_code=otp_expired`) → mostra
    //        "Solicite um novo link" direto.
    //    (b) erro de OAuth (Google) que caiu aqui porque o Supabase Dashboard
    //        tem o Site URL apontando pra /reset-password — nesse caso o
    //        usuário ia clicar "Solicitar novo link" sem entender o problema.
    //        Devolvemos pra /login carregando o `error_description` para a
    //        tela de login mostrar a mensagem correta.
    const urlInfo = readUrlAuthInfo();
    if (urlInfo.error || urlInfo.errorDescription) {
      // Log para diagnóstico (Supabase Dashboard config errada).
      console.warn("[reset-password] erro na URL:", urlInfo);
      if (looksLikeRecoveryError(urlInfo.errorCode)) {
        setExpired(true);
        return;
      }
      // OAuth ou erro genérico — manda pro /login preservando o erro.
      const target = new URL("/login", window.location.origin);
      if (urlInfo.error) target.searchParams.set("error", urlInfo.error);
      if (urlInfo.errorDescription)
        target.searchParams.set("error_description", urlInfo.errorDescription);
      router.replace(target.pathname + target.search);
      return;
    }

    // 2. Fluxo recomendado para e-mails disparados pelo backend: o template
    //    envia token_hash + type direto para esta página, e o navegador valida
    //    com verifyOtp. Isso evita depender de um code_verifier PKCE que só
    //    existiria se o reset tivesse sido iniciado no próprio frontend.
    const emailToken = readEmailToken();
    if (emailToken) {
      void supabase.auth
        .verifyOtp({
          token_hash: emailToken.tokenHash,
          type: emailToken.type,
        })
        .then(({ error: verifyError }) => {
          if (cancelled) return;
          if (verifyError) {
            console.warn("Token de e-mail recusado pelo Supabase.", verifyError);
            setExpired(true);
            return;
          }
          setReady(true);
          setExpired(false);
          window.history.replaceState(null, "", "/reset-password");
        })
        .catch((err) => {
          if (cancelled) return;
          console.warn("Erro ao validar token de e-mail.", err);
          setExpired(true);
        });
      return () => {
        cancelled = true;
      };
    }

    // 3. PKCE flow legado: o Supabase entrega `?code=...` no querystring. Como o
    //    cliente foi criado com `detectSessionInUrl: true`, ele já faz o
    //    `exchangeCodeForSession` sozinho assim que carrega. Aqui só precisamos
    //    esperar a sessão aparecer.
    //    Implicit flow (legado): o token vem em `#access_token=...` e o
    //    Supabase dispara `onAuthStateChange("PASSWORD_RECOVERY")`.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (event === "SIGNED_IN" && isOAuthSession(session)) {
        // Não é recovery — é um login Google que caiu aqui por engano.
        router.replace("/login");
        return;
      }
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

    // 4. Checagem direta: se já existe sessão (ex.: usuário recarregou a
    //    página depois do exchange), marca pronto — mas se for OAuth, manda
    //    pro /login.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      if (!session) return;
      if (isOAuthSession(session)) {
        router.replace("/login");
        return;
      }
      setReady(true);
    });

    // 4. Timeout de fallback: 8s costuma bastar para o exchange terminar
    //    mesmo em redes ruins. Se nada resolveu, decidimos pelo conteúdo da
    //    URL: havia `?code=` mas nunca virou sessão → provavelmente é um
    //    callback OAuth que caiu aqui por engano (e perdeu o code_verifier).
    //    Mandar pro /login dá ao usuário a chance de tentar de novo, em vez
    //    de mostrar "link expirado" enganoso.
    const timeout = setTimeout(() => {
      if (cancelled) return;
      setReady((current) => {
        if (current) return current;
        if (urlInfo.hasCode) {
          console.warn(
            "[reset-password] timeout sem SIGNED_IN com ?code= na URL — " +
              "callback OAuth provável caindo aqui em vez de /login. " +
              "Verifique Supabase Dashboard → Authentication → URL Configuration.",
          );
          router.replace("/login");
        } else {
          setExpired(true);
        }
        return current;
      });
    }, 8000);

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router]);

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
        console.warn("Falha ao atualizar senha no Supabase.", updateError);
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
    } catch (err) {
      console.warn("Erro inesperado no fluxo de redefinição de senha.", err);
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
