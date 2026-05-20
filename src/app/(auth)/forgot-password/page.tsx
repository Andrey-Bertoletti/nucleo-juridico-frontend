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
    <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
      <h2 className="text-center text-base font-semibold text-slate-900">
        Recuperar senha
      </h2>
      <p className="mt-1 text-center text-xs text-slate-500">
        Informe o e-mail cadastrado e enviaremos instruções para redefinir a
        senha.
      </p>

      {submitted ? (
        <div className="mt-5 flex flex-col gap-4">
          <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            Se houver uma conta vinculada a <strong>{email}</strong>, você
            receberá um e-mail com as próximas instruções.
          </p>
          <Link href="/login">
            <Button variant="secondary" className="w-full">
              Voltar ao login
            </Button>
          </Link>
        </div>
      ) : (
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
          <Button type="submit" className="w-full">
            Enviar instruções
          </Button>
          <Link
            href="/login"
            className="text-center text-sm font-medium text-blue-600 hover:underline"
          >
            Voltar ao login
          </Link>
        </form>
      )}
    </div>
  );
}
