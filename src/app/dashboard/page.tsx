"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { ProjectsWidget } from '../../components/dashboard/ProjectsWidget';
import NavBar from '../../components/NavBar';
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
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/40 pb-24">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-lg text-primary-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">TimeTracker</p>
              <h1 className="text-lg font-semibold text-foreground">{t('nav.dashboard') || 'Dashboard'}</h1>
            </div>
          </div>

          <div className="flex-1 min-w-[200px]">
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
                className="h-11 w-full rounded-2xl border border-border bg-card pl-10 pr-4 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
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
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[260px_1fr] lg:px-8">
        <aside className="flex flex-col gap-4">
          <NavBar variant="sidebar" />
          <ProjectsWidget onStartTimer={handleStartTimer} searchQuery={searchQuery} />
        </aside>

        <main className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">{t('dashboard.overview') || 'Overview'}</h2>
              <p className="text-sm text-muted-foreground">{t('dashboard.trackTime') || 'Track your time with a modern workflow.'}</p>
            </div>
          </div>

          <DashboardLayout />
        </main>
      </div>
    </div>
  );
}
