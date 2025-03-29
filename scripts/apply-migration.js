const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Загружаем переменные окружения
require('dotenv').config({ path: '.env.local' });

// Получаем URL и ключи Supabase из .env
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Ошибка: Не найдены переменные окружения NEXT_PUBLIC_SUPABASE_URL или NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

// Создаем клиент Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration(filePath) {
  try {
    const sql = fs.readFileSync(filePath, 'utf8');
    
    console.log(`Применяю миграцию из ${filePath}...`);
    
    // Выполняем SQL через REST API Supabase
    const { error } = await supabase.rpc('exec_sql', { query: sql });
    
    if (error) {
      console.error('Ошибка при выполнении миграции:', error);
      return false;
    }
    
    console.log('Миграция успешно применена!');
    return true;
  } catch (error) {
    console.error('Ошибка при чтении или выполнении миграции:', error);
    return false;
  }
}

async function main() {
  const migrationPath = path.join(__dirname, '..', 'sql', 'migrations', '01_add_data_retention_period.sql');
  
  if (!fs.existsSync(migrationPath)) {
    console.error(`Файл миграции не найден: ${migrationPath}`);
    process.exit(1);
  }
  
  const success = await applyMigration(migrationPath);
  
  if (success) {
    console.log('Все миграции успешно применены.');
  } else {
    console.error('Произошла ошибка при применении миграций.');
    process.exit(1);
  }
}

main(); 