'use client';

import React, { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, leftIcon, rightIcon, fullWidth, size = 'md', ...props }, ref) => {
    const inputClasses = {
      base: 'flex rounded-app border border-gray-300 bg-white text-gray-900 transition-colors file:border-0 file:bg-transparent placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50',
      sizes: {
        sm: 'h-8 text-sm px-3',
        md: 'h-10 px-4',
        lg: 'h-12 text-lg px-5',
      },
      fullWidth: {
        true: 'w-full',
      },
      withLeftIcon: {
        true: 'pl-10',
      },
      withRightIcon: {
        true: 'pr-10',
      },
      error: {
        true: 'border-error focus:ring-error/40',
      },
    };

    return (
      <div className={cn('flex flex-col space-y-1.5', fullWidth && 'w-full')}>
        {label && (
          <label
            className="text-sm font-medium text-gray-700"
            htmlFor={props.id}
          >
            {label}
          </label>
        )}
        <div className="relative flex">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              inputClasses.base,
              inputClasses.sizes[size],
              fullWidth && inputClasses.fullWidth.true,
              leftIcon && inputClasses.withLeftIcon.true,
              rightIcon && inputClasses.withRightIcon.true,
              error && inputClasses.error.true,
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-error">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input'; 