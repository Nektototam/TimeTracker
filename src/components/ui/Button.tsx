'use client';

import React, { ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Определяем варианты стилей для кнопки
const buttonVariants = cva(
  // Базовые стили для всех кнопок
  "flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:ring-offset-1",
  {
    variants: {
      // Варианты внешнего вида
      variant: {
        primary: "bg-gradient-to-r from-primary-400 to-primary text-white shadow-button hover:shadow-lg hover:-translate-y-1 active:translate-y-0 active:shadow-button",
        secondary: "bg-gradient-to-br from-gray-400 to-gray-500 text-white shadow-app-sm hover:shadow-md hover:bg-opacity-90 hover:-translate-y-0.5 active:translate-y-0",
        outline: "border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0",
        ghost: "bg-transparent hover:bg-gray-100 text-gray-700 shadow-none",
        danger: "bg-gradient-to-r from-error to-error-dark text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0",
        success: "bg-gradient-to-r from-success to-success-dark text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0",
        timer: "bg-gradient-to-r from-primary-300 to-primary-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 active:translate-y-0",
        timerStop: "bg-gradient-to-r from-error to-error-dark text-white shadow-lg hover:shadow-xl hover:-translate-y-1 active:translate-y-0",
        // Стиль для кнопок таймера, как на скриншоте
        timerControl: "bg-white text-gray-700 shadow-lg hover:shadow-xl h-14 w-14 rounded-full flex items-center justify-center hover:-translate-y-1",
        // Стиль для кнопок переключения (День/Неделя)
        toggle: "bg-gray-100 text-gray-700 hover:bg-gray-200",
        // Стиль для вкладок категорий
        category: "py-1 px-3 text-xs rounded-full font-medium",
      },
      // Размеры
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6",
        lg: "h-14 px-8 text-base",
        xl: "h-16 px-10 text-lg",
        icon: "p-2 aspect-square",
      },
      // Закругленность углов
      rounded: {
        default: "rounded-app",
        full: "rounded-full",
        sm: "rounded-app-sm",
        md: "rounded-app",
        lg: "rounded-app-lg",
        none: "rounded-none",
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
      rounded: "full", // По умолчанию теперь кнопки круглые, как на скриншоте
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
        className={cn(buttonVariants({ variant, size, rounded, fullWidth }), className)}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && (
          <svg className="mr-2 h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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