'use client';

import React, { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  inputSize?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'neomorphic';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, leftIcon, rightIcon, fullWidth, inputSize = 'md', variant = 'default', ...props }, ref) => {
    const inputClasses = {
      base: {
        default: 'flex rounded-app border border-gray-300 bg-white text-gray-900 transition-colors file:border-0 file:bg-transparent placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50',
        neomorphic: 'flex bg-[#e9edf5] text-gray-700 transition-all border-t border-l border-[#ffffff50] border-b-[#00000015] border-r-[#00000015] shadow-[inset_3px_3px_6px_rgba(0,0,0,0.1),inset_-3px_-3px_6px_rgba(255,255,255,0.7)] focus:outline-none focus:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.15),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] disabled:opacity-60 disabled:cursor-not-allowed placeholder:text-gray-500'
      },
      sizes: {
        sm: {
          default: 'h-8 text-sm px-3 rounded-md',
          neomorphic: 'min-h-[44px] py-2 px-4 text-sm rounded-[12px]'
        },
        md: {
          default: 'h-10 px-4 rounded-md',
          neomorphic: 'min-h-[50px] py-3 px-5 text-base rounded-[14px]'
        },
        lg: {
          default: 'h-12 text-lg px-5 rounded-md',
          neomorphic: 'min-h-[56px] py-3.5 px-6 text-lg rounded-[16px]'
        },
      },
      fullWidth: {
        true: 'w-full',
      },
      withLeftIcon: {
        default: 'pl-10',
        neomorphic: 'pl-12',
      },
      withRightIcon: {
        default: 'pr-10',
        neomorphic: 'pr-12',
      },
      error: {
        default: 'border-error focus:ring-error/40',
        neomorphic: 'shadow-[inset_3px_3px_6px_rgba(220,38,38,0.15),inset_-3px_-3px_6px_rgba(255,255,255,0.7)] focus:shadow-[inset_4px_4px_8px_rgba(220,38,38,0.2),inset_-4px_-4px_8px_rgba(255,255,255,0.7)]',
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
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 z-10">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              inputClasses.base[variant],
              inputClasses.sizes[inputSize][variant],
              fullWidth && inputClasses.fullWidth.true,
              leftIcon && inputClasses.withLeftIcon[variant],
              rightIcon && inputClasses.withRightIcon[variant],
              error && inputClasses.error[variant],
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 z-10">
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