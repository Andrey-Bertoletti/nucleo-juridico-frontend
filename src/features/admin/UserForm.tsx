"use client";

import { useEffect, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ROLE_LABELS, type Role } from "@/types/auth";

export interface UserFormValues {
  name: string;
  email: string;
  password?: string;
  role: Role;
}

interface UserFormProps {
  mode: "create" | "edit";
  defaultValues?: Partial<UserFormValues>;
  onSubmit: (values: UserFormValues) => Promise<void>;
  onCancel?: () => void;
  serverError?: string | null;
  successMessage?: string | null;
}

const ROLE_OPTIONS: Role[] = [
  "aluno_estagiario",
  "professor_orientador",
  "admin_coordenacao",
];

export function UserForm({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
  serverError,
  successMessage,
}: UserFormProps) {
  const [name, setName] = useState(defaultValues?.name ?? "");
  const [email, setEmail] = useState(defaultValues?.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>(
    (defaultValues?.role as Role) ?? "aluno_estagiario",
  );
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (defaultValues) {
      setName(defaultValues.name ?? "");
      setEmail(defaultValues.email ?? "");
      if (defaultValues.role) setRole(defaultValues.role as Role);
    }
  }, [defaultValues]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);

    if (!name.trim()) {
      setLocalError("Informe o nome do usuário.");
      return;
    }
    if (!email.trim()) {
      setLocalError("Informe o e-mail.");
      return;
    }
    if (mode === "create" && password.length < 8) {
      setLocalError("A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        email: email.trim(),
        password: mode === "create" ? password : undefined,
        role,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Input
          label="Nome completo *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          required
        />
        <Input
          label="E-mail *"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        {mode === "create" && (
          <Input
            label="Senha provisória *"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            hint="Mínimo de 8 caracteres. O usuário poderá trocar depois."
            autoComplete="new-password"
            required
          />
        )}
        <Select
          label="Perfil *"
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
        >
          {ROLE_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </Select>

        {localError && (
          <p
            role="alert"
            className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {localError}
          </p>
        )}
        {serverError && (
          <p
            role="alert"
            className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {serverError}
          </p>
        )}
        {successMessage && (
          <p
            role="status"
            className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
          >
            {successMessage}
          </p>
        )}

        <div className="flex items-center justify-end gap-3">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={submitting}
            >
              Cancelar
            </Button>
          )}
          <Button type="submit" isLoading={submitting}>
            {mode === "create" ? "Cadastrar usuário" : "Salvar alterações"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
