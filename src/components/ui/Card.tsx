'use client';

import * as React from 'react';
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
  border = true,
  rounded = 'default',
  ...props
}: CardProps) {
  const shadowClass = {
    sm: 'shadow-sm',
    default: 'shadow',
    lg: 'shadow-lg',
    none: 'shadow-none'
  }[shadow];

  const paddingClass = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    none: 'p-0'
  }[padding];

  const roundedClass = {
    sm: 'rounded-sm',
    default: 'rounded-lg',
    lg: 'rounded-xl',
    none: 'rounded-none'
  }[rounded];

  return (
    <div
      className={cn('bg-card text-card-foreground', shadowClass, paddingClass, roundedClass, border && 'border', className)}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardHeader({ className, children, ...props }: CardHeaderProps) {
  return (
    <div className={cn('flex flex-col space-y-1.5', className)} {...props}>
      {children}
    </div>
  );
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export function CardTitle({ className, children, ...props }: CardTitleProps) {
  return (
    <h3 className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props}>
      {children}
    </h3>
  );
}

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export function CardDescription({ className, children, ...props }: CardDescriptionProps) {
  return (
    <p className={cn('text-sm text-muted-foreground', className)} {...props}>
      {children}
    </p>
  );
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardContent({ className, children, ...props }: CardContentProps) {
  return (
    <div className={cn('pt-4', className)} {...props}>
      {children}
    </div>
  );
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardFooter({ className, children, ...props }: CardFooterProps) {
  return (
    <div className={cn('flex items-center pt-4', className)} {...props}>
      {children}
    </div>
  );
}