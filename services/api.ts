import { API_URL } from './config';
import { tokenStorage } from './storage';

export type ApiResponse<T> = {
  success: boolean;
  data: T | null;
  error: string | null;
};

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  auth?: boolean;
  signal?: AbortSignal;
};

type UnauthorizedHandler = () => void;
let onUnauthorized: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  onUnauthorized = handler;
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiResponse<T>> {
  const { method = 'GET', body, auth = true, signal } = options;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (auth) {
    const token = await tokenStorage.get();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const url = path.startsWith('http') ? path : `${API_URL}${path}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (e: any) {
    return {
      success: false,
      data: null,
      error: e?.message || 'Network error',
    };
  }

  let json: ApiResponse<T> | null = null;
  try {
    json = (await res.json()) as ApiResponse<T>;
  } catch {
    if (res.status === 401 && auth) {
      await tokenStorage.clear();
      onUnauthorized?.();
    }
    return {
      success: false,
      data: null,
      error: `HTTP ${res.status}`,
    };
  }

  const isEnvelope =
    json !== null && typeof (json as ApiResponse<T>).success === 'boolean';

  if (res.status === 401 && auth) {
    await tokenStorage.clear();
    onUnauthorized?.();
  }

  if (isEnvelope) {
    if (!res.ok && json && json.success !== false) {
      return {
        success: false,
        data: null,
        error: json.error || `HTTP ${res.status}`,
      };
    }

    return json ?? { success: false, data: null, error: `HTTP ${res.status}` };
  }

  if (res.ok) {
    return {
      success: true,
      data: json as T,
      error: null,
    };
  }

  return {
    success: false,
    data: null,
    error: (json as any)?.error || `HTTP ${res.status}`,
  };
}

export const apiGet = <T>(path: string, auth = true) =>
  request<T>(path, { method: 'GET', auth });
export const apiPost = <T>(path: string, body?: unknown, auth = true) =>
  request<T>(path, { method: 'POST', body, auth });
export const apiPut = <T>(path: string, body?: unknown, auth = true) =>
  request<T>(path, { method: 'PUT', body, auth });
export const apiPatch = <T>(path: string, body?: unknown, auth = true) =>
  request<T>(path, { method: 'PATCH', body, auth });
export const apiDelete = <T>(path: string, auth = true) =>
  request<T>(path, { method: 'DELETE', auth });

export async function unwrap<T>(promise: Promise<ApiResponse<T>>): Promise<T> {
  const res = await promise;
  if (!res.success || res.data === null) {
    throw new Error(res.error || 'Request failed');
  }
  return res.data;
}
