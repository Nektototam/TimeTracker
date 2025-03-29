import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CustomProjectType } from '../types/supabase';

interface UseCustomProjectTypesReturn {
  projectTypes: CustomProjectType[];
  isLoading: boolean;
  error: Error | null;
  addProjectType: (name: string, userId: string) => Promise<CustomProjectType | null>;
  updateProjectType: (id: string, name: string) => Promise<CustomProjectType | null>;
  deleteProjectType: (id: string) => Promise<boolean>;
}

export function useCustomProjectTypes(userId?: string): UseCustomProjectTypesReturn {
  const [projectTypes, setProjectTypes] = useState<CustomProjectType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Загрузка типов проектов при инициализации хука
  useEffect(() => {
    async function fetchProjectTypes() {
      try {
        setIsLoading(true);
        
        let query = supabase
          .from('custom_project_types')
          .select('*')
          .order('name', { ascending: true });
          
        // Если указан userId, фильтруем по пользователю
        if (userId) {
          query = query.eq('user_id', userId);
        }

        const { data, error } = await query;

        if (error) throw new Error(error.message);
        
        setProjectTypes(data || []);
      } catch (err) {
        console.error('Ошибка при загрузке типов проектов:', err);
        setError(err instanceof Error ? err : new Error('Неизвестная ошибка'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchProjectTypes();
  }, [userId]);

  // Добавление нового типа проекта
  async function addProjectType(name: string, userId: string): Promise<CustomProjectType | null> {
    try {
      const newType: Omit<CustomProjectType, 'id' | 'created_at'> = {
        user_id: userId,
        name: name
      };
      
      const { data, error } = await supabase
        .from('custom_project_types')
        .insert([newType])
        .select()
        .single();

      if (error) throw new Error(error.message);
      
      // Обновляем локальное состояние
      if (data) {
        setProjectTypes(prev => [...prev, data]);
      }
      
      return data;
    } catch (err) {
      console.error('Ошибка при добавлении типа проекта:', err);
      setError(err instanceof Error ? err : new Error('Неизвестная ошибка'));
      return null;
    }
  }

  // Обновление существующего типа проекта
  async function updateProjectType(id: string, name: string): Promise<CustomProjectType | null> {
    try {
      const { data, error } = await supabase
        .from('custom_project_types')
        .update({ name })
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      
      // Обновляем локальное состояние
      if (data) {
        setProjectTypes(prev => prev.map(type => 
          type.id === id ? { ...type, name } : type
        ));
      }
      
      return data;
    } catch (err) {
      console.error('Ошибка при обновлении типа проекта:', err);
      setError(err instanceof Error ? err : new Error('Неизвестная ошибка'));
      return null;
    }
  }

  // Удаление типа проекта
  async function deleteProjectType(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('custom_project_types')
        .delete()
        .eq('id', id);

      if (error) throw new Error(error.message);
      
      // Обновляем локальное состояние
      setProjectTypes(prev => prev.filter(type => type.id !== id));
      
      return true;
    } catch (err) {
      console.error('Ошибка при удалении типа проекта:', err);
      setError(err instanceof Error ? err : new Error('Неизвестная ошибка'));
      return false;
    }
  }

  return {
    projectTypes,
    isLoading,
    error,
    addProjectType,
    updateProjectType,
    deleteProjectType
  };
} 