import { z } from 'zod';
import {
  ProjectListResponseSchema,
  ProjectResponseSchema,
  WorkTypeListResponseSchema,
  WorkTypeResponseSchema,
  TimeEntryListResponseSchema,
  TimeEntryResponseSchema,
  SettingsResponseSchema,
  OkResponseSchema,
  ActivateProjectResponseSchema,
  ReportResponseSchema,
  AuthResponseSchema,
  MeResponseSchema,
  type ApiProject,
  type ApiWorkType,
  type ApiTimeEntry,
  type ApiUserSettings,
} from './api-schemas';

// Re-export types for consumers
export type { ApiProject, ApiWorkType, ApiTimeEntry, ApiUserSettings };

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const accessTokenKey = "timetracker_access_token";

const getAccessToken = () => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(accessTokenKey);
};

const setAccessToken = (token: string) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(accessTokenKey, token);
};

const clearAccessToken = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(accessTokenKey);
};

async function refreshAccessToken(): Promise<string | null> {
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include"
  });

  if (!response.ok) {
    clearAccessToken();
    return null;
  }

  const data = await response.json();
  if (data?.accessToken) {
    setAccessToken(data.accessToken);
    return data.accessToken as string;
  }

  return null;
}

async function apiRequest<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
  const headers = new Headers(options.headers || {});

  if (options.body) {
    headers.set("Content-Type", "application/json");
  }

  const token = getAccessToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include"
  });

  if (response.status === 401 && retry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiRequest<T>(path, options, false);
    }
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody?.error || "Request failed");
  }

  return response.json() as Promise<T>;
}

async function validatedApiRequest<T>(
  path: string,
  schema: z.ZodSchema<T>,
  options: RequestInit = {},
  retry = true
): Promise<T> {
  const data = await apiRequest<unknown>(path, options, retry);
  const result = schema.safeParse(data);

  if (!result.success) {
    console.error('API response validation failed:', result.error.format());
    // In development, throw to catch validation issues early
    if (process.env.NODE_ENV === 'development') {
      throw new Error(`API validation failed: ${result.error.message}`);
    }
    // In production, return data as-is to avoid breaking the app
    return data as T;
  }

  return result.data;
}

export const api = {
  auth: {
    async register(email: string, password: string) {
      const data = await validatedApiRequest(
        "/auth/register",
        AuthResponseSchema,
        {
          method: "POST",
          body: JSON.stringify({ email, password })
        }
      );
      if (data.accessToken) {
        setAccessToken(data.accessToken);
      }
      return data;
    },
    async login(email: string, password: string) {
      const data = await validatedApiRequest(
        "/auth/login",
        AuthResponseSchema,
        {
          method: "POST",
          body: JSON.stringify({ email, password })
        }
      );
      if (data.accessToken) {
        setAccessToken(data.accessToken);
      }
      return data;
    },
    async logout() {
      await validatedApiRequest("/auth/logout", OkResponseSchema, { method: "POST" });
      clearAccessToken();
    },
    async me() {
      return validatedApiRequest("/auth/me", MeResponseSchema, {
        headers: { "Cache-Control": "no-store" }
      });
    }
  },

  projects: {
    async list() {
      return validatedApiRequest("/projects", ProjectListResponseSchema);
    },
    async get(id: string) {
      return validatedApiRequest(`/projects/${id}`, ProjectResponseSchema);
    },
    async create(data: { name: string; color?: string; description?: string }) {
      return validatedApiRequest("/projects", ProjectResponseSchema, {
        method: "POST",
        body: JSON.stringify(data)
      });
    },
    async update(id: string, data: { name?: string; color?: string; description?: string | null; status?: "active" | "archived" }) {
      return validatedApiRequest(`/projects/${id}`, ProjectResponseSchema, {
        method: "PATCH",
        body: JSON.stringify(data)
      });
    },
    async delete(id: string) {
      return validatedApiRequest(`/projects/${id}`, OkResponseSchema, { method: "DELETE" });
    },
    async activate(id: string) {
      return validatedApiRequest(`/projects/${id}/activate`, ActivateProjectResponseSchema, { method: "POST" });
    }
  },

  workTypes: {
    async list(projectId: string) {
      return validatedApiRequest(`/work-types?projectId=${projectId}`, WorkTypeListResponseSchema);
    },
    async create(data: { projectId: string; name: string; color?: string; description?: string; timeGoalMs?: number }) {
      return validatedApiRequest("/work-types", WorkTypeResponseSchema, {
        method: "POST",
        body: JSON.stringify(data)
      });
    },
    async update(id: string, data: { name?: string; color?: string; description?: string | null; status?: "active" | "archived"; timeGoalMs?: number | null }) {
      return validatedApiRequest(`/work-types/${id}`, WorkTypeResponseSchema, {
        method: "PATCH",
        body: JSON.stringify(data)
      });
    },
    async delete(id: string) {
      return validatedApiRequest(`/work-types/${id}`, OkResponseSchema, { method: "DELETE" });
    }
  },

  timeEntries: {
    async list(params?: { projectId?: string; workTypeId?: string; from?: string; to?: string; limit?: number; all?: boolean }) {
      const query = new URLSearchParams();
      if (params?.projectId) query.set("projectId", params.projectId);
      if (params?.workTypeId) query.set("workTypeId", params.workTypeId);
      if (params?.from) query.set("from", params.from);
      if (params?.to) query.set("to", params.to);
      if (params?.limit) query.set("limit", String(params.limit));
      if (params?.all) query.set("all", "true");
      const suffix = query.toString() ? `?${query.toString()}` : "";
      return validatedApiRequest(`/time-entries${suffix}`, TimeEntryListResponseSchema);
    },
    async today() {
      return validatedApiRequest("/time-entries/today", TimeEntryListResponseSchema);
    },
    async create(payload: {
      projectId: string;
      workTypeId?: string;
      startTime: string;
      endTime: string;
      durationMs: number;
      description?: string;
      timeLimitMs?: number | null;
    }) {
      return validatedApiRequest("/time-entries", TimeEntryResponseSchema, {
        method: "POST",
        body: JSON.stringify(payload)
      });
    },
    async update(id: string, payload: {
      workTypeId?: string | null;
      startTime?: string;
      endTime?: string;
      durationMs?: number;
      description?: string | null;
      timeLimitMs?: number | null;
    }) {
      return validatedApiRequest(`/time-entries/${id}`, TimeEntryResponseSchema, {
        method: "PATCH",
        body: JSON.stringify(payload)
      });
    },
    async delete(id: string) {
      return validatedApiRequest(`/time-entries/${id}`, OkResponseSchema, { method: "DELETE" });
    }
  },

  settings: {
    async get() {
      return validatedApiRequest("/settings", SettingsResponseSchema);
    },
    async update(payload: ApiUserSettings) {
      return validatedApiRequest("/settings", SettingsResponseSchema, {
        method: "PUT",
        body: JSON.stringify(payload)
      });
    },
    async cleanup() {
      return validatedApiRequest("/settings/cleanup", OkResponseSchema, { method: "POST" });
    }
  },

  reports: {
    async get(params: { period?: "week" | "month" | "quarter" | "custom"; startDate?: string; endDate?: string }) {
      const query = new URLSearchParams();
      if (params.period) query.set("period", params.period);
      if (params.startDate) query.set("startDate", params.startDate);
      if (params.endDate) query.set("endDate", params.endDate);
      const suffix = query.toString() ? `?${query.toString()}` : "";
      return validatedApiRequest(`/reports${suffix}`, ReportResponseSchema);
    }
  }
};

export const authToken = {
  get: getAccessToken,
  set: setAccessToken,
  clear: clearAccessToken
};
