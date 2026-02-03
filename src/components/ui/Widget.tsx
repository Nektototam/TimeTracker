"use client";

import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface WidgetProps {
  children: ReactNode;
  title?: string;
  className?: string;
  headerAction?: ReactNode;
  noPadding?: boolean;
}

export function Widget({
  children,
  title,
  className,
  headerAction,
  noPadding = false
}: WidgetProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl shadow-app border border-gray-100",
        "transition-all duration-200 hover:shadow-app-lg",
        "h-full flex flex-col",
        className
      )}
    >
      {title && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
          {headerAction}
        </div>
      )}
      <div className={cn(
        "flex-1",
        !noPadding && "p-4"
      )}>
        {children}
      </div>
    </div>
  );
}

interface WidgetStatProps {
  label: string;
  value: string;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export function WidgetStat({ label, value, subValue, trend, trendValue }: WidgetStatProps) {
  const trendColors = {
    up: 'text-success',
    down: 'text-error',
    neutral: 'text-gray-500'
  };

  const trendIcons = {
    up: '\u2191',
    down: '\u2193',
    neutral: '\u2192'
  };

  return (
    <div className="flex flex-col">
      <span className="text-xs text-gray-500 uppercase tracking-wide">{label}</span>
      <span className="text-2xl font-bold text-gray-900">{value}</span>
      {subValue && <span className="text-sm text-gray-500">{subValue}</span>}
      {trend && trendValue && (
        <span className={cn("text-xs font-medium", trendColors[trend])}>
          {trendIcons[trend]} {trendValue}
        </span>
      )}
    </div>
  );
}
