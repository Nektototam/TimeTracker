"use client";

import React from 'react';
import { Button } from '../../components/ui/Button';
import Link from 'next/link';

export default function TestButtons() {
  return (
    <div className="min-h-screen bg-[#ecf0f3] px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <Link href="/" className="text-blue-600 hover:underline mb-6 block font-medium">
          ← Вернуться на главную
        </Link>
        
        <h1 className="text-3xl font-bold mb-12 text-gray-700 text-center">Тест неоморфных кнопок</h1>
        
        {/* Секция с несколькими кнопками в ряд */}
        <section className="mb-20">
          <h2 className="text-xl font-medium mb-10 text-gray-700 text-center">Основные варианты</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
            <div className="flex flex-col items-center">
              <Button variant="primary" size="md">Primary</Button>
              <p className="mt-4 text-gray-500 text-center">Основная кнопка</p>
            </div>
            <div className="flex flex-col items-center">
              <Button variant="secondary" size="md">Secondary</Button>
              <p className="mt-4 text-gray-500 text-center">Вторичная кнопка</p>
            </div>
            <div className="flex flex-col items-center">
              <Button variant="danger" size="md">Danger</Button>
              <p className="mt-4 text-gray-500 text-center">Кнопка с предупреждением</p>
            </div>
          </div>
        </section>
        
        {/* Секция с разными текстами */}
        <section className="mb-20 py-12 bg-[#f5f8fa] rounded-2xl px-8">
          <h2 className="text-xl font-medium mb-10 text-gray-700 text-center">Разная длина текста</h2>
          <div className="flex flex-col gap-8 items-center">
            <div className="flex gap-8 flex-wrap justify-center">
              <Button variant="primary" size="md">OK</Button>
              <Button variant="primary" size="md">Подтвердить</Button>
              <Button variant="primary" size="md">Отправить заявку</Button>
              <Button variant="primary" size="md">Очень длинный текст кнопки</Button>
            </div>
            <p className="text-center text-gray-500">Размер кнопки автоматически адаптируется под содержимое</p>
          </div>
        </section>
        
        {/* Секция с размерами */}
        <section className="mb-20">
          <h2 className="text-xl font-medium mb-10 text-gray-700 text-center">Размеры кнопок</h2>
          <div className="flex flex-col items-center gap-10">
            <div className="flex flex-wrap gap-6 justify-center items-end">
              <Button variant="primary" size="sm">Small</Button>
              <Button variant="primary" size="md">Medium</Button>
              <Button variant="primary" size="lg">Large</Button>
              <Button variant="primary" size="xl">Extra Large</Button>
            </div>
            <p className="text-center text-gray-500">Разные размеры кнопок имеют разную высоту и минимальную ширину</p>
            
            <div className="flex flex-wrap gap-6 justify-center mt-12">
              <div className="flex flex-col items-center">
                <Button variant="primary" size="sm">Small</Button>
                <p className="mt-4 text-gray-500 text-center">Малая</p>
              </div>
              <div className="flex flex-col items-center">
                <Button variant="primary" size="md">Medium</Button>
                <p className="mt-4 text-gray-500 text-center">Средняя</p>
              </div>
              <div className="flex flex-col items-center">
                <Button variant="primary" size="lg">Large</Button>
                <p className="mt-4 text-gray-500 text-center">Большая</p>
              </div>
              <div className="flex flex-col items-center">
                <Button variant="primary" size="xl">Extra Large</Button>
                <p className="mt-4 text-gray-500 text-center">Очень большая</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Секция с таймером */}
        <section className="mb-20 py-12 bg-[#f5f8fa] rounded-2xl px-8">
          <h2 className="text-xl font-medium mb-10 text-gray-700 text-center">Кнопки таймера</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-24 justify-items-center">
            <div className="flex flex-col items-center">
              <Button variant="timer" size="lg">Start Timer</Button>
              <p className="mt-4 text-gray-500 text-center">Запуск таймера</p>
            </div>
            <div className="flex flex-col items-center">
              <Button variant="timerStop" size="lg">Stop Timer</Button>
              <p className="mt-4 text-gray-500 text-center">Остановка таймера</p>
            </div>
          </div>
        </section>
        
        {/* Секция с иконками */}
        <section className="mb-20">
          <h2 className="text-xl font-medium mb-10 text-gray-700 text-center">С иконками</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
            <div className="flex flex-col items-center">
              <Button variant="primary" size="md" leftIcon="→">Left Icon</Button>
              <p className="mt-4 text-gray-500 text-center">Иконка слева</p>
            </div>
            <div className="flex flex-col items-center">
              <Button variant="primary" size="md" rightIcon="←">Right Icon</Button>
              <p className="mt-4 text-gray-500 text-center">Иконка справа</p>
            </div>
            <div className="flex flex-col items-center">
              <Button variant="primary" size="icon">🔍</Button>
              <p className="mt-4 text-gray-500 text-center">Только иконка</p>
            </div>
          </div>
        </section>
        
        {/* Секция с состояниями */}
        <section className="mb-20 py-12 bg-[#f5f8fa] rounded-2xl px-8">
          <h2 className="text-xl font-medium mb-10 text-gray-700 text-center">Состояния</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-24">
            <div className="flex flex-col items-center">
              <Button variant="primary" size="md" disabled>Disabled</Button>
              <p className="mt-4 text-gray-500 text-center">Неактивная</p>
            </div>
            <div className="flex flex-col items-center">
              <Button variant="primary" size="md" isLoading>Loading</Button>
              <p className="mt-4 text-gray-500 text-center">Загрузка</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-[200px]">
                <Button variant="primary" size="md" fullWidth>Full Width</Button>
              </div>
              <p className="mt-4 text-gray-500 text-center">На всю ширину</p>
            </div>
          </div>
        </section>
        
        {/* Интерактивная демонстрация */}
        <section className="py-12 bg-[#f5f8fa] rounded-2xl px-8 mb-20">
          <h2 className="text-xl font-medium mb-10 text-gray-700 text-center">Интерактивная демонстрация</h2>
          <p className="text-center text-gray-600 mb-8">Нажмите на кнопки, чтобы увидеть эффект при нажатии</p>
          <div className="flex flex-wrap justify-center gap-8">
            <Button variant="primary" size="sm">Маленькая</Button>
            <Button variant="primary" size="md">Средняя</Button>
            <Button variant="primary" size="lg">Большая</Button>
            <Button variant="primary" size="xl">Огромная</Button>
          </div>
        </section>
      </div>
    </div>
  );
}
