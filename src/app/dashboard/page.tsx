"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { ProjectsWidget } from '../../components/dashboard/ProjectsWidget';
import AppShell from '../../components/AppShell';
import { Button } from '../../components/ui/Button';
import { useLanguage } from '../../contexts/LanguageContext';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const { translationInstance } = useLanguage();
  const { t } = translationInstance;

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth');
    }
  }, [user, isLoading, router]);

  const handleStartTimer = (projectId?: string, projectName?: string) => {
    if (projectId) {
      router.push(`/timer?projectId=${encodeURIComponent(projectId)}`);
    } else {
      router.push('/timer');
    }
  };

  const handleNewEntry = () => {
    router.push('/timer?mode=manual');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <AppShell
      title={t('nav.dashboard') || 'Dashboard'}
      sidebarContent={<ProjectsWidget onStartTimer={handleStartTimer} searchQuery={searchQuery} />}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">{t('dashboard.overview') || 'Overview'}</h2>
          <p className="text-sm text-muted-foreground">{t('dashboard.trackTime') || 'Track your time with a modern workflow.'}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm" className="rounded-full" onClick={handleNewEntry}>
            {t('dashboard.newEntry') || 'New entry'}
          </Button>
          <Button variant="primary" size="sm" className="rounded-full" onClick={() => handleStartTimer()}>
            {t('dashboard.startTimer') || 'Start timer'}
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-app-sm">
        <div className="relative w-full max-w-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          >
            <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z" clipRule="evenodd" />
          </svg>
          <input
            type="search"
            placeholder={t('dashboard.searchProjects') || 'Search projects...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 w-full rounded-2xl border border-border bg-background pl-10 pr-4 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      <DashboardLayout />
    </AppShell>
  );
}
