import { api } from './api';

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
      const { items } = await api.projectTypes.list();
      return items.map(item => ({ id: item.id, name: item.name }));
    } catch (error) {
      console.error('Ошибка получения пользовательских типов работ:', error);
      return [];
    }
  },
  
  // Добавление пользовательского типа работы
  addCustomWorkType: async (userId: string, name: string): Promise<WorkType> => {
    try {
      const { item } = await api.projectTypes.create(name);
      return { id: item.id, name: item.name };
    } catch (error) {
      console.error('Ошибка добавления пользовательского типа работы:', error);
      throw error;
    }
  },
  
  // Обновление пользовательского типа работы
  updateCustomWorkType: async (userId: string, id: string, name: string): Promise<void> => {
    try {
      await api.projectTypes.update(id, name);
    } catch (error) {
      console.error('Ошибка обновления пользовательского типа работы:', error);
      throw error;
    }
  },
  
  // Удаление пользовательского типа работы
  deleteCustomWorkType: async (userId: string, id: string): Promise<void> => {
    try {
      const { items } = await api.timeEntries.list({ projectType: id, limit: 1 });
      if (items.length > 0) {
        throw new Error('Cannot delete work type that is in use');
      }
      await api.projectTypes.delete(id);
    } catch (error) {
      console.error('Ошибка удаления пользовательского типа работы:', error);
      throw error;
    }
  }
};

export default workTypeService; 