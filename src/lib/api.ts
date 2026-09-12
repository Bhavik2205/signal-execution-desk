import axios, { AxiosError, AxiosInstance } from "axios";
import type { ApiErrorBody, SuccessResponse } from "./api-types";

/**
 * Base URL for the Go API.
 *
 * In development this stays empty so requests go to /api/v1/... on the Vite
 * dev server, which proxies them to the backend (see vite.config.ts). That
 * keeps the browser same-origin and avoids needing CORS on the Go side.
 * Set VITE_API_BASE_URL for builds served from a different origin.
 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

const TOKEN_KEY = "mlbot.access_token";

/** Reads the stored bearer token. */
export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    // Private browsing and some embedded webviews throw on storage access.
    return null;
  }
}

export function setToken(token: string | null): void {
  try {
    if (token === null) localStorage.removeItem(TOKEN_KEY);
    else localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* storage unavailable; the session simply will not persist a reload */
  }
}

export const http: AxiosInstance = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** A normalised error carrying the backend's code so the UI can branch on it. */
export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: unknown;

  constructor(message: string, code: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }

  /** True when the endpoint exists but the feature is switched off. */
  get isDisabled(): boolean {
    return this.status === 503 || this.code === "SERVICE_UNAVAILABLE";
  }

  get isUnauthorized(): boolean {
    return this.status === 401 || this.status === 403;
  }
}

function toApiError(err: unknown): ApiError {
  const ax = err as AxiosError<ApiErrorBody>;

  if (ax?.response) {
    const body = ax.response.data;
    return new ApiError(
      body?.error?.message ?? ax.message ?? "Request failed",
      body?.error?.code ?? "HTTP_ERROR",
      ax.response.status,
      body?.error?.details,
    );
  }
  if (ax?.request) {
    return new ApiError(
      "Cannot reach the API. Is the Go server running on :8080?",
      "NETWORK_ERROR",
      0,
    );
  }
  return new ApiError((err as Error)?.message ?? "Unknown error", "UNKNOWN", 0);
}

/** GET a resource and unwrap the success envelope. */
export async function apiGet<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  try {
    const res = await http.get<SuccessResponse<T>>(path, { params });
    return res.data.data;
  } catch (err) {
    throw toApiError(err);
  }
}

/** POST to a resource and unwrap the success envelope. */
export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  try {
    const res = await http.post<SuccessResponse<T>>(path, body ?? {});
    return res.data.data;
  } catch (err) {
    throw toApiError(err);
  }
}

// --- Auth -----------------------------------------------------------------

interface LoginResponse {
  accessToken?: string;
  access_token?: string;
  token?: string;
}

/**
 * Logs in and stores the bearer token.
 *
 * The auth handler's exact field name is not pinned down here, so all three
 * common spellings are accepted rather than failing silently on a mismatch.
 */
export async function login(email: string, password: string): Promise<void> {
  const data = await apiPost<LoginResponse>("/auth/login", { email, password });
  const token = data.accessToken ?? data.access_token ?? data.token;
  if (!token) {
    throw new ApiError("Login succeeded but no access token was returned", "NO_TOKEN", 200, data);
  }
  setToken(token);
}

export function logout(): void {
  setToken(null);
}

/**
 * Absolute websocket URL for the market data feed.
 *
 * Derived from the current page so the scheme matches (wss:// on HTTPS) and
 * the dev-server proxy forwards it. Hardcoding ws://localhost:<port> breaks
 * both TLS and any deployment that is not the developer's laptop.
 */
export function websocketURL(path = "/ws"): string {
  if (BASE_URL) {
    return BASE_URL.replace(/^http/, "ws") + path;
  }
  const scheme = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${scheme}//${window.location.host}${path}`;
}

/** PUT a resource and unwrap the success envelope. */
export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  try {
    const res = await http.put<SuccessResponse<T>>(path, body ?? {});
    return res.data.data;
  } catch (err) {
    throw toApiError(err);
  }
}

/** DELETE a resource and unwrap the success envelope. */
export async function apiDelete<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  try {
    const res = await http.delete<SuccessResponse<T>>(path, { params });
    return res.data.data;
  } catch (err) {
    throw toApiError(err);
  }
}

// ---------------------------------------------------------------------------
// Settings
//
// The settings handler predates the {data, meta} envelope and returns
// {section, data} directly, so these two calls bypass apiGet/apiPut rather
// than unwrapping a field that is not there.
// ---------------------------------------------------------------------------

import type { SettingsSection } from "./api-types";

export async function getSettingsSection(section: string): Promise<SettingsSection> {
  try {
    const res = await http.get<SettingsSection>("/settings", { params: { section } });
    return {
      section: res.data?.section ?? section,
      data: res.data?.data ?? {},
    };
  } catch (err) {
    throw toApiError(err);
  }
}

export async function putSettingsSection(
  section: string,
  data: Record<string, unknown>,
): Promise<void> {
  try {
    await http.put("/settings", { section, data });
  } catch (err) {
    throw toApiError(err);
  }
}
