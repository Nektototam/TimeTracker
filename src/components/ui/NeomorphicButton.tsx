'use client';

import React, { ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Определяем варианты стилей для неоморфной кнопки
const neomorphicButtonVariants = cva(
  // Базовые стили для всех кнопок в неоморфном стиле
  "inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-200 select-none",
  {
    variants: {
      // Варианты внешнего вида
      variant: {
        // Основные варианты
        primary: "bg-[#e9edf5] text-[#6c5ce7] border-t border-l border-[#ffffff50] border-b-[#00000015] border-r-[#00000015] shadow-[3px_3px_6px_rgba(0,0,0,0.1),-3px_-3px_6px_rgba(255,255,255,0.8)] hover:shadow-[2px_2px_4px_rgba(0,0,0,0.1),-2px_-2px_4px_rgba(255,255,255,0.8)] active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]",
        danger: "bg-[#fff0f5] text-[#e82d61] border-t border-l border-[#ffffff50] border-b-[#00000015] border-r-[#00000015] shadow-[3px_3px_6px_rgba(0,0,0,0.1),-3px_-3px_6px_rgba(255,255,255,0.8)] hover:shadow-[2px_2px_4px_rgba(0,0,0,0.1),-2px_-2px_4px_rgba(255,255,255,0.8)] active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]",
        success: "bg-[#edfff8] text-[#00b677] border-t border-l border-[#ffffff50] border-b-[#00000015] border-r-[#00000015] shadow-[3px_3px_6px_rgba(0,0,0,0.1),-3px_-3px_6px_rgba(255,255,255,0.8)] hover:shadow-[2px_2px_4px_rgba(0,0,0,0.1),-2px_-2px_4px_rgba(255,255,255,0.8)] active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]",
      },
      size: {
        sm: "min-h-[44px] py-2.5 px-5 text-sm rounded-[14px]",
        md: "min-h-[50px] py-3 px-6 text-base rounded-[16px]",
        lg: "min-h-[56px] py-3.5 px-8 text-lg rounded-[18px]",
        icon: "h-12 w-12 p-2.5 rounded-full",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface NeomorphicButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof neomorphicButtonVariants> {
  children: React.ReactNode;
}

export const NeomorphicButton = React.forwardRef<HTMLButtonElement, NeomorphicButtonProps>(
  ({ className, variant, size, fullWidth, children, ...props }, ref) => {
    return (
      <button
        className={cn(neomorphicButtonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

NeomorphicButton.displayName = 'NeomorphicButton'; 