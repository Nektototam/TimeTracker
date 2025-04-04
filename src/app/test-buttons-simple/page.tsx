"use client";

import React from 'react';
import Link from 'next/link';

export default function TestButtonsSimple() {
  return (
    <div className="min-h-screen bg-[#ecf0f3] px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <Link href="/" className="text-blue-600 hover:underline mb-6 block font-medium text-sm">
          ← Вернуться на главную
        </Link>
        
        <h1 className="text-4xl font-bold mb-12 text-gray-700 text-center">Тест простых кнопок</h1>
        
        <div className="flex flex-col gap-10 items-center">
          <div className="flex flex-wrap gap-6 justify-center items-end">
            <button className="min-h-8 min-w-[80px] px-3 py-1.5 text-xs bg-blue-500 text-white rounded-lg">
              Текст XS
            </button>
            
            <button className="min-h-10 min-w-[100px] px-4 py-2 text-sm bg-blue-500 text-white rounded-lg">
              Текст SM
            </button>
            
            <button className="min-h-12 min-w-[130px] px-6 py-3 text-base bg-blue-500 text-white rounded-lg">
              Текст BASE
            </button>
            
            <button className="min-h-14 min-w-[160px] px-8 py-4 text-lg font-semibold bg-blue-500 text-white rounded-lg">
              Текст LG
            </button>
          </div>
          
          <p className="text-center text-gray-500 text-base">
            Эта страница демонстрирует разные размеры текста в кнопках: text-xs, text-sm, text-base и text-lg
          </p>
        </div>
      </div>
    </div>
  );
} 