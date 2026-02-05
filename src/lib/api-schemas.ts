import { z } from 'zod';

// Base schemas
export const ProjectStatusSchema = z.enum(['active', 'archived']);

export const ApiProjectSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  color: z.string(),
  description: z.string().nullable().optional(),
  status: ProjectStatusSchema,
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  _count: z.object({
    timeEntries: z.number().optional(),
    workTypes: z.number().optional(),
  }).optional(),
}).passthrough();

export const ApiWorkTypeSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  name: z.string(),
  color: z.string(),
  description: z.string().nullable().optional(),
  status: ProjectStatusSchema,
  timeGoalMs: z.number().nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
}).passthrough();

export const ApiTimeEntrySchema = z.object({
  id: z.string(),
  projectId: z.string(),
  workTypeId: z.string().nullable().optional(),
  startTime: z.string(),
  endTime: z.string(),
  durationMs: z.number(),
  description: z.string().nullable().optional(),
  timeLimitMs: z.number().nullable().optional(),
  createdAt: z.string().optional(),
  project: ApiProjectSchema.optional(),
  workType: ApiWorkTypeSchema.nullable().optional(),
}).passthrough();

export const ApiUserSettingsSchema = z.object({
  pomodoroWorkTime: z.number(),
  pomodoroRestTime: z.number(),
  pomodoroLongRestTime: z.number(),
  autoStart: z.boolean(),
  roundTimes: z.string(),
  language: z.string(),
  dataRetentionPeriod: z.number(),
  activeProjectId: z.string().nullable().optional(),
}).passthrough();

export const UserSchema = z.object({
  id: z.string(),
  email: z.string(),
});

// Response schemas
export const AuthResponseSchema = z.object({
  accessToken: z.string(),
  user: UserSchema,
});

export const MeResponseSchema = z.object({
  user: UserSchema.nullable(),
});

export const ProjectListResponseSchema = z.object({
  items: z.array(ApiProjectSchema),
});

export const ProjectResponseSchema = z.object({
  item: ApiProjectSchema.extend({
    workTypes: z.array(ApiWorkTypeSchema).optional(),
  }),
});

export const WorkTypeListResponseSchema = z.object({
  items: z.array(ApiWorkTypeSchema),
});

export const WorkTypeResponseSchema = z.object({
  item: ApiWorkTypeSchema,
});

export const TimeEntryListResponseSchema = z.object({
  items: z.array(ApiTimeEntrySchema),
});

export const TimeEntryResponseSchema = z.object({
  item: ApiTimeEntrySchema,
});

export const SettingsResponseSchema = z.object({
  settings: ApiUserSettingsSchema,
});

export const OkResponseSchema = z.object({
  ok: z.boolean(),
});

export const ActivateProjectResponseSchema = z.object({
  ok: z.boolean(),
  activeProjectId: z.string(),
});

export const WorkTypeSummarySchema = z.object({
  workType: z.object({
    id: z.string(),
    name: z.string(),
    color: z.string(),
  }),
  duration: z.number(),
  percentage: z.number(),
  entriesCount: z.number(),
});

export const ProjectSummarySchema = z.object({
  project: z.object({
    id: z.string(),
    name: z.string(),
    color: z.string(),
  }),
  totalDuration: z.number(),
  percentage: z.number(),
  workTypes: z.array(WorkTypeSummarySchema),
  entriesCount: z.number(),
});

export const ReportResponseSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  totalDuration: z.number(),
  entries: z.array(ApiTimeEntrySchema),
  projectSummaries: z.array(ProjectSummarySchema),
});

// Type exports inferred from schemas
export type ApiProject = z.infer<typeof ApiProjectSchema>;
export type ApiWorkType = z.infer<typeof ApiWorkTypeSchema>;
export type ApiTimeEntry = z.infer<typeof ApiTimeEntrySchema>;
export type ApiUserSettings = z.infer<typeof ApiUserSettingsSchema>;
