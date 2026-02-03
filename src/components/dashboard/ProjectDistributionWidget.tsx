"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Widget } from '../ui/Widget';
import reportService, { ProjectSummary } from '../../lib/reportService';
import { cn } from '../../lib/utils';

interface ProjectDistributionWidgetProps {
  className?: string;
}

const PROJECT_COLORS: Record<string, string> = {
  development: '#5e72e4',
  design: '#2dce89',
  marketing: '#fb6340',
  meeting: '#f5365c',
  other: '#11cdef',
};

export function ProjectDistributionWidget({ className }: ProjectDistributionWidgetProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const report = await reportService.getWeeklyReport(user.id);
        // Top 5 projects by time
        const topProjects = report.projectSummaries
          .sort((a, b) => b.total_duration - a.total_duration)
          .slice(0, 5);
        setProjects(topProjects);
      } catch (error) {
        console.error('Error loading projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  const formatDuration = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getColor = (projectType: string) => {
    return PROJECT_COLORS[projectType] || '#94a3b8';
  };

  return (
    <Widget title={t('statistics.byProject')} className={className}>
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-gray-400 text-sm">{t('common.loading')}...</div>
        ) : projects.length > 0 ? (
          projects.map((project) => (
            <div key={project.project_type} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700 truncate">{project.project_name}</span>
                <span className="text-gray-500 ml-2">{formatDuration(project.total_duration)}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${project.percentage}%`,
                    backgroundColor: getColor(project.project_type)
                  }}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="text-gray-400 text-sm text-center py-4">
            {t('statistics.noData')}
          </div>
        )}
      </div>
    </Widget>
  );
}
