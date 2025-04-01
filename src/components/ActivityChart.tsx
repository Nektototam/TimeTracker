"use client";

import React, { useEffect, useRef, useState } from 'react';
import { DailySummary } from '../lib/reportService';
import { Card } from './ui/Card';

interface ActivityChartProps {
  data: DailySummary[];
  maxDuration?: number;
  height?: number;
  barColor?: string;
  title?: string;
}

const ActivityChart: React.FC<ActivityChartProps> = ({
  data,
  maxDuration,
  height = 220,
  barColor = '#7163DE',
  title = 'Активность за неделю'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  
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
    const paddingLeft = 50;
    const paddingRight = 20;
    const paddingTop = 30;
    const paddingBottom = 40;
    
    // Рабочая область графика
    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;
    
    // Шрифты и цвета
    ctx.font = '12px Inter, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    
    // Рисуем фоновые линии сетки
    const ySteps = 4; // Количество делений на оси Y
    for (let i = 0; i <= ySteps; i++) {
      const y = paddingTop + (chartHeight / ySteps) * i;
      const value = calculatedMaxDuration - (calculatedMaxDuration / ySteps) * i;
      
      // Горизонтальная сетка
      ctx.beginPath();
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(width - paddingRight, y);
      ctx.strokeStyle = '#f0f0f7';
      ctx.stroke();
      
      // Подписи к оси Y
      ctx.fillStyle = '#9CA3AF';
      ctx.textAlign = 'right';
      ctx.fillText(formatDuration(value), paddingLeft - 10, y + 4);
    }
    
    // Рисуем оси (только горизонтальную внизу)
    ctx.beginPath();
    ctx.moveTo(paddingLeft, height - paddingBottom);
    ctx.lineTo(width - paddingRight, height - paddingBottom);
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Градиент для столбцов
    const gradient = ctx.createLinearGradient(0, 0, 0, chartHeight);
    gradient.addColorStop(0, '#9B90F2');  // Светло-фиолетовый вверху
    gradient.addColorStop(1, '#7163DE');  // Темно-фиолетовый внизу
    
    // Рисуем столбцы и подписи
    data.forEach((item, index) => {
      const x = paddingLeft + barSpacing/2 + (barWidth + barSpacing) * index;
      const barHeight = (item.total_duration / calculatedMaxDuration) * chartHeight;
      const y = height - paddingBottom - barHeight;
      
      // Определяем цвет столбца (выделяем выбранный)
      const isSelected = selectedDay === index;
      
      // Рисуем столбец с закругленными краями
      ctx.beginPath();
      const radius = 6; // Радиус скругления
      
      // Верхние скругленные углы
      ctx.moveTo(x, y + radius);
      ctx.lineTo(x, y + barHeight - radius);
      ctx.arcTo(x, y + barHeight, x + radius, y + barHeight, radius);
      ctx.lineTo(x + barWidth - radius, y + barHeight);
      ctx.arcTo(x + barWidth, y + barHeight, x + barWidth, y + barHeight - radius, radius);
      ctx.lineTo(x + barWidth, y + radius);
      ctx.arcTo(x + barWidth, y, x + barWidth - radius, y, radius);
      ctx.lineTo(x + radius, y);
      ctx.arcTo(x, y, x, y + radius, radius);
      
      // Заливка с градиентом
      ctx.fillStyle = isSelected ? gradient : barColor;
      ctx.fill();
      
      // Если это выбранный столбец, добавляем тень
      if (isSelected) {
        ctx.shadowColor = 'rgba(113, 99, 222, 0.3)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4;
        ctx.fill();
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
      }
      
      // Подписи на оси X (даты)
      ctx.fillStyle = isSelected ? '#7163DE' : '#6B7280';
      ctx.textAlign = 'center';
      ctx.font = isSelected ? 'bold 12px Inter, sans-serif' : '12px Inter, sans-serif';
      ctx.fillText(formatDate(item.date), x + barWidth/2, height - paddingBottom + 20);
      
      // Значения над столбцами для выбранного столбца
      if (isSelected && item.total_duration > 0) {
        ctx.fillStyle = '#4B5563';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(formatDuration(item.total_duration), x + barWidth/2, y - 10);
      }
    });
  };
  
  // Обработчик клика по графику для выбора дня
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    
    // Вычисляем, какой столбец был выбран
    const width = canvas.width;
    const paddingLeft = 50;
    const paddingRight = 20;
    const chartWidth = width - paddingLeft - paddingRight;
    const barWidth = Math.floor(chartWidth / (data.length * 2));
    const barSpacing = barWidth;
    
    for (let i = 0; i < data.length; i++) {
      const barStart = paddingLeft + (barWidth + barSpacing) * i;
      const barEnd = barStart + barWidth + barSpacing;
      
      if (x >= barStart && x <= barEnd) {
        setSelectedDay(selectedDay === i ? null : i);
        break;
      }
    }
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
        // Устанавливаем размер с учетом плотности пикселей для ретина-дисплеев
        const dpr = window.devicePixelRatio || 1;
        canvasRef.current.width = container.clientWidth * dpr;
        canvasRef.current.height = container.clientHeight * dpr;
        canvasRef.current.style.width = `${container.clientWidth}px`;
        canvasRef.current.style.height = `${container.clientHeight}px`;
        
        // Масштабируем контекст для ретина-дисплеев
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.scale(dpr, dpr);
        }
        
        drawChart();
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Инициализация при монтировании
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [data, maxDuration, barColor, isClient, selectedDay]);
  
  // Если мы на сервере, показываем заполнитель
  if (!isClient) {
    return (
      <Card className="w-full overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-medium text-gray-800">{title}</h3>
        </div>
        <div 
          className="bg-gray-50"
          style={{
            height: `${height}px`,
            width: '100%',
          }}
        ></div>
      </Card>
    );
  }
  
  // Если нет данных, показываем сообщение
  if (data.length === 0) {
    return (
      <Card className="w-full overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-medium text-gray-800">{title}</h3>
        </div>
        <div 
          className="flex items-center justify-center"
          style={{
            height: `${height}px`,
            color: '#6B7280'
          }}
        >
          Нет данных для отображения
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="w-full overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h3 className="font-medium text-gray-800">{title}</h3>
      </div>
      <div 
        className="relative p-4"
        style={{ 
          height: `${height}px`,
          width: '100%',
        }}
      >
        <canvas 
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="cursor-pointer"
          style={{ 
            width: '100%', 
            height: '100%' 
          }}
        />
      </div>
    </Card>
  );
};

export default ActivityChart; 