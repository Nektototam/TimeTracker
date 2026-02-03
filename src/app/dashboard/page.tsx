"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import NavBar from '../../components/NavBar';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth');
    }
  }, [user, isLoading, router]);

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
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-lg">⏱️</div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">TimeTracker</p>
              <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
            </div>
          </div>

          <div className="flex-1 min-w-[200px]">
            <div className="relative w-full max-w-md">
              <input
                type="search"
                placeholder="Search projects"
                className="h-11 w-full rounded-2xl border border-border bg-card px-4 text-sm text-foreground shadow-app-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-full">
              New entry
            </Button>
            <Button variant="primary" size="sm" className="rounded-full">
              Start timer
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[260px_1fr] lg:px-8">
        <aside className="flex flex-col gap-4">
          <NavBar variant="sidebar" />
          <Card>
            <CardHeader>
              <CardTitle>Today focus</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Welcome back, {user.email}</p>
              <p>Plan your sessions and keep momentum.</p>
            </CardContent>
          </Card>
          <Card className="bg-primary/5">
            <CardHeader>
              <CardTitle>Quick tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Use Space to start or pause the timer.</p>
              <p>Press Cmd + K to open quick actions.</p>
            </CardContent>
          </Card>
        </aside>

        <main className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Overview</h2>
              <p className="text-sm text-muted-foreground">Track your time with a modern workflow.</p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="rounded-full border border-border bg-card px-3 py-1">Focus mode</span>
              <span className="rounded-full border border-border bg-card px-3 py-1">Weekly review</span>
            </div>
          </div>

          <DashboardLayout />
        </main>
      </div>
    </div>
  );
}
