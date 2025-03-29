-- Добавляем поле для срока хранения данных
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS data_retention_period INTEGER NOT NULL DEFAULT 3;

-- Добавляем комментарий к полю
COMMENT ON COLUMN user_settings.data_retention_period IS 'Срок хранения данных в месяцах (по умолчанию 3 месяца)';

-- Обновляем существующие записи
UPDATE user_settings 
SET data_retention_period = 3 
WHERE data_retention_period IS NULL; 