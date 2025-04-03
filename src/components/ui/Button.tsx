'use client';

import React, { ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Определяем варианты стилей для кнопки в стиле неоморфизма
const buttonVariants = cva(
  // Базовые стили для всех кнопок в стиле неоморфизма
  "inline-flex items-center justify-center font-medium transition-all duration-200 select-none relative overflow-hidden",
  {
    variants: {
      // Варианты внешнего вида
      variant: {
        // Основные варианты с более насыщенными цветами
        primary: "bg-[#e9edf5] text-[#6c5ce7] border-t border-l border-[#ffffff50] border-b-[#00000015] border-r-[#00000015] shadow-[6px_6px_12px_0_rgba(0,0,0,0.15),-6px_-6px_12px_0_rgba(255,255,255,0.9)] hover:shadow-[4px_4px_8px_0_rgba(0,0,0,0.15),-4px_-4px_8px_0_rgba(255,255,255,0.9)] active:shadow-[inset_4px_4px_8px_0_rgba(0,0,0,0.15),inset_-4px_-4px_8px_0_rgba(255,255,255,0.9)]",
        secondary: "bg-[#e9edf5] text-[#8f7efc] border-t border-l border-[#ffffff50] border-b-[#00000015] border-r-[#00000015] shadow-[6px_6px_12px_0_rgba(0,0,0,0.15),-6px_-6px_12px_0_rgba(255,255,255,0.9)] hover:shadow-[4px_4px_8px_0_rgba(0,0,0,0.15),-4px_-4px_8px_0_rgba(255,255,255,0.9)] active:shadow-[inset_4px_4px_8px_0_rgba(0,0,0,0.15),inset_-4px_-4px_8px_0_rgba(255,255,255,0.9)]",
        outline: "bg-[#e9edf5] text-gray-700 border border-[#00000020] shadow-[6px_6px_12px_0_rgba(0,0,0,0.15),-6px_-6px_12px_0_rgba(255,255,255,0.9)] hover:shadow-[4px_4px_8px_0_rgba(0,0,0,0.15),-4px_-4px_8px_0_rgba(255,255,255,0.9)] active:shadow-[inset_4px_4px_8px_0_rgba(0,0,0,0.15),inset_-4px_-4px_8px_0_rgba(255,255,255,0.9)]",
        ghost: "bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200",
        danger: "bg-[#e9edf5] text-[#e82d61] font-medium border-t border-l border-[#ffffff50] border-b-[#00000015] border-r-[#00000015] shadow-[6px_6px_12px_0_rgba(0,0,0,0.15),-6px_-6px_12px_0_rgba(255,255,255,0.9)] hover:shadow-[4px_4px_8px_0_rgba(0,0,0,0.15),-4px_-4px_8px_0_rgba(255,255,255,0.9)] active:shadow-[inset_4px_4px_8px_0_rgba(0,0,0,0.15),inset_-4px_-4px_8px_0_rgba(255,255,255,0.9)]",
        success: "bg-[#e9edf5] text-[#00b677] font-medium border-t border-l border-[#ffffff50] border-b-[#00000015] border-r-[#00000015] shadow-[6px_6px_12px_0_rgba(0,0,0,0.15),-6px_-6px_12px_0_rgba(255,255,255,0.9)] hover:shadow-[4px_4px_8px_0_rgba(0,0,0,0.15),-4px_-4px_8px_0_rgba(255,255,255,0.9)] active:shadow-[inset_4px_4px_8px_0_rgba(0,0,0,0.15),inset_-4px_-4px_8px_0_rgba(255,255,255,0.9)]",
        
        // Специфичные варианты с более насыщенными цветами
        timer: "bg-[#e8efff] text-[#6c5ce7] font-medium border-t border-l border-[#ffffff50] border-b-[#00000015] border-r-[#00000015] shadow-[6px_6px_12px_0_rgba(0,0,0,0.15),-6px_-6px_12px_0_rgba(255,255,255,0.9)] hover:shadow-[4px_4px_8px_0_rgba(0,0,0,0.15),-4px_-4px_8px_0_rgba(255,255,255,0.9)] active:shadow-[inset_4px_4px_8px_0_rgba(0,0,0,0.15),inset_-4px_-4px_8px_0_rgba(255,255,255,0.9)]",
        timerStop: "bg-[#fff0f5] text-[#e82d61] font-medium border-t border-l border-[#ffffff50] border-b-[#00000015] border-r-[#00000015] shadow-[6px_6px_12px_0_rgba(0,0,0,0.15),-6px_-6px_12px_0_rgba(255,255,255,0.9)] hover:shadow-[4px_4px_8px_0_rgba(0,0,0,0.15),-4px_-4px_8px_0_rgba(255,255,255,0.9)] active:shadow-[inset_4px_4px_8px_0_rgba(0,0,0,0.15),inset_-4px_-4px_8px_0_rgba(255,255,255,0.9)]",
        buttonStart: "bg-[#edfff8] text-[#00b677] font-medium border-t border-l border-[#ffffff50] border-b-[#00000015] border-r-[#00000015] shadow-[6px_6px_12px_0_rgba(0,0,0,0.15),-6px_-6px_12px_0_rgba(255,255,255,0.9)] hover:shadow-[4px_4px_8px_0_rgba(0,0,0,0.15),-4px_-4px_8px_0_rgba(255,255,255,0.9)] active:shadow-[inset_4px_4px_8px_0_rgba(0,0,0,0.15),inset_-4px_-4px_8px_0_rgba(255,255,255,0.9)]",
        saveButton: "bg-[#e8efff] text-[#6c5ce7] font-medium border-t border-l border-[#ffffff50] border-b-[#00000015] border-r-[#00000015] shadow-[6px_6px_12px_0_rgba(0,0,0,0.15),-6px_-6px_12px_0_rgba(255,255,255,0.9)] hover:shadow-[4px_4px_8px_0_rgba(0,0,0,0.15),-4px_-4px_8px_0_rgba(255,255,255,0.9)] active:shadow-[inset_4px_4px_8px_0_rgba(0,0,0,0.15),inset_-4px_-4px_8px_0_rgba(255,255,255,0.9)]",
        cancelButton: "bg-[#f2f4f7] text-gray-700 border-t border-l border-[#ffffff50] border-b-[#00000015] border-r-[#00000015] shadow-[6px_6px_12px_0_rgba(0,0,0,0.15),-6px_-6px_12px_0_rgba(255,255,255,0.9)] hover:shadow-[4px_4px_8px_0_rgba(0,0,0,0.15),-4px_-4px_8px_0_rgba(255,255,255,0.9)] active:shadow-[inset_4px_4px_8px_0_rgba(0,0,0,0.15),inset_-4px_-4px_8px_0_rgba(255,255,255,0.9)]",
      },
      // Размеры с правильными пропорциями
      size: {
        sm: "min-h-8 min-w-[80px] px-3 py-1.5 !text-xs",
        md: "min-h-10 min-w-[100px] px-4 py-2 !text-sm",
        lg: "min-h-12 min-w-[130px] px-6 py-3 !text-base",
        xl: "min-h-14 min-w-[160px] px-8 py-4 !text-lg !font-semibold",
        icon: "h-10 w-10 p-2",
      },
      // Уровни скругления
      rounded: {
        none: "rounded-none",
        sm: "rounded-sm",
        md: "rounded-md",
        lg: "rounded-lg",
        xl: "rounded-xl",
        full: "rounded-full",
        // Неоморфные стандартные скругления
        default: "rounded-[14px]",
      },
      // Уровни тени (в неоморфизме не используются, оставлены для совместимости)
      elevation: {
        none: "",
        sm: "",
        md: "",
        lg: "",
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
      elevation: "none",
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
  ({ className, variant, size, rounded, elevation, fullWidth, children, isLoading, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, rounded, elevation, fullWidth, className }), 
          props.disabled ? "opacity-50 pointer-events-none" : "")}
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