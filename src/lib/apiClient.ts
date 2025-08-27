import { supabase } from './supabase';
import { analytics } from './analytics';

// Simple request configuration
interface RequestConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string | number | boolean>;
  timeout?: number;
}

// Simple cache implementation
class SimpleCache {
  private cache = new Map<
    string,
    { data: unknown; timestamp: number; ttl: number }
  >();

  set(key: string, data: unknown, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string): unknown | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const isExpired = Date.now() - item.timestamp > item.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }
}

// Simplified API Client
class ApiClient {
  private cache = new SimpleCache();
  private baseURL = '';

  constructor(baseURL = '') {
    this.baseURL = baseURL;
  }

  // Add auth headers
  private async addAuthHeaders(
    headers: Record<string, string> = {}
  ): Promise<Record<string, string>> {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.access_token) {
        return {
          ...headers,
          Authorization: `Bearer ${session.access_token}`,
        };
      }
    } catch (error) {
      console.warn('Failed to get auth session:', error);
    }
    return headers;
  }

  // Build URL with query parameters
  private buildURL(
    url: string,
    params?: Record<string, string | number | boolean>
  ): string {
    const urlWithParams = new URL(url, this.baseURL);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          urlWithParams.searchParams.append(key, String(value));
        }
      });
    }
    return urlWithParams.toString();
  }

  // Execute request with timeout and retry
  private async executeRequest(config: RequestConfig): Promise<unknown> {
    const { url, method, headers = {}, body, params, timeout = 10000 } = config;

    const requestOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (body && method !== 'GET') {
      requestOptions.body = JSON.stringify(body);
    }

    // Add auth headers
    const authHeaders = await this.addAuthHeaders(
      requestOptions.headers as Record<string, string>
    );
    requestOptions.headers = authHeaders;

    // Execute with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(this.buildURL(url, params), {
        ...requestOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  // Main request method with retry logic
  async request<T = unknown>(config: RequestConfig): Promise<T> {
    const startTime = performance.now();
    const maxRetries = 3;
    let lastError: Error = new Error('Request failed');

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Check cache for GET requests
        if (config.method === 'GET') {
          const cacheKey = config.url;
          const cachedData = this.cache.get(cacheKey);
          if (cachedData) {
            analytics.trackPerformance(
              'api_cache_hit',
              performance.now() - startTime,
              {
                url: config.url,
              }
            );
            return cachedData as T;
          }
        }

        // Execute request
        const response = await this.executeRequest(config);

        // Cache successful GET responses
        if (config.method === 'GET') {
          const cacheKey = config.url;
          this.cache.set(cacheKey, response);
        }

        // Track performance
        analytics.trackPerformance(
          'api_request_success',
          performance.now() - startTime,
          {
            url: config.url,
            method: config.method,
          }
        );

        return response as T;
      } catch (error) {
        lastError = error as Error;

        // Don't retry on last attempt
        if (attempt === maxRetries) break;

        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }

    // Track error performance
    analytics.trackPerformance(
      'api_request_error',
      performance.now() - startTime,
      {
        url: config.url,
        method: config.method,
        error: lastError.message,
      }
    );

    // Log error
    console.error(`❌ API ${config.method} ${config.url}:`, lastError);
    analytics.trackError(lastError, { url: config.url, method: config.method });

    throw lastError;
  }

  // Convenience methods
  async get<T = unknown>(
    url: string,
    config?: Partial<RequestConfig>
  ): Promise<T> {
    return this.request<T>({ url, method: 'GET', ...config });
  }

  async post<T = unknown>(
    url: string,
    data?: unknown,
    config?: Partial<RequestConfig>
  ): Promise<T> {
    return this.request<T>({ url, method: 'POST', body: data, ...config });
  }

  async put<T = unknown>(
    url: string,
    data?: unknown,
    config?: Partial<RequestConfig>
  ): Promise<T> {
    return this.request<T>({ url, method: 'PUT', body: data, ...config });
  }

  async delete<T = unknown>(
    url: string,
    config?: Partial<RequestConfig>
  ): Promise<T> {
    return this.request<T>({ url, method: 'DELETE', ...config });
  }

  async patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: Partial<RequestConfig>
  ): Promise<T> {
    return this.request<T>({ url, method: 'PATCH', body: data, ...config });
  }

  // Cache management
  clearCache(): void {
    this.cache.clear();
  }

  invalidateCache(pattern?: string): void {
    if (pattern) {
      this.cache.delete(pattern);
    } else {
      this.cache.clear();
    }
  }
}

// Create and export default instance
export const apiClient = new ApiClient();
export default apiClient;
