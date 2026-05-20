"use client";

import { useEffect, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/features/auth/useAuth";
import { ApiError } from "@/services/api";
import { updateUser } from "@/services/users";
import { ROLE_LABELS } from "@/types/auth";

export default function ProfilePage() {
  const { user, refreshUser, logout } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<
    { type: "success" | "error"; message: string } | null
  >(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  if (!user) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;

    const payload: { name?: string; email?: string } = {};
    if (name !== user.name) payload.name = name;
    if (email !== user.email) payload.email = email;

    if (Object.keys(payload).length === 0) {
      setFeedback({ type: "success", message: "Nada para atualizar." });
      return;
    }

    setSubmitting(true);
    setFeedback(null);
    try {
      await updateUser(user.id, payload);
      await refreshUser();
      setFeedback({ type: "success", message: "Perfil atualizado." });
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.detail
          : "Não foi possível atualizar o perfil.";
      setFeedback({ type: "error", message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Meu perfil</h1>
        <p className="text-sm text-slate-500">
          Atualize seus dados de cadastro. O perfil de acesso só pode ser
          alterado pela coordenação.
        </p>
      </div>

      <Card
        title="Dados pessoais"
        footer={
          <Button
            type="button"
            variant="ghost"
            onClick={() => void logout()}
            className="!text-red-600 hover:!bg-red-50"
          >
            Sair da conta
          </Button>
        }
      >
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Input
            label="Nome"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="E-mail"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Perfil de acesso"
            value={ROLE_LABELS[user.role]}
            disabled
            readOnly
          />
          {feedback && (
            <p
              role="status"
              className={
                feedback.type === "success"
                  ? "rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
                  : "rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
              }
            >
              {feedback.message}
            </p>
          )}
          <div>
            <Button type="submit" isLoading={submitting}>
              Salvar alterações
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
