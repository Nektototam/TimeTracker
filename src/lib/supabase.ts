import { createClient } from '@supabase/supabase-js';

// Получаем URL и Anon Key из переменных окружения
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Проверка наличия ключей
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL или Anon Key не установлены. Проверьте переменные окружения.');
}

// Создаем и экспортируем клиент
export const supabase = createClient(supabaseUrl, supabaseAnonKey); 