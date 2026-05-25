"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  clearToken,
  getStoredExpiresAt,
  getStoredRefreshToken,
  getStoredToken,
  storeCredentials,
} from "@/services/api";
import * as authService from "@/services/auth";
import type { Role, User } from "@/types/auth";

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasRole: (...roles: Role[]) => boolean;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

/** Renova o access_token 60 s antes do vencimento (mínimo 5 s). */
const REFRESH_LEEWAY_MS = 60_000;
const MIN_REFRESH_DELAY_MS = 5_000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelScheduledRefresh = useCallback(() => {
    if (refreshTimerRef.current !== null) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  // Definição mútua: scheduleRefresh chama runRefresh; runRefresh chama
  // scheduleRefresh ao final. Resolvemos com useRef compartilhado.
  const runRefreshRef = useRef<() => Promise<void>>(async () => {});

  const scheduleRefresh = useCallback(() => {
    cancelScheduledRefresh();
    const expiresAt = getStoredExpiresAt();
    if (!expiresAt) return;
    const delay = Math.max(
      MIN_REFRESH_DELAY_MS,
      expiresAt - Date.now() - REFRESH_LEEWAY_MS,
    );
    refreshTimerRef.current = setTimeout(() => {
      void runRefreshRef.current();
    }, delay);
  }, [cancelScheduledRefresh]);

  const runRefresh = useCallback(async () => {
    const rt = getStoredRefreshToken();
    if (!rt) return;
    try {
      const next = await authService.refresh(rt);
      storeCredentials({
        accessToken: next.access_token,
        refreshToken: next.refresh_token,
        expiresIn: next.expires_in,
      });
      scheduleRefresh();
    } catch {
      // Refresh falhou — sessão acabou. Limpa silenciosamente; o próximo
      // request HTTP receberá 401 e redirecionará via interceptor/UI.
      clearToken();
      setUser(null);
      cancelScheduledRefresh();
    }
  }, [scheduleRefresh, cancelScheduledRefresh]);

  // Mantém o ref atualizado a cada render (callback estável dentro do timer).
  runRefreshRef.current = runRefresh;

  const bootstrap = useCallback(async () => {
    if (!getStoredToken()) {
      setLoading(false);
      return;
    }
    try {
      const me = await authService.getMe();
      setUser(me);
      scheduleRefresh();
    } catch {
      // Token inválido/expirado — limpa e força login
      clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [scheduleRefresh]);

  useEffect(() => {
    void bootstrap();
    return () => cancelScheduledRefresh();
  }, [bootstrap, cancelScheduledRefresh]);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await authService.login(email, password);
      storeCredentials({
        accessToken: result.access_token,
        refreshToken: result.refresh_token,
        expiresIn: result.expires_in,
      });
      setUser(result.user);
      scheduleRefresh();
    },
    [scheduleRefresh],
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // logout é best-effort; sempre limpamos no cliente
    }
    cancelScheduledRefresh();
    clearToken();
    setUser(null);
    router.push("/login");
  }, [router, cancelScheduledRefresh]);

  const refreshUser = useCallback(async () => {
    const me = await authService.getMe();
    setUser(me);
  }, []);

  const hasRole = useCallback(
    (...roles: Role[]) => (user ? roles.includes(user.role) : false),
    [user],
  );

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, refreshUser, hasRole }}
    >
      {children}
    </AuthContext.Provider>
  );
}
