import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, ApiWorkType } from '../lib/api';
import { queryKeys } from '../lib/queryClient';

// Query hooks
export function useWorkTypes(projectId: string | null) {
  return useQuery({
    queryKey: queryKeys.workTypes.list(projectId || ''),
    queryFn: async () => {
      if (!projectId) return [];
      const { items } = await api.workTypes.list(projectId);
      return items.filter(wt => wt.status === 'active');
    },
    enabled: !!projectId,
  });
}

export function useAllWorkTypes(projectId: string | null) {
  return useQuery({
    queryKey: [...queryKeys.workTypes.list(projectId || ''), 'all'],
    queryFn: async () => {
      if (!projectId) return [];
      const { items } = await api.workTypes.list(projectId);
      return items;
    },
    enabled: !!projectId,
  });
}

// Mutation hooks
export function useCreateWorkType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      projectId: string;
      name: string;
      color?: string;
      description?: string;
      timeGoalMs?: number;
    }) => {
      const { item } = await api.workTypes.create(data);
      return item;
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workTypes.list(projectId) });
    },
  });
}

export function useUpdateWorkType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      projectId,
      data,
    }: {
      id: string;
      projectId: string;
      data: {
        name?: string;
        color?: string;
        description?: string | null;
        status?: 'active' | 'archived';
        timeGoalMs?: number | null;
      };
    }) => {
      const { item } = await api.workTypes.update(id, data);
      return { item, projectId };
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workTypes.list(projectId) });
    },
  });
}

export function useDeleteWorkType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, projectId }: { id: string; projectId: string }) => {
      await api.workTypes.delete(id);
      return { id, projectId };
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workTypes.list(projectId) });
    },
  });
}

// Helper type export
export type WorkType = ApiWorkType;
