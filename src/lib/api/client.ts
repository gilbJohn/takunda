import { API_CONFIG } from "@/lib/config/api";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestConfig extends RequestInit {
  params?: Record<string, string>;
}

/**
 * Base API client for backend requests.
 * Only used when NEXT_PUBLIC_API_URL is set.
 *
 * Automatically prepends base URL and injects auth token from localStorage.
 */
async function request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
  const { params, headers = {}, ...init } = config;

  let url = `${API_CONFIG.baseUrl}${endpoint}`;
  if (params) {
    const search = new URLSearchParams(params).toString();
    url += (url.includes("?") ? "&" : "?") + search;
  }

  const authToken =
    typeof window !== "undefined" ? localStorage.getItem("takunda-auth-token") : null;

  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(authToken && { Authorization: `Bearer ${authToken}` }),
      ...headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message ?? `Request failed: ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const apiClient = {
  get: <T>(endpoint: string, config?: RequestConfig) =>
    request<T>(endpoint, { ...config, method: "GET" }),

  post: <T>(endpoint: string, body?: unknown, config?: RequestConfig) =>
    request<T>(endpoint, {
      ...config,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: unknown, config?: RequestConfig) =>
    request<T>(endpoint, {
      ...config,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: unknown, config?: RequestConfig) =>
    request<T>(endpoint, {
      ...config,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string, config?: RequestConfig) =>
    request<T>(endpoint, { ...config, method: "DELETE" }),
};
