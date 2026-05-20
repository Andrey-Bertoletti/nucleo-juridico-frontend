export type Role =
  | "aluno_estagiario"
  | "professor_orientador"
  | "admin_coordenacao";

export type UserStatus = "ativo" | "inativo" | "bloqueado";

export interface User {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface RegisterResponse {
  user: User;
  access_token: string | null;
  refresh_token: string | null;
  expires_in: number | null;
  requires_email_confirmation: boolean;
}

export const ROLE_LABELS: Record<Role, string> = {
  aluno_estagiario: "Aluno / Estagiário",
  professor_orientador: "Professor / Orientador",
  admin_coordenacao: "Coordenação",
};
