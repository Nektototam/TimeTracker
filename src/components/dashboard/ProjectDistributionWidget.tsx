"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { cn } from '../../lib/utils';
import reportService, { ProjectSummary } from '../../lib/reportService';

interface ProjectDistributionWidgetProps {
  className?: string;
}


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


  return (
    <Card className={cn("h-full", className)}>
      <CardHeader>
        <CardTitle>{t('statistics.byProject')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">{t('common.loading')}...</div>
          ) : projects.length > 0 ? (
            projects.map((project) => (
              <div key={project.project.id} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="truncate text-foreground">{project.project.name}</span>
                  <span className="ml-2 text-muted-foreground">{formatDuration(project.total_duration)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${project.percentage}%`,
                      backgroundColor: project.project.color
                    }}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="py-4 text-center text-sm text-muted-foreground">
              {t('statistics.noData')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
