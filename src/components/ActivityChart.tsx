"use client";

import React, { useEffect, useRef, useState } from 'react';
import { DailySummary } from '../lib/reportService';

interface ActivityChartProps {
  data: DailySummary[];
  maxDuration?: number;
  height?: number;
  barColor?: string;
}

const ActivityChart: React.FC<ActivityChartProps> = ({
  data,
  maxDuration,
  height = 180,
  barColor = '#5e72e4'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isClient, setIsClient] = useState(false);
  
  // Устанавливаем флаг клиентского рендеринга
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Функция для форматирования даты
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' });
  };
  
  // Функция для форматирования времени
  const formatDuration = (ms: number): string => {
    const hours = Math.floor(ms / 3600000);
    const mins = Math.floor((ms % 3600000) / 60000);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };
  
  // Отрисовка графика
  const drawChart = () => {
    // Проверяем, что мы на клиенте
    if (!isClient) return;
    
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Получаем размеры canvas
    const width = canvas.width;
    const height = canvas.height;
    
    // Очищаем canvas
    ctx.clearRect(0, 0, width, height);
    
    // Вычисляем максимальную продолжительность для масштабирования
    const calculatedMaxDuration = maxDuration || Math.max(...data.map(d => d.total_duration));
    
    // Вычисляем размеры столбцов
    const barWidth = Math.floor(width / (data.length * 2)); // Половина доступной ширины для отступов
    const barSpacing = barWidth; // Отступ равен ширине столбца
    
    // Отступы от краев
    const paddingLeft = 40;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 40;
    
    // Рабочая область графика
    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;
    
    // Шрифты и цвета
    ctx.font = '10px Arial';
    ctx.fillStyle = '#666';
    ctx.textAlign = 'center';
    
    // Рисуем оси
    ctx.beginPath();
    ctx.moveTo(paddingLeft, paddingTop);
    ctx.lineTo(paddingLeft, height - paddingBottom);
    ctx.lineTo(width - paddingRight, height - paddingBottom);
    ctx.strokeStyle = '#ddd';
    ctx.stroke();
    
    // Рисуем шкалу Y (время)
    const ySteps = 4; // Количество делений на оси Y
    for (let i = 0; i <= ySteps; i++) {
      const y = paddingTop + (chartHeight / ySteps) * i;
      const value = calculatedMaxDuration - (calculatedMaxDuration / ySteps) * i;
      
      // Горизонтальная сетка
      ctx.beginPath();
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(width - paddingRight, y);
      ctx.strokeStyle = '#eee';
      ctx.stroke();
      
      // Подписи к оси Y
      ctx.fillStyle = '#666';
      ctx.textAlign = 'right';
      ctx.fillText(formatDuration(value), paddingLeft - 5, y + 3);
    }
    
    // Рисуем столбцы и подписи
    data.forEach((item, index) => {
      const x = paddingLeft + barSpacing/2 + (barWidth + barSpacing) * index;
      const barHeight = (item.total_duration / calculatedMaxDuration) * chartHeight;
      const y = height - paddingBottom - barHeight;
      
      // Рисуем столбец
      ctx.fillStyle = barColor;
      ctx.fillRect(x, y, barWidth, barHeight);
      
      // Подписи на оси X (даты)
      ctx.fillStyle = '#666';
      ctx.textAlign = 'center';
      ctx.fillText(formatDate(item.date), x + barWidth/2, height - paddingBottom + 15);
      
      // Значения над столбцами
      if (item.total_duration > 0) {
        ctx.fillStyle = '#333';
        ctx.textAlign = 'center';
        ctx.fillText(formatDuration(item.total_duration), x + barWidth/2, y - 5);
      }
    });
  };
  
  // Перерисовываем график при изменении данных или размеров
  useEffect(() => {
    if (!isClient) return;
    
    drawChart();
    
    // Обработчик изменения размера окна
    const handleResize = () => {
      if (!canvasRef.current) return;
      
      // Устанавливаем размеры canvas в соответствии с его контейнером
      const container = canvasRef.current.parentElement;
      if (container) {
        canvasRef.current.width = container.clientWidth;
        canvasRef.current.height = container.clientHeight;
        drawChart();
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Инициализация при монтировании
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [data, maxDuration, barColor, isClient]);
  
  // Если мы на сервере, показываем заполнитель
  if (!isClient) {
    return (
      <div
        className="w-full rounded-xl bg-primary/5"
        style={{ height: `${height}px` }}
      ></div>
    );
  }
  
  // Если нет данных, показываем сообщение
  if (data.length === 0) {
    return (
      <div
        className="flex w-full items-center justify-center rounded-xl bg-primary/5 text-sm text-muted-foreground"
        style={{ height: `${height}px` }}
      >
        Нет данных для отображения
      </div>
    );
  }
  
  return (
    <div
      className="relative w-full overflow-hidden rounded-xl bg-primary/5"
      style={{ height: `${height}px` }}
    >
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default ActivityChart; 