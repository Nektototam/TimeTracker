"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import projectsService, { Project, PROJECT_COLORS } from '../../lib/projectsService';
import { useLanguage } from '../../contexts/LanguageContext';

interface ProjectsWidgetProps {
  onStartTimer?: (projectId: string, projectName: string) => void;
  searchQuery?: string;
}

export function ProjectsWidget({ onStartTimer, searchQuery = '' }: ProjectsWidgetProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectColor, setNewProjectColor] = useState(PROJECT_COLORS[0]);
  const { translationInstance } = useLanguage();
  const { t } = translationInstance;
  const router = useRouter();

  const loadProjects = useCallback(async () => {
    try {
      const data = await projectsService.getProjectsWithStats();
      setProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;

    try {
      await projectsService.createProject({
        name: newProjectName.trim(),
        color: newProjectColor
      });
      setNewProjectName('');
      setShowCreateForm(false);
      await loadProjects();
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleStartTimer = async (project: Project) => {
    // Activate this project
    try {
      await projectsService.activateProject(project.id);
    } catch (error) {
      console.error('Error activating project:', error);
    }

    if (onStartTimer) {
      onStartTimer(project.id, project.name);
    } else {
      // Navigate to timer page with project preselected
      router.push(`/timer?projectId=${encodeURIComponent(project.id)}`);
    }
  };

  // Filter projects by search query
  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.projects') || 'Projects'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            Loading...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t('dashboard.projects') || 'Projects'}</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? '−' : '+'}
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {showCreateForm && (
          <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-3">
            <input
              type="text"
              placeholder={t('dashboard.newProjectName') || 'Project name'}
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              autoFocus
            />
            <div className="flex flex-wrap gap-2">
              {PROJECT_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setNewProjectColor(color)}
                  className="h-6 w-6 rounded-full transition-transform hover:scale-110"
                  style={{
                    backgroundColor: color,
                    outline: color === newProjectColor ? '2px solid currentColor' : 'none',
                    outlineOffset: '2px'
                  }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreateProject} disabled={!newProjectName.trim()}>
                {t('create') || 'Create'}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowCreateForm(false)}>
                {t('cancel') || 'Cancel'}
              </Button>
            </div>
          </div>
        )}

        {filteredProjects.length === 0 ? (
          <div className="py-4 text-center text-sm text-muted-foreground">
            {searchQuery
              ? (t('dashboard.noProjectsFound') || 'No projects found')
              : (t('dashboard.noProjects') || 'No projects yet. Create your first project!')}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="group flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted/50"
              >
                <div
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: project.color }}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-foreground">
                    {project.name}
                  </div>
                  {project.todayTimeMs !== undefined && project.todayTimeMs > 0 && (
                    <div className="text-xs text-muted-foreground">
                      {t('dashboard.today') || 'Today'}: {projectsService.formatDuration(project.todayTimeMs)}
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => handleStartTimer(project)}
                  title={t('dashboard.startTimer') || 'Start timer'}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Button>
              </div>
            ))}
          </div>
        )}

        {projects.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => router.push('/settings')}
          >
            {t('dashboard.manageProjects') || 'Manage projects'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
