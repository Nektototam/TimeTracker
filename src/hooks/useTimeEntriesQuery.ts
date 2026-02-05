import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, ApiTimeEntry } from '../lib/api';
import { queryKeys } from '../lib/queryClient';
import { TimeEntry } from '../types/supabase';

function mapToTimeEntry(entry: ApiTimeEntry): TimeEntry {
  return {
    id: entry.id,
    projectId: entry.projectId,
    workTypeId: entry.workTypeId || undefined,
    startTime: entry.startTime,
    endTime: entry.endTime,
    durationMs: entry.durationMs,
    description: entry.description || undefined,
    createdAt: entry.createdAt,
    timeLimitMs: entry.timeLimitMs || undefined,
    project: entry.project ? {
      id: entry.project.id,
      userId: entry.project.userId,
      name: entry.project.name,
      color: entry.project.color,
      description: entry.project.description || undefined,
      status: entry.project.status,
      createdAt: entry.project.createdAt,
      updatedAt: entry.project.updatedAt,
    } : undefined,
    workType: entry.workType ? {
      id: entry.workType.id,
      projectId: entry.workType.projectId,
      name: entry.workType.name,
      color: entry.workType.color,
      description: entry.workType.description || undefined,
      status: entry.workType.status,
      timeGoalMs: entry.workType.timeGoalMs || undefined,
      createdAt: entry.workType.createdAt,
      updatedAt: entry.workType.updatedAt,
    } : undefined,
  };
}

// Query hooks
export function useTimeEntriesQuery(params?: {
  projectId?: string;
  workTypeId?: string;
  from?: string;
  to?: string;
  limit?: number;
  all?: boolean;
}) {
  return useQuery({
    queryKey: queryKeys.timeEntries.list(params),
    queryFn: async () => {
      const { items } = await api.timeEntries.list(params);
      return items.map(mapToTimeEntry);
    },
  });
}

export function useTodayEntries() {
  return useQuery({
    queryKey: queryKeys.timeEntries.today(),
    queryFn: async () => {
      const { items } = await api.timeEntries.today();
      return items.map(mapToTimeEntry);
    },
  });
}

export function useTimeEntriesByDateRange(startDate: Date | null, endDate: Date | null) {
  return useQuery({
    queryKey: queryKeys.timeEntries.list({
      from: startDate?.toISOString(),
      to: endDate?.toISOString(),
    }),
    queryFn: async () => {
      if (!startDate || !endDate) return [];
      const { items } = await api.timeEntries.list({
        from: startDate.toISOString(),
        to: endDate.toISOString(),
      });
      return items.map(mapToTimeEntry);
    },
    enabled: !!startDate && !!endDate,
  });
}

// Mutation hooks
export function useCreateTimeEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: {
      projectId: string;
      workTypeId?: string;
      startTime: Date;
      endTime: Date;
      durationMs: number;
      description?: string;
      timeLimitMs?: number;
    }) => {
      const payload = {
        projectId: entry.projectId,
        workTypeId: entry.workTypeId,
        startTime: entry.startTime.toISOString(),
        endTime: entry.endTime.toISOString(),
        durationMs: entry.durationMs,
        description: entry.description,
        timeLimitMs: entry.timeLimitMs,
      };
      const { item } = await api.timeEntries.create(payload);
      return mapToTimeEntry(item);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.timeEntries.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.withStats() });
    },
  });
}

export function useUpdateTimeEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      entry,
    }: {
      id: string;
      entry: Partial<TimeEntry>;
    }) => {
      const payload = {
        workTypeId: entry.workTypeId,
        startTime: entry.startTime ? new Date(entry.startTime).toISOString() : undefined,
        endTime: entry.endTime ? new Date(entry.endTime).toISOString() : undefined,
        durationMs: entry.durationMs,
        description: entry.description,
        timeLimitMs: entry.timeLimitMs,
      };
      const { item } = await api.timeEntries.update(id, payload);
      return mapToTimeEntry(item);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.timeEntries.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.withStats() });
    },
  });
}

export function useDeleteTimeEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.timeEntries.delete(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.timeEntries.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.withStats() });
    },
  });
}
