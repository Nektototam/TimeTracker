'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  shadow?: 'sm' | 'default' | 'lg' | 'none';
  padding?: 'sm' | 'md' | 'lg' | 'none';
  border?: boolean;
  rounded?: 'sm' | 'default' | 'lg' | 'none';
  isActive?: boolean;
}

export function Card({
  className,
  children,
  shadow = 'default',
  padding = 'md',
  border = false,
  rounded = 'default',
  isActive = false,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'bg-white transition-all duration-200',
        // Тени
        {
          'shadow-app-sm': shadow === 'sm',
          'shadow-card': shadow === 'default',
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
          'border border-gray-100': border && !isActive,
          'border border-primary-300': border && isActive,
        },
        // Активная карточка
        {
          'ring-2 ring-primary-300 ring-opacity-50': isActive,
        },
        // Ховер эффект
        'hover:shadow-lg hover:-translate-y-0.5',
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
      className={cn('flex flex-col space-y-1.5 p-4', className)}
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
      className={cn('text-sm text-gray-500', className)}
      {...props}
    >
      {children}
    </p>
  );
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardContent({ className, children, ...props }: CardContentProps) {
  return (
    <div className={cn('p-4 pt-0', className)} {...props}>
      {children}
    </div>
  );
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardFooter({ className, children, ...props }: CardFooterProps) {
  return (
    <div
      className={cn('flex items-center justify-between p-4 pt-0', className)}
      {...props}
    >
      {children}
    </div>
  );
}

interface TaskCategoryProps extends React.HTMLAttributes<HTMLDivElement> {
  color: 'purple' | 'blue' | 'green' | 'red' | 'orange' | 'pink';
}

export function TaskCategory({ className, children, color, ...props }: TaskCategoryProps) {
  return (
    <div
      className={cn(
        'py-1 px-3 rounded-full text-xs font-medium inline-flex items-center',
        {
          'bg-category-purple/10 text-category-purple': color === 'purple',
          'bg-category-blue/10 text-category-blue': color === 'blue',
          'bg-category-green/10 text-category-green': color === 'green',
          'bg-category-red/10 text-category-red': color === 'red',
          'bg-category-orange/10 text-category-orange': color === 'orange',
          'bg-category-pink/10 text-category-pink': color === 'pink',
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
} 