"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase compartilhado entre o login (OAuth com Google) e o
 * reset-password (PKCE flow). Mantemos um único cliente para que o
 * armazenamento de sessão fique consistente — duas instâncias com
 * `persistSession: true` brigam pelo mesmo storage key.
 *
 * Importante: este cliente NÃO substitui o backend para o fluxo de login
 * com e-mail/senha — esse continua via `apiFetch("/auth/login")`. Aqui
 * lidamos somente com OAuth (Google) e troca de código nos links de
 * recovery/invite enviados por e-mail.
 */
export const supabase: SupabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      flowType: "pkce",
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true,
    },
  },
);
