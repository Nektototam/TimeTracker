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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 pb-24">
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-lg">⏱️</div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">TimeTracker</p>
              <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
            </div>
          </div>

          <div className="flex-1">
            <div className="relative w-full max-w-md">
              <input
                type="search"
                placeholder="Search projects"
                className="h-10 w-full rounded-xl border border-border bg-card px-4 text-sm text-foreground shadow-app-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              New entry
            </Button>
            <Button variant="primary" size="sm">
              Start timer
            </Button>
          </div>
        </div>
      </header>

      <div
        className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8"
        style={{ gridTemplateColumns: '240px 1fr', alignItems: 'start' }}
      >
        <aside className="flex w-64 flex-col gap-4">
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
        </aside>

        <main className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Overview</h2>
              <p className="text-sm text-muted-foreground">Track your time with a modern workflow.</p>
            </div>
          </div>

          <DashboardLayout />
        </main>
      </div>
    </div>
  );
}
