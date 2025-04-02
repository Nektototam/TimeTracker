"use client";

import React from 'react';
import { Button } from '../../components/ui/Button';
import Link from 'next/link';

export default function TestButtons() {
  return (
    <div className="min-h-screen bg-[#ecf0f3] px-4 py-10">
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
        <section className="mb-20 py-12 bg-[#f5f8fa] rounded-2xl px-8">
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
        
        {/* Секция с размерами */}
        <section className="mb-20">
          <h2 className="text-2xl font-medium mb-10 text-gray-700 text-center">Размеры кнопок</h2>
          <div className="flex flex-col items-center gap-10">
            <div className="flex flex-wrap gap-6 justify-center items-end">
              <Button variant="primary" size="sm">
                <span style={{ fontSize: '0.75rem' }}>Small</span>
              </Button>
              <Button variant="primary" size="md">
                <span style={{ fontSize: '0.875rem' }}>Medium</span>
              </Button>
              <Button variant="primary" size="lg">
                <span style={{ fontSize: '1rem' }}>Large</span>
              </Button>
              <Button variant="primary" size="xl">
                <span style={{ fontSize: '1.125rem', fontWeight: 600 }}>Extra Large</span>
              </Button>
            </div>
            <p className="text-center text-gray-500 text-sm">Разные размеры кнопок имеют разную высоту и минимальную ширину</p>
            
            <div className="flex flex-wrap gap-6 justify-center mt-12">
              <div className="flex flex-col items-center">
                <Button variant="primary" size="sm">
                  <span style={{ fontSize: '0.75rem' }}>Small</span>
                </Button>
                <p className="mt-4 text-gray-500 text-center text-xs">Малая</p>
              </div>
              <div className="flex flex-col items-center">
                <Button variant="primary" size="md">
                  <span style={{ fontSize: '0.875rem' }}>Medium</span>
                </Button>
                <p className="mt-4 text-gray-500 text-center text-sm">Средняя</p>
              </div>
              <div className="flex flex-col items-center">
                <Button variant="primary" size="lg">
                  <span style={{ fontSize: '1rem' }}>Large</span>
                </Button>
                <p className="mt-4 text-gray-500 text-center text-base">Большая</p>
              </div>
              <div className="flex flex-col items-center">
                <Button variant="primary" size="xl">
                  <span style={{ fontSize: '1.125rem', fontWeight: 600 }}>Extra Large</span>
                </Button>
                <p className="mt-4 text-gray-500 text-center text-lg">Очень большая</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Секция с таймером */}
        <section className="mb-20 py-12 bg-[#f5f8fa] rounded-2xl px-8">
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
        
        {/* Секция с иконками */}
        <section className="mb-20">
          <h2 className="text-2xl font-medium mb-10 text-gray-700 text-center">С иконками</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
            <div className="flex flex-col items-center">
              <Button variant="primary" size="md" leftIcon="→">Left Icon</Button>
              <p className="mt-4 text-gray-500 text-center text-sm">Иконка слева</p>
            </div>
            <div className="flex flex-col items-center">
              <Button variant="primary" size="md" rightIcon="←">Right Icon</Button>
              <p className="mt-4 text-gray-500 text-center text-sm">Иконка справа</p>
            </div>
            <div className="flex flex-col items-center">
              <Button variant="primary" size="icon">🔍</Button>
              <p className="mt-4 text-gray-500 text-center text-sm">Только иконка</p>
            </div>
          </div>
        </section>
        
        {/* Секция с состояниями */}
        <section className="mb-20 py-12 bg-[#f5f8fa] rounded-2xl px-8">
          <h2 className="text-2xl font-medium mb-10 text-gray-700 text-center">Состояния</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-24">
            <div className="flex flex-col items-center">
              <Button variant="primary" size="md" disabled>Disabled</Button>
              <p className="mt-4 text-gray-500 text-center text-sm">Неактивная</p>
            </div>
            <div className="flex flex-col items-center">
              <Button variant="primary" size="md" isLoading>Loading</Button>
              <p className="mt-4 text-gray-500 text-center text-sm">Загрузка</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-[200px]">
                <Button variant="primary" size="md" fullWidth>Full Width</Button>
              </div>
              <p className="mt-4 text-gray-500 text-center text-sm">На всю ширину</p>
            </div>
          </div>
        </section>
        
        {/* Секция демонстрации разных размеров текста */}
        <section className="mb-20">
          <h2 className="text-2xl font-medium mb-10 text-gray-700 text-center">Демонстрация автоматического размера текста</h2>
          <div className="flex flex-col items-center gap-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="flex flex-col items-center">
                <Button variant="primary" size="sm">Текст маленькой кнопки</Button>
                <p className="mt-4 text-gray-500 text-center text-sm">Размер текста для кнопки size="sm"</p>
              </div>
              <div className="flex flex-col items-center">
                <Button variant="primary" size="md">Текст средней кнопки</Button>
                <p className="mt-4 text-gray-500 text-center text-sm">Размер текста для кнопки size="md"</p>
              </div>
              <div className="flex flex-col items-center">
                <Button variant="primary" size="lg">Текст большой кнопки</Button>
                <p className="mt-4 text-gray-500 text-center text-sm">Размер текста для кнопки size="lg"</p>
              </div>
              <div className="flex flex-col items-center">
                <Button variant="primary" size="xl">Текст огромной кнопки</Button>
                <p className="mt-4 text-gray-500 text-center text-sm">Размер текста для кнопки size="xl"</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Специальный тест стилей текста */}
        <section className="mb-20 py-12 bg-[#f5f8fa] rounded-2xl px-8">
          <h2 className="text-2xl font-medium mb-10 text-gray-700 text-center">Проверка приоритета текстовых стилей</h2>
          <div className="flex flex-col gap-8 items-center">
            <div className="flex gap-8 flex-wrap justify-center">
              <Button variant="primary" size="sm">Размер XS (самый маленький)</Button>
              <Button variant="primary" size="md">Размер SM (маленький)</Button>
              <Button variant="primary" size="lg">Размер BASE (средний)</Button>
              <Button variant="primary" size="xl">Размер LG (большой)</Button>
            </div>
            <p className="text-center text-gray-500 text-sm">Эти кнопки должны иметь разный размер текста с высоким приоритетом (!important)</p>
          </div>
        </section>
        
        {/* Интерактивная демонстрация */}
        <section className="py-12 bg-[#f5f8fa] rounded-2xl px-8 mb-20">
          <h2 className="text-2xl font-medium mb-10 text-gray-700 text-center">Интерактивная демонстрация</h2>
          <p className="text-center text-gray-600 mb-8 text-base">Нажмите на кнопки, чтобы увидеть эффект при нажатии</p>
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
