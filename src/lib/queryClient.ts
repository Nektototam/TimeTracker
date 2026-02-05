import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Query keys for cache management
export const queryKeys = {
  projects: {
    all: ['projects'] as const,
    list: () => [...queryKeys.projects.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.projects.all, 'detail', id] as const,
    withStats: () => [...queryKeys.projects.all, 'with-stats'] as const,
  },
  workTypes: {
    all: ['workTypes'] as const,
    list: (projectId: string) => [...queryKeys.workTypes.all, 'list', projectId] as const,
    detail: (id: string) => [...queryKeys.workTypes.all, 'detail', id] as const,
  },
  timeEntries: {
    all: ['timeEntries'] as const,
    list: (params?: Record<string, string | number | boolean | undefined>) =>
      [...queryKeys.timeEntries.all, 'list', params] as const,
    today: () => [...queryKeys.timeEntries.all, 'today'] as const,
    detail: (id: string) => [...queryKeys.timeEntries.all, 'detail', id] as const,
  },
  settings: {
    all: ['settings'] as const,
    user: () => [...queryKeys.settings.all, 'user'] as const,
  },
  reports: {
    all: ['reports'] as const,
    get: (params: Record<string, string | undefined>) => [...queryKeys.reports.all, params] as const,
  },
};
