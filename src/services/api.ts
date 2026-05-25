/**
 * Cliente HTTP central — envolve `fetch` adicionando o token de autenticação,
 * tratando erros, parseando JSON e renovando o access_token automaticamente
 * em respostas 401 quando há refresh_token disponível.
 */

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const TOKEN_KEY = "nucleo-juridico:access-token";
const REFRESH_KEY = "nucleo-juridico:refresh-token";
const EXPIRES_AT_KEY = "nucleo-juridico:expires-at";

// ---------------------------------------------------------------------------
// Storage de credenciais
// ---------------------------------------------------------------------------
export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getStoredRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFRESH_KEY);
}

export function getStoredExpiresAt(): number | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(EXPIRES_AT_KEY);
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export interface StoreCredentialsInput {
  accessToken: string;
  refreshToken?: string | null;
  /** Tempo de vida (segundos) do access_token; usado para agendar refresh. */
  expiresIn?: number | null;
}

export function storeCredentials({
  accessToken,
  refreshToken,
  expiresIn,
}: StoreCredentialsInput): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, accessToken);
  if (refreshToken) {
    window.localStorage.setItem(REFRESH_KEY, refreshToken);
  }
  if (expiresIn && Number.isFinite(expiresIn) && expiresIn > 0) {
    const expiresAt = Date.now() + expiresIn * 1000;
    window.localStorage.setItem(EXPIRES_AT_KEY, String(expiresAt));
  }
}

/** @deprecated use {@link storeCredentials} */
export function storeToken(token: string): void {
  storeCredentials({ accessToken: token });
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
  window.localStorage.removeItem(EXPIRES_AT_KEY);
}

// ---------------------------------------------------------------------------
// Erro tipado
// ---------------------------------------------------------------------------
export class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.status = status;
    this.detail = detail;
  }
}

interface ApiOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** Quando true, não tenta renovar o token em 401 (evita laço no /auth/refresh). */
  skipAuthRefresh?: boolean;
}

// ---------------------------------------------------------------------------
// Refresh coalescing — evita múltiplos refreshes simultâneos
// ---------------------------------------------------------------------------
let inflightRefresh: Promise<boolean> | null = null;

async function tryRefreshAccessToken(): Promise<boolean> {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) return false;
  if (inflightRefresh) return inflightRefresh;

  inflightRefresh = (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      if (!res.ok) {
        clearToken();
        return false;
      }
      const data = (await res.json()) as {
        access_token: string;
        refresh_token: string;
        expires_in: number;
      };
      storeCredentials({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
      });
      return true;
    } catch {
      // Erro de rede — não limpa o token; deixa o caller decidir.
      return false;
    } finally {
      inflightRefresh = null;
    }
  })();

  return inflightRefresh;
}

async function readDetail(res: Response): Promise<string> {
  let detail = res.statusText;
  try {
    const data = await res.json();
    detail = (data && typeof data === "object" && "detail" in data
      ? String((data as { detail: unknown }).detail)
      : undefined) || detail;
  } catch {
    // resposta sem corpo JSON
  }
  return detail;
}

// ---------------------------------------------------------------------------
// JSON helper
// ---------------------------------------------------------------------------
export async function apiFetch<T = unknown>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const { body, headers, skipAuthRefresh, ...rest } = options;
  const token = getStoredToken();

  const buildHeaders = () => ({
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(getStoredToken()
      ? { Authorization: `Bearer ${getStoredToken()}` }
      : {}),
    ...(headers || {}),
  });

  const doFetch = () =>
    fetch(`${API_BASE}${path}`, {
      ...rest,
      headers: buildHeaders(),
      body: body === undefined ? undefined : JSON.stringify(body),
    });

  let res = await doFetch();

  if (
    res.status === 401 &&
    !skipAuthRefresh &&
    token &&
    getStoredRefreshToken()
  ) {
    const ok = await tryRefreshAccessToken();
    if (ok) {
      res = await doFetch();
    }
  }

  if (!res.ok) {
    throw new ApiError(res.status, await readDetail(res));
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// ---------------------------------------------------------------------------
// Upload (multipart) — mesmo padrão de retry em 401
// ---------------------------------------------------------------------------
export async function apiUpload<T = unknown>(
  path: string,
  formData: FormData,
  method: "POST" | "PUT" | "PATCH" = "POST",
): Promise<T> {
  const buildHeaders = (): HeadersInit => ({
    Accept: "application/json",
    ...(getStoredToken()
      ? { Authorization: `Bearer ${getStoredToken()}` }
      : {}),
  });

  const doFetch = () =>
    fetch(`${API_BASE}${path}`, {
      method,
      headers: buildHeaders(),
      body: formData,
    });

  let res = await doFetch();

  if (res.status === 401 && getStoredRefreshToken()) {
    const ok = await tryRefreshAccessToken();
    if (ok) {
      res = await doFetch();
    }
  }

  if (!res.ok) {
    throw new ApiError(res.status, await readDetail(res));
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
