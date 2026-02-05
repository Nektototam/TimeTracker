import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, ApiUserSettings } from '../lib/api';
import { queryKeys } from '../lib/queryClient';

// Query hook
export function useSettings() {
  return useQuery({
    queryKey: queryKeys.settings.user(),
    queryFn: async () => {
      const { settings } = await api.settings.get();
      return settings;
    },
  });
}

// Mutation hooks
export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: ApiUserSettings) => {
      const { settings: updated } = await api.settings.update(settings);
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.all });
    },
  });
}

export function useCleanupSettings() {
  return useMutation({
    mutationFn: async () => {
      await api.settings.cleanup();
    },
  });
}
