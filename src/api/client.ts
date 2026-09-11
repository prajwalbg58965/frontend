import type { ApiResult, ApiError } from '../types/domain';

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResult<T>> {
    const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${this.baseUrl}${formattedEndpoint}`;

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
    let urlString = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      (Object.entries(params) as [string, unknown][]).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.set(key, String(value));
        }
      });
      urlString += `?${searchParams.toString()}`;
    }

    try {
      const response = await fetch(urlString, {
        headers: {
          'Content-Type': 'application/json',
        },
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

  async post<T>(endpoint: string, body?: unknown): Promise<ApiResult<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }
}

export const apiClient = new ApiClient(import.meta.env.VITE_API_BASE_URL || '');
export const etaApiClient = new ApiClient(import.meta.env.VITE_ETA_API_URL || 'http://localhost:8001');
export const positionApiClient = new ApiClient(import.meta.env.VITE_POSITION_API_URL || 'http://localhost:8002');
export const riskApiClient = new ApiClient(import.meta.env.VITE_RISK_API_URL || 'http://localhost:8002');
export const confirmationApiClient = new ApiClient(import.meta.env.VITE_CONFIRMATION_API_URL || 'http://localhost:8003');
export const incidentApiClient = new ApiClient(import.meta.env.VITE_INCIDENT_API_URL || 'http://localhost:8003');