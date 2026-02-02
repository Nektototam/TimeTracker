const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const accessTokenKey = "timetracker_access_token";

export interface ApiTimeEntry {
  id: string;
  userId: string;
  projectType: string;
  startTime: string;
  endTime: string;
  durationMs: number;
  description?: string | null;
  timeLimitMs?: number | null;
  createdAt?: string;
}

export interface ApiUserSettings {
  pomodoroWorkTime: number;
  pomodoroRestTime: number;
  pomodoroLongRestTime: number;
  autoStart: boolean;
  roundTimes: string;
  language: string;
  dataRetentionPeriod: number;
}

export interface ApiProjectType {
  id: string;
  name: string;
  createdAt?: string;
}

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
  headers.set("Content-Type", "application/json");

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

export const api = {
  auth: {
    async register(email: string, password: string) {
      const data = await apiRequest<{ accessToken: string; user: { id: string; email: string } }>(
        "/auth/register",
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
      const data = await apiRequest<{ accessToken: string; user: { id: string; email: string } }>(
        "/auth/login",
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
      await apiRequest<{ ok: boolean }>("/auth/logout", { method: "POST" });
      clearAccessToken();
    },
    async me() {
      return apiRequest<{ user: { id: string; email: string } | null }>("/auth/me");
    }
  },
  timeEntries: {
    async list(params?: { from?: string; to?: string; projectType?: string; limit?: number }) {
      const query = new URLSearchParams();
      if (params?.from) query.set("from", params.from);
      if (params?.to) query.set("to", params.to);
      if (params?.projectType) query.set("projectType", params.projectType);
      if (params?.limit) query.set("limit", String(params.limit));
      const suffix = query.toString() ? `?${query.toString()}` : "";
      return apiRequest<{ items: ApiTimeEntry[] }>(`/time-entries${suffix}`);
    },
    async today() {
      return apiRequest<{ items: ApiTimeEntry[] }>("/time-entries/today");
    },
    async create(payload: {
      projectType: string;
      startTime: string;
      endTime: string;
      durationMs: number;
      description?: string;
      timeLimitMs?: number | null;
    }) {
      return apiRequest<{ item: ApiTimeEntry }>("/time-entries", {
        method: "POST",
        body: JSON.stringify(payload)
      });
    },
    async update(id: string, payload: Partial<Omit<ApiTimeEntry, "id" | "userId" | "createdAt">>) {
      return apiRequest<{ item: ApiTimeEntry }>(`/time-entries/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload)
      });
    },
    async delete(id: string) {
      return apiRequest<{ ok: boolean }>(`/time-entries/${id}`, { method: "DELETE" });
    }
  },
  settings: {
    async get() {
      return apiRequest<{ settings: ApiUserSettings }>("/settings");
    },
    async update(payload: ApiUserSettings) {
      return apiRequest<{ settings: ApiUserSettings }>("/settings", {
        method: "PUT",
        body: JSON.stringify(payload)
      });
    },
    async cleanup() {
      return apiRequest<{ ok: boolean }>("/settings/cleanup", { method: "POST" });
    }
  },
  projectTypes: {
    async list() {
      return apiRequest<{ items: ApiProjectType[] }>("/project-types");
    },
    async create(name: string) {
      return apiRequest<{ item: ApiProjectType }>("/project-types", {
        method: "POST",
        body: JSON.stringify({ name })
      });
    },
    async update(id: string, name: string) {
      return apiRequest<{ item: ApiProjectType }>(`/project-types/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ name })
      });
    },
    async delete(id: string) {
      return apiRequest<{ ok: boolean }>(`/project-types/${id}`, { method: "DELETE" });
    }
  },
  reports: {
    async get(params: { period?: "week" | "month" | "quarter" | "custom"; startDate?: string; endDate?: string }) {
      const query = new URLSearchParams();
      if (params.period) query.set("period", params.period);
      if (params.startDate) query.set("startDate", params.startDate);
      if (params.endDate) query.set("endDate", params.endDate);
      const suffix = query.toString() ? `?${query.toString()}` : "";
      return apiRequest<{
        startDate: string;
        endDate: string;
        totalDuration: number;
        entries: ApiTimeEntry[];
        projectSummaries: Array<{
          projectType: string;
          totalDuration: number;
          percentage: number;
          entries: ApiTimeEntry[];
        }>;
      }>(`/reports${suffix}`);
    }
  }
};

export const authToken = {
  get: getAccessToken,
  set: setAccessToken,
  clear: clearAccessToken
};
