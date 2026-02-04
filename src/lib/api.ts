const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const accessTokenKey = "timetracker_access_token";

export interface ApiProject {
  id: string;
  userId: string;
  name: string;
  color: string;
  description?: string | null;
  status: "active" | "archived";
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    timeEntries: number;
    workTypes: number;
  };
}

export interface ApiWorkType {
  id: string;
  projectId: string;
  name: string;
  color: string;
  description?: string | null;
  status: "active" | "archived";
  timeGoalMs?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiTimeEntry {
  id: string;
  projectId: string;
  workTypeId?: string | null;
  startTime: string;
  endTime: string;
  durationMs: number;
  description?: string | null;
  timeLimitMs?: number | null;
  createdAt?: string;
  project?: ApiProject;
  workType?: ApiWorkType | null;
}

export interface ApiUserSettings {
  pomodoroWorkTime: number;
  pomodoroRestTime: number;
  pomodoroLongRestTime: number;
  autoStart: boolean;
  roundTimes: string;
  language: string;
  dataRetentionPeriod: number;
  activeProjectId?: string | null;
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
      return apiRequest<{ user: { id: string; email: string } | null }>("/auth/me", {
        headers: { "Cache-Control": "no-store" }
      });
    }
  },

  projects: {
    async list() {
      return apiRequest<{ items: ApiProject[] }>("/projects");
    },
    async get(id: string) {
      return apiRequest<{ item: ApiProject & { workTypes: ApiWorkType[] } }>(`/projects/${id}`);
    },
    async create(data: { name: string; color?: string; description?: string }) {
      return apiRequest<{ item: ApiProject }>("/projects", {
        method: "POST",
        body: JSON.stringify(data)
      });
    },
    async update(id: string, data: { name?: string; color?: string; description?: string | null; status?: "active" | "archived" }) {
      return apiRequest<{ item: ApiProject }>(`/projects/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data)
      });
    },
    async delete(id: string) {
      return apiRequest<{ ok: boolean }>(`/projects/${id}`, { method: "DELETE" });
    },
    async activate(id: string) {
      return apiRequest<{ ok: boolean; activeProjectId: string }>(`/projects/${id}/activate`, { method: "POST" });
    }
  },

  workTypes: {
    async list(projectId: string) {
      return apiRequest<{ items: ApiWorkType[] }>(`/work-types?projectId=${projectId}`);
    },
    async create(data: { projectId: string; name: string; color?: string; description?: string; timeGoalMs?: number }) {
      return apiRequest<{ item: ApiWorkType }>("/work-types", {
        method: "POST",
        body: JSON.stringify(data)
      });
    },
    async update(id: string, data: { name?: string; color?: string; description?: string | null; status?: "active" | "archived"; timeGoalMs?: number | null }) {
      return apiRequest<{ item: ApiWorkType }>(`/work-types/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data)
      });
    },
    async delete(id: string) {
      return apiRequest<{ ok: boolean }>(`/work-types/${id}`, { method: "DELETE" });
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
      return apiRequest<{ items: ApiTimeEntry[] }>(`/time-entries${suffix}`);
    },
    async today() {
      return apiRequest<{ items: ApiTimeEntry[] }>("/time-entries/today");
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
      return apiRequest<{ item: ApiTimeEntry }>("/time-entries", {
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
          project: { id: string; name: string; color: string };
          totalDuration: number;
          percentage: number;
          workTypes: Array<{
            workType: { id: string; name: string; color: string };
            duration: number;
            percentage: number;
            entriesCount: number;
          }>;
          entriesCount: number;
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
