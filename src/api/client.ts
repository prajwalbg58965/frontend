import type { ApiResult, ApiError } from '../types/domain';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResult<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const error: ApiError = {
          code: `HTTP_${response.status}`,
          message: response.statusText || 'Request failed',
          status: response.status,
          timestamp: new Date().toISOString(),
        };
        return { success: false, error };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (err) {
      const error: ApiError = {
        code: 'NETWORK_ERROR',
        message: err instanceof Error ? err.message : 'Unknown network error',
        status: 0,
        timestamp: new Date().toISOString(),
      };
      return { success: false, error };
    }
  }

  async get<T>(endpoint: string, params?: Record<string, unknown>): Promise<ApiResult<T>> {
    const url = new URL(endpoint, this.baseUrl);
    if (params) {
      (Object.entries(params) as [string, unknown][]).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      });
    }
    return this.request<T>(url.pathname + url.search);
  }

  async post<T>(endpoint: string, body: unknown): Promise<ApiResult<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }
}

export const apiClient = new ApiClient();