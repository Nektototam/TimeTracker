import { cn } from "@/lib/utils";
import { CSSProperties } from "react";

interface SkeletonProps {
  className?: string;
  style?: CSSProperties;
}

export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className
      )}
      style={style}
    />
  );
}

// Common skeleton patterns
export function SkeletonText({ className, lines = 1 }: SkeletonProps & { lines?: number }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 && lines > 1 ? "w-4/5" : "w-full"
          )}
        />
      ))}
    </div>
  );
}

export function SkeletonAvatar({ className, size = "md" }: SkeletonProps & { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-14 w-14",
  };

  return (
    <Skeleton className={cn("rounded-full", sizeClasses[size], className)} />
  );
}

export function SkeletonButton({ className, size = "md" }: SkeletonProps & { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-8 w-20",
    md: "h-10 w-24",
    lg: "h-12 w-32",
  };

  return (
    <Skeleton className={cn("rounded-lg", sizeClasses[size], className)} />
  );
}

export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card p-6 shadow-sm", className)}>
      <div className="space-y-4">
        <Skeleton className="h-5 w-1/3" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
    </div>
  );
}

// Specialized skeletons for specific components
export function SkeletonProjectSwitcher() {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg min-w-[200px]">
      <Skeleton className="w-3 h-3 rounded-full" />
      <Skeleton className="flex-1 h-4" />
      <Skeleton className="w-4 h-4" />
    </div>
  );
}

export function SkeletonWorkTypeSwitcher() {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg min-w-[200px]">
      <Skeleton className="w-4 h-4" />
      <Skeleton className="flex-1 h-4" />
      <Skeleton className="w-4 h-4" />
    </div>
  );
}

export function SkeletonTimerDisplay() {
  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <Skeleton className="h-16 w-48" />
      <Skeleton className="h-8 w-32" />
      <div className="flex gap-4 mt-4">
        <Skeleton className="h-12 w-24 rounded-xl" />
        <Skeleton className="h-12 w-24 rounded-xl" />
      </div>
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <Skeleton className="h-8 w-20 mt-4" />
      <Skeleton className="h-3 w-16 mt-2" />
    </div>
  );
}

export function SkeletonActivityItem() {
  return (
    <div className="flex items-start justify-between rounded-xl border border-border p-4">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="h-5 w-16" />
    </div>
  );
}

export function SkeletonChart({ height = 140 }: { height?: number }) {
  return (
    <div className="flex items-end gap-2 w-full" style={{ height }}>
      {Array.from({ length: 7 }).map((_, i) => (
        <Skeleton
          key={i}
          className="flex-1 rounded-t-sm"
          style={{ height: `${30 + Math.random() * 70}%` }}
        />
      ))}
    </div>
  );
}

export function SkeletonTableRow() {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-border">
      <Skeleton className="h-4 w-4" />
      <Skeleton className="h-4 flex-1" />
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-16" />
    </div>
  );
}

export function SkeletonProjectCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <Skeleton className="w-4 h-4 rounded-full" />
        <Skeleton className="h-5 flex-1" />
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-2 w-full rounded-full" />
        <div className="flex justify-between">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </div>
  );
}
