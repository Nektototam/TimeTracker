"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import NavBar from '../../components/NavBar';
import { Card, CardContent } from '../../components/ui/Card';

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
    <div className="min-h-screen bg-app pb-24 lg:pb-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 rounded-2xl border bg-white p-4 shadow-app-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Dashboard</p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">TimeTracker</h1>
            <p className="text-sm text-muted-foreground">Welcome back, {user.email}</p>
          </div>
          <Card className="w-full md:w-auto">
            <CardContent className="flex items-center gap-3 px-4 py-3">
              <span className="text-lg">⚡</span>
              <div>
                <div className="text-sm font-semibold text-foreground">Today focus</div>
                <div className="text-xs text-muted-foreground">Plan, track, and finish the session</div>
              </div>
            </CardContent>
          </Card>
        </header>

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <aside className="hidden lg:block">
            <NavBar variant="sidebar" />
          </aside>

          <main className="space-y-6">
            <DashboardLayout />
          </main>
        </div>
      </div>

      <NavBar className="lg:hidden" />
    </div>
  );
}
