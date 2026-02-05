import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, ApiProject } from '../lib/api';
import { queryKeys } from '../lib/queryClient';

export interface Project extends ApiProject {
  todayTimeMs?: number;
}

// Query hooks
export function useProjects() {
  return useQuery({
    queryKey: queryKeys.projects.list(),
    queryFn: async () => {
      const { items } = await api.projects.list();
      return items.filter(p => p.status === 'active');
    },
  });
}

export function useAllProjects() {
  return useQuery({
    queryKey: queryKeys.projects.all,
    queryFn: async () => {
      const { items } = await api.projects.list();
      return items;
    },
  });
}

export function useProject(id: string | null) {
  return useQuery({
    queryKey: queryKeys.projects.detail(id || ''),
    queryFn: async () => {
      if (!id) return null;
      const { item } = await api.projects.get(id);
      return item;
    },
    enabled: !!id,
  });
}

export function useProjectsWithStats() {
  return useQuery({
    queryKey: queryKeys.projects.withStats(),
    queryFn: async () => {
      const [projectsRes, todayRes] = await Promise.all([
        api.projects.list(),
        api.timeEntries.today(),
      ]);

      const projects = projectsRes.items.filter(p => p.status === 'active');
      const todayEntries = todayRes.items;

      // Group time by project
      const timeByProject = new Map<string, number>();
      for (const entry of todayEntries) {
        const current = timeByProject.get(entry.projectId) || 0;
        timeByProject.set(entry.projectId, current + entry.durationMs);
      }

      return projects.map(project => ({
        ...project,
        todayTimeMs: timeByProject.get(project.id) || 0,
      })) as Project[];
    },
  });
}

// Mutation hooks
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; color?: string; description?: string }) => {
      const { item } = await api.projects.create(data);
      return item;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: { name?: string; color?: string; description?: string | null; status?: 'active' | 'archived' };
    }) => {
      const { item } = await api.projects.update(id, data);
      return item;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(id) });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.projects.delete(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
}

export function useActivateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.projects.activate(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.all });
    },
  });
}
