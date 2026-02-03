"use client";

import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid gap-4 p-4",
        "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        "auto-rows-[minmax(120px,auto)]",
        className
      )}
    >
      {children}
    </div>
  );
}

interface BentoItemProps {
  children: ReactNode;
  className?: string;
  colSpan?: 1 | 2 | 3;
  rowSpan?: 1 | 2;
}

export function BentoItem({
  children,
  className,
  colSpan = 1,
  rowSpan = 1
}: BentoItemProps) {
  const colSpanClass = {
    1: "col-span-1",
    2: "md:col-span-2",
    3: "lg:col-span-3",
  }[colSpan];

  const rowSpanClass = {
    1: "row-span-1",
    2: "row-span-2",
  }[rowSpan];

  return (
    <div
      className={cn(
        colSpanClass,
        rowSpanClass,
        "min-h-[120px]",
        className
      )}
    >
      {children}
    </div>
  );
}
