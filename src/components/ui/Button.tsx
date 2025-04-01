'use client';

import React, { ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Определяем варианты стилей для кнопки
const buttonVariants = cva(
  // Базовые стили для всех кнопок
  "flex items-center justify-center font-medium transition-all focus:outline-none",
  {
    variants: {
      // Варианты внешнего вида
      variant: {
        primary: "bg-primary text-white rounded-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md",
        secondary: "bg-secondary text-white rounded-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md",
        outline: "border-2 border-gray-300 bg-transparent hover:bg-gray-50 text-gray-700 rounded-lg hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm",
        ghost: "bg-transparent hover:bg-gray-100 text-gray-700 shadow-none rounded-lg hover:shadow-sm",
        danger: "bg-error text-white rounded-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md",
        success: "bg-success text-white rounded-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md",
        timer: "bg-gradient-to-b from-primary/90 to-primary text-white rounded-lg shadow-md hover:shadow-lg hover:-translate-y-1 active:translate-y-0 active:shadow-md",
        timerStop: "bg-gradient-to-b from-error/90 to-error text-white rounded-lg shadow-md hover:shadow-lg hover:-translate-y-1 active:translate-y-0 active:shadow-md",
        // Специальный стиль для кнопки Старт, точно как на скриншоте
        buttonStart: "bg-[#5866df] text-white rounded-full py-2 px-6 shadow-[0_4px_6px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_8px_rgba(0,0,0,0.2)] relative after:absolute after:content-[''] after:left-0 after:bottom-[-6px] after:w-full after:h-[2px] after:bg-red-500",
        // Стиль для кнопки Сохранить как на скриншоте
        saveButton: "bg-white border border-[#e2e8f0] text-black py-1 px-4 shadow-sm hover:bg-gray-50",
        // Стиль для кнопки Отмена как на скриншоте
        cancelButton: "bg-white border border-[#e2e8f0] text-black py-1 px-4 shadow-sm hover:bg-gray-50",
      },
      // Размеры
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-lg",
        xl: "h-14 px-8 text-xl",
        icon: "h-10 w-10",
      },
      // Закругленность углов
      rounded: {
        default: "rounded-lg",
        full: "rounded-full",
        sm: "rounded",
        md: "rounded-xl",
        lg: "rounded-3xl",
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