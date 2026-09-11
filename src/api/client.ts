import type { ApiResult, ApiError } from '../types/domain';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const ETA_API_BASE_URL = import.meta.env.VITE_ETA_API_BASE_URL || '';

class ApiClient {
  private baseUrl: string;
  private etaBaseUrl: string;

  constructor(baseUrl: string = API_BASE_URL, etaBaseUrl: string = ETA_API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.etaBaseUrl = etaBaseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit, useEtaBase = false): Promise<ApiResult<T>> {
    const baseUrl = useEtaBase ? this.etaBaseUrl : this.baseUrl;
    const url = `${baseUrl}${endpoint}`;

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

  async get<T>(endpoint: string, params?: Record<string, unknown>, useEtaBase = false): Promise<ApiResult<T>> {
    const baseUrl = useEtaBase ? this.etaBaseUrl : this.baseUrl;
    const url = new URL(endpoint, baseUrl);
    if (params) {
      (Object.entries(params) as [string, unknown][]).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      });
    }
    return this.request<T>(url.pathname + url.search, undefined, useEtaBase);
  }

  async post<T>(endpoint: string, body: unknown, useEtaBase = false): Promise<ApiResult<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    }, useEtaBase);
  }
}

export const apiClient = new ApiClient();