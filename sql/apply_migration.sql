-- Добавляем поле для срока хранения данных
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS data_retention_period INTEGER NOT NULL DEFAULT 3;

-- Добавляем комментарий к полю
COMMENT ON COLUMN user_settings.data_retention_period IS 'Срок хранения данных в месяцах (по умолчанию 3 месяца)';

-- Обновляем существующие записи
UPDATE user_settings 
SET data_retention_period = 3 
WHERE data_retention_period IS NULL;

-- Создаем функцию для автоматической очистки старых записей
CREATE OR REPLACE FUNCTION clean_old_time_entries()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
  cutoff_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Проходим по всем пользователям
  FOR user_record IN SELECT user_id, data_retention_period FROM user_settings LOOP
    -- Вычисляем дату отсечения на основе срока хранения
    cutoff_date := NOW() - (user_record.data_retention_period || ' months')::INTERVAL;
    
    -- Удаляем записи старше даты отсечения для данного пользователя
    DELETE FROM time_entries 
    WHERE user_id = user_record.user_id 
    AND start_time < cutoff_date;
  END LOOP;
END;
$$; 