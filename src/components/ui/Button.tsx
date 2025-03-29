'use client';

import React, { ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Определяем варианты стилей для кнопки
const buttonVariants = cva(
  // Базовые стили для всех кнопок
  "flex items-center justify-center rounded-app font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      // Варианты внешнего вида
      variant: {
        primary: "bg-primary hover:bg-primary-dark text-white shadow-sm focus:ring-primary/50",
        secondary: "bg-secondary hover:bg-secondary/80 text-white shadow-sm focus:ring-secondary/50",
        outline: "border border-gray-300 bg-transparent hover:bg-gray-50 text-gray-700 focus:ring-primary/50",
        ghost: "bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-primary/50",
        danger: "bg-error hover:bg-error/90 text-white shadow-sm focus:ring-error/50",
        success: "bg-success hover:bg-success/90 text-white shadow-sm focus:ring-success/50",
      },
      // Размеры
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-lg",
        icon: "h-10 w-10",
      },
      // Закругленность углов
      rounded: {
        default: "rounded-app",
        full: "rounded-app-full",
        sm: "rounded-app-sm",
        lg: "rounded-app-lg",
      },
      // Ширина кнопки
      fullWidth: {
        true: "w-full",
      },
    },
    // Значения по умолчанию
    defaultVariants: {
      variant: "primary",
      size: "md",
      rounded: "default",
    },
  }
);

// Интерфейс для пропсов кнопки
export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// Компонент кнопки
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, rounded, fullWidth, children, isLoading, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, rounded, fullWidth, className }))}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && (
          <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants }; 