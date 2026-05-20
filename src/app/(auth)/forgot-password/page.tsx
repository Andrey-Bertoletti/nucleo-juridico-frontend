"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
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
    <Card
      title="Recuperar senha"
      description="Informe o e-mail cadastrado e enviaremos instruções para redefinir a senha."
    >
      {submitted ? (
        <div className="flex flex-col gap-4">
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
        <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          <Input
            label="E-mail"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit">Enviar instruções</Button>
          <div className="text-center">
            <Link
              href="/login"
              className="text-sm text-slate-600 underline-offset-4 hover:underline"
            >
              Voltar ao login
            </Link>
          </div>
        </form>
      )}
    </Card>
  );
}
