import { api, ApiClient } from './api';
import { supabase } from './supabaseClient';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message || `API Request failed with status ${status}`);
    this.name = 'ApiError';
    this.status = status;
  }
}

const getBaseUrl = (): string => {
  const gProcess = (globalThis as any).process;
  const envUrl = (
    (typeof import.meta !== 'undefined' && import.meta.env && ((import.meta.env as any).NEXT_PUBLIC_BACKEND_API_URL || import.meta.env.VITE_BACKEND_API_URL)) ||
    (gProcess && gProcess.env && (gProcess.env.NEXT_PUBLIC_BACKEND_API_URL || gProcess.env.VITE_BACKEND_API_URL || gProcess.env.BACKEND_API_URL)) ||
    'https://api.orchestree.biz.id/api/v1'
  ).trim();
  const cleaned = envUrl.replace(/\/+$/, '');
  return cleaned.endsWith('/api/v1') ? cleaned : `${cleaned}/api/v1`;
};

/**
 * Centralized API Client according to Phase 121/139 architecture specification.
 * Enforces unified NEXT_PUBLIC_BACKEND_API_URL and standard authentication headers.
 */
export const apiClient = {
  baseUrl: getBaseUrl(),

  async getSessionToken(): Promise<string | null> {
    try {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.access_token) {
        return data.session.access_token;
      }
    } catch {
      // Session lookup fallback
    }
    // Check cookie / api client token
    return api.getToken();
  },

  async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = await this.getSessionToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Admin-Role': 'SUPER_ADMIN',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string> || {}),
    };

    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const url = `${this.baseUrl}${cleanPath}`;

    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (res.status === 401 || res.status === 403) {
      throw new ApiError(res.status, `Unauthorized or Forbidden access [${res.status}] to ${cleanPath}`);
    }

    if (!res.ok) {
      const errorText = await res.text();
      throw new ApiError(res.status, errorText || `API Error ${res.status}`);
    }

    return res.json() as Promise<T>;
  },

  async get<T>(path: string, options?: RequestInit): Promise<T> {
    return this.request<T>(path, { ...options, method: 'GET' });
  },

  async post<T>(path: string, body?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  async put<T>(path: string, body?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  async patch<T>(path: string, body?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  async delete<T>(path: string, options?: RequestInit): Promise<T> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  },
};

export { api, ApiClient };
export default apiClient;
