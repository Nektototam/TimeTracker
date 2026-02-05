import reportService from '@/lib/reportService';
import { api } from '@/lib/api';

jest.mock('@/lib/api', () => ({
  api: {
    reports: {
      get: jest.fn()
    },
    workTypes: {
      list: jest.fn()
    }
  }
}));

describe('reportService.getReportData', () => {
  test('returns empty arrays when API omits entries and summaries', async () => {
    (api.reports.get as jest.Mock).mockResolvedValue({
      startDate: '2026-02-01T00:00:00.000Z',
      endDate: '2026-02-02T00:00:00.000Z',
      totalDuration: 0
    });

    const result = await reportService.getWeeklyReport('user-1');

    expect(result.entries).toEqual([]);
    expect(result.projectSummaries).toEqual([]);
    expect(result.totalDuration).toBe(0);
    expect(api.workTypes.list).not.toHaveBeenCalled();
  });
});