"use client";

import React, { useEffect, useState } from 'react';
import NavBar from './NavBar';
import LanguageSwitcher from './LanguageSwitcher';
import { cn } from '@/lib/utils';

interface AppShellProps {
  title: string;
  children: React.ReactNode;
  sidebarContent?: React.ReactNode;
}

const SIDEBAR_STORAGE_KEY = 'timetracker.sidebar.collapsed';

export default function AppShell({ title, children, sidebarContent }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (stored !== null) {
      setCollapsed(stored === 'true');
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed));
  }, [collapsed]);

  const handleToggleSidebar = () => {
    if (typeof window === 'undefined') return;
    if (window.innerWidth < 1024) {
      setMobileOpen((prev) => !prev);
      return;
    }
    setCollapsed((prev) => !prev);
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleToggleSidebar}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground shadow-app-sm transition hover:bg-muted"
              aria-label="Toggle sidebar"
            >
              <span className="sr-only">Toggle sidebar</span>
              <span className="flex h-4 w-5 flex-col justify-between">
                <span className="block h-0.5 w-full rounded-full bg-foreground" />
                <span className="block h-0.5 w-full rounded-full bg-foreground" />
                <span className="block h-0.5 w-full rounded-full bg-foreground" />
              </span>
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-app-sm">
                TT
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">TimeTracker</p>
                <h1 className="text-lg font-semibold text-foreground">{title}</h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <aside
          className={cn(
            "hidden shrink-0 flex-col gap-4 lg:flex",
            collapsed ? "w-20" : "w-64"
          )}
        >
          <NavBar variant="sidebar" collapsed={collapsed} />
          {sidebarContent}
        </aside>

        <main className="min-w-0 flex-1 space-y-6">{children}</main>
      </div>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 transition-opacity lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={closeMobile}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 transform bg-background shadow-app-lg transition-transform lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-4">
          <NavBar variant="sidebar" />
        </div>
      </aside>
    </div>
  );
}
