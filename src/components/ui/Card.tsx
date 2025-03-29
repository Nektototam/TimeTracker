'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  shadow?: 'sm' | 'default' | 'lg' | 'none';
  padding?: 'sm' | 'md' | 'lg' | 'none';
  border?: boolean;
  rounded?: 'sm' | 'default' | 'lg' | 'none';
}

export function Card({
  className,
  children,
  shadow = 'default',
  padding = 'md',
  border = false,
  rounded = 'default',
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'bg-white',
        // Тени
        {
          'shadow-app-sm': shadow === 'sm',
          'shadow-app': shadow === 'default',
          'shadow-app-lg': shadow === 'lg',
          'shadow-none': shadow === 'none',
        },
        // Отступы
        {
          'p-app-sm': padding === 'sm',
          'p-app-md': padding === 'md',
          'p-app-lg': padding === 'lg',
          'p-0': padding === 'none',
        },
        // Закругления
        {
          'rounded-app-sm': rounded === 'sm',
          'rounded-app': rounded === 'default',
          'rounded-app-lg': rounded === 'lg',
          'rounded-none': rounded === 'none',
        },
        // Граница
        {
          'border border-gray-200': border,
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardHeader({ className, children, ...props }: CardHeaderProps) {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 p-app-sm', className)}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export function CardTitle({ className, children, ...props }: CardTitleProps) {
  return (
    <h3
      className={cn('text-lg font-semibold leading-none tracking-tight text-dark', className)}
      {...props}
    >
      {children}
    </h3>
  );
}

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export function CardDescription({ className, children, ...props }: CardDescriptionProps) {
  return (
    <p
      className={cn('text-sm text-secondary', className)}
      {...props}
    >
      {children}
    </p>
  );
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardContent({ className, children, ...props }: CardContentProps) {
  return (
    <div className={cn('p-app-sm pt-0', className)} {...props}>
      {children}
    </div>
  );
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardFooter({ className, children, ...props }: CardFooterProps) {
  return (
    <div
      className={cn('flex items-center p-app-sm pt-0', className)}
      {...props}
    >
      {children}
    </div>
  );
} 