// React Query hooks - centralized exports
export {
  useProjects,
  useAllProjects,
  useProject,
  useProjectsWithStats,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  useActivateProject,
  type Project,
} from '../useProjects';

export {
  useWorkTypes,
  useAllWorkTypes,
  useCreateWorkType,
  useUpdateWorkType,
  useDeleteWorkType,
  type WorkType,
} from '../useWorkTypes';

export {
  useTimeEntriesQuery,
  useTodayEntries,
  useTimeEntriesByDateRange,
  useCreateTimeEntry,
  useUpdateTimeEntry,
  useDeleteTimeEntry,
} from '../useTimeEntriesQuery';

export {
  useSettings,
  useUpdateSettings,
  useCleanupSettings,
} from '../useSettings';

export { queryKeys, queryClient } from '../../lib/queryClient';
