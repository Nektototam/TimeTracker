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
        "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
      style={{
        gridAutoRows: 'minmax(180px, auto)'
      }}
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
  return (
    <div
      className={cn(
        colSpan === 1 && "col-span-1",
        colSpan === 2 && "col-span-1 sm:col-span-2",
        colSpan === 3 && "col-span-1 sm:col-span-2 lg:col-span-3",
        rowSpan === 1 && "row-span-1",
        rowSpan === 2 && "row-span-2",
        className
      )}
    >
      {children}
    </div>
  );
}
