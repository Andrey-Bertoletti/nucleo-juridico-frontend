"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/features/auth/useAuth";
import { cn } from "@/lib/utils";
import { ApiError } from "@/services/api";

type Mode = "login" | "register";

export default function LoginPage() {
  const router = useRouter();
  const { login, register } = useAuth();

  const [mode, setMode] = useState<Mode>("login");

  // Estado dos formulários — independente para preservar dados ao alternar.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setSuccess(null);
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
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

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== passwordConfirm) {
      setError("As senhas não conferem.");
      return;
    }
    if (password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await register(name, email, password);
      if (result.autoLoggedIn) {
        router.replace("/dashboard");
        return;
      }
      setSuccess(
        result.requiresEmailConfirmation
          ? "Cadastro realizado! Verifique seu e-mail para confirmar sua conta antes de entrar."
          : "Cadastro realizado! Faça login para continuar.",
      );
      setPassword("");
      setPasswordConfirm("");
      switchMode("login");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.detail
          : "Não foi possível concluir o cadastro.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
      <ModeTabs mode={mode} onChange={switchMode} />

      <h2 className="mt-5 text-center text-base font-semibold text-slate-900">
        {mode === "login" ? "Entrar no Sistema" : "Criar uma conta"}
      </h2>

      {success && (
        <p
          role="status"
          className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
        >
          {success}
        </p>
      )}

      {mode === "login" ? (
        <form
          onSubmit={handleLogin}
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

          {error && <ErrorBanner message={error} />}

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
            Para acessar o sistema, utilize suas credenciais fornecidas pela
            coordenação do NPJ.
          </p>
        </form>
      ) : (
        <form
          onSubmit={handleRegister}
          className="mt-5 flex flex-col gap-4"
          noValidate
        >
          <Input
            label="Nome completo"
            name="name"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="!bg-slate-50 !border-slate-200"
          />
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
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            hint="Mínimo de 8 caracteres."
            className="!bg-slate-50 !border-slate-200"
          />
          <Input
            label="Confirmar senha"
            name="passwordConfirm"
            type="password"
            autoComplete="new-password"
            required
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            className="!bg-slate-50 !border-slate-200"
          />

          {error && <ErrorBanner message={error} />}

          <Button type="submit" isLoading={submitting} className="w-full">
            Cadastrar
          </Button>

          <p className="mt-2 text-center text-xs text-slate-500">
            Após o cadastro, seu acesso será criado como{" "}
            <strong>aluno/estagiário</strong>. A coordenação pode ajustar o
            perfil quando necessário.
          </p>
        </form>
      )}
    </div>
  );
}

function ModeTabs({
  mode,
  onChange,
}: {
  mode: Mode;
  onChange: (next: Mode) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Entrar ou cadastrar"
      className="flex gap-1 rounded-lg bg-slate-100 p-1"
    >
      <TabButton
        active={mode === "login"}
        onClick={() => onChange("login")}
        controls="login-form"
      >
        Entrar
      </TabButton>
      <TabButton
        active={mode === "register"}
        onClick={() => onChange("register")}
        controls="register-form"
      >
        Cadastrar
      </TabButton>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  controls,
  children,
}: {
  active: boolean;
  onClick: () => void;
  controls: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      aria-controls={controls}
      onClick={onClick}
      className={cn(
        "flex-1 rounded-md py-2 text-sm font-medium transition-colors",
        active
          ? "bg-white text-slate-900 shadow-sm"
          : "text-slate-500 hover:text-slate-700",
      )}
    >
      {children}
    </button>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
    >
      {message}
    </p>
  );
}
