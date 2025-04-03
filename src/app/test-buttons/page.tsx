"use client";

import React from 'react';
import { Button } from '../../components/ui/Button';
import Link from 'next/link';

export default function TestButtons() {
  return (
    <div className="min-h-screen bg-[#e2e8f0] px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <Link href="/" className="text-blue-600 hover:underline mb-6 block font-medium text-sm">
          ← Вернуться на главную
        </Link>
        
        <h1 className="text-4xl font-bold mb-12 text-gray-700 text-center">Тест неоморфных кнопок</h1>
        
        {/* Секция с несколькими кнопками в ряд */}
        <section className="mb-20">
          <h2 className="text-2xl font-medium mb-10 text-gray-700 text-center">Основные варианты</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
            <div className="flex flex-col items-center">
              <Button variant="primary" size="md">Основная кнопка</Button>
              <p className="mt-4 text-gray-500 text-center text-sm">Основная кнопка</p>
            </div>
            <div className="flex flex-col items-center">
              <Button variant="secondary" size="md">Вторичная кнопка</Button>
              <p className="mt-4 text-gray-500 text-center text-sm">Вторичная кнопка</p>
            </div>
            <div className="flex flex-col items-center">
              <Button variant="danger" size="md">Кнопка с предупреждением</Button>
              <p className="mt-4 text-gray-500 text-center text-sm">Кнопка с предупреждением</p>
            </div>
          </div>
        </section>
        
        {/* Секция с разными текстами */}
        <section className="mb-20 py-12 bg-[#ebeff5] rounded-2xl px-8">
          <h2 className="text-2xl font-medium mb-10 text-gray-700 text-center">Разная длина текста</h2>
          <div className="flex flex-col gap-8 items-center">
            <div className="flex gap-8 flex-wrap justify-center">
              <Button variant="primary" size="md">OK</Button>
              <Button variant="primary" size="md">Подтвердить</Button>
              <Button variant="primary" size="md">Отправить заявку</Button>
              <Button variant="primary" size="md">Очень длинный текст кнопки</Button>
            </div>
            <p className="text-center text-gray-500 text-sm">Размер кнопки автоматически адаптируется под содержимое</p>
          </div>
        </section>
        
        {/* Секция с таймером */}
        <section className="mb-20 py-12 bg-[#ebeff5] rounded-2xl px-8">
          <h2 className="text-2xl font-medium mb-10 text-gray-700 text-center">Кнопки таймера</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-24 justify-items-center">
            <div className="flex flex-col items-center">
              <Button variant="timer" size="lg">Start Timer</Button>
              <p className="mt-4 text-gray-500 text-center text-sm">Запуск таймера</p>
            </div>
            <div className="flex flex-col items-center">
              <Button variant="timerStop" size="lg">Stop Timer</Button>
              <p className="mt-4 text-gray-500 text-center text-sm">Остановка таймера</p>
            </div>
          </div>
        </section>
        
        {/* Интерактивная демонстрация */}
        <section className="py-12 bg-[#ebeff5] rounded-2xl px-8 mb-20">
          <h2 className="text-2xl font-medium mb-10 text-gray-700 text-center">Интерактивная демонстрация</h2>
          <p className="text-center text-gray-600 mb-8 text-base">Нажмите на кнопки, чтобы увидеть эффект при нажатии</p>
          <div className="flex flex-wrap justify-center gap-8">
            <Button variant="primary" size="md">Основная</Button>
            <Button variant="timer" size="md">Таймер</Button>
            <Button variant="timerStop" size="md">Стоп</Button>
            <Button variant="buttonStart" size="md">Начать</Button>
          </div>
        </section>
      </div>
    </div>
  );
}
