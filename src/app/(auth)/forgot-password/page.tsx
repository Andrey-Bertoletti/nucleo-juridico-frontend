"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

/**
 * Recuperação de senha — UI inicial. O endpoint correspondente ainda não foi
 * implementado no backend; quando estiver pronto, basta chamar
 * `POST /auth/forgot-password` aqui.
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="glass rounded-2xl px-7 py-8 shadow-apple-md">
      <h2 className="text-center text-[17px] font-semibold tracking-[-0.01em] text-ink">
        Recuperar senha
      </h2>
      <p className="mt-1 text-center text-[12px] text-ink-muted">
        Informe o e-mail cadastrado e enviaremos instruções para redefinir a senha.
      </p>

      {submitted ? (
        <div className="mt-6 flex flex-col gap-4 animate-fade-in-up">
          <div className="rounded-xl border border-accent-emerald/25 bg-accent-emerald/10 px-3.5 py-2.5 text-[13px] text-accent-emerald">
            Se houver uma conta vinculada a <strong>{email}</strong>, você
            receberá um e-mail com as próximas instruções.
          </div>
          <Link href="/login">
            <Button variant="secondary" size="lg" className="w-full">
              Voltar ao login
            </Button>
          </Link>
        </div>
      ) : (
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
          <Button type="submit" variant="primary" size="lg" className="w-full">
            Enviar instruções
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
