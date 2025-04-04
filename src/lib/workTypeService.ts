import { supabase } from './supabase';

// Интерфейс для типа работы
interface WorkType {
  id: string;
  name: string;
}

// Стандартные типы работ
const standardWorkTypes = [
  'Веб-разработка',
  'Дизайн',
  'Маркетинг',
  'Совещание',
  'Другое'
];

// Сервис для работы с типами работ
export const workTypeService = {
  // Получение стандартных типов работ
  getStandardWorkTypes: async (): Promise<string[]> => {
    return standardWorkTypes;
  },
  
  // Получение пользовательских типов работ
  getCustomWorkTypes: async (userId: string): Promise<WorkType[]> => {
    try {
      const { data, error } = await supabase
        .from('project_types')
        .select('id, name')
        .eq('user_id', userId)
        .order('name');
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data || [];
    } catch (error) {
      console.error('Ошибка получения пользовательских типов работ:', error);
      return [];
    }
  },
  
  // Добавление пользовательского типа работы
  addCustomWorkType: async (userId: string, name: string): Promise<WorkType> => {
    try {
      const { data, error } = await supabase
        .from('project_types')
        .insert([{ name, user_id: userId }])
        .select('id, name')
        .single();
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data as WorkType;
    } catch (error) {
      console.error('Ошибка добавления пользовательского типа работы:', error);
      throw error;
    }
  },
  
  // Обновление пользовательского типа работы
  updateCustomWorkType: async (userId: string, id: string, name: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('project_types')
        .update({ name })
        .eq('id', id)
        .eq('user_id', userId);
      
      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Ошибка обновления пользовательского типа работы:', error);
      throw error;
    }
  },
  
  // Удаление пользовательского типа работы
  deleteCustomWorkType: async (userId: string, id: string): Promise<void> => {
    try {
      // Сначала проверяем, используется ли тип в записях времени
      const { data: entries, error: entriesError } = await supabase
        .from('time_entries')
        .select('id')
        .eq('project_type', id)
        .limit(1);
      
      if (entriesError) {
        throw new Error(entriesError.message);
      }
      
      if (entries && entries.length > 0) {
        throw new Error('Cannot delete work type that is in use');
      }
      
      // Если тип не используется, удаляем его
      const { error } = await supabase
        .from('project_types')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      
      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Ошибка удаления пользовательского типа работы:', error);
      throw error;
    }
  }
};

export default workTypeService; 