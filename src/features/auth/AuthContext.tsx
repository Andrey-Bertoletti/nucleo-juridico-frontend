"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { clearToken, getStoredToken, storeToken } from "@/services/api";
import * as authService from "@/services/auth";
import type { Role, User } from "@/types/auth";

export interface RegisterResult {
  autoLoggedIn: boolean;
  requiresEmailConfirmation: boolean;
}

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
  ) => Promise<RegisterResult>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasRole: (...roles: Role[]) => boolean;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const bootstrap = useCallback(async () => {
    if (!getStoredToken()) {
      setLoading(false);
      return;
    }
    try {
      const me = await authService.getMe();
      setUser(me);
    } catch {
      clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await authService.login(email, password);
    storeToken(result.access_token);
    setUser(result.user);
  }, []);

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
    ): Promise<RegisterResult> => {
      const result = await authService.register(name, email, password);
      if (result.access_token) {
        storeToken(result.access_token);
        setUser(result.user);
        return { autoLoggedIn: true, requiresEmailConfirmation: false };
      }
      return {
        autoLoggedIn: false,
        requiresEmailConfirmation: result.requires_email_confirmation,
      };
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // logout é best-effort; sempre limpamos no cliente
    }
    clearToken();
    setUser(null);
    router.push("/login");
  }, [router]);

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
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
