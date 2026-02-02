import { useState, useEffect } from 'react';
import { api, ApiProjectType } from '../lib/api';
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
        
        const { items } = await api.projectTypes.list();
        setProjectTypes(items.map(mapToProjectType));
      } catch (err) {
        console.error('Ошибка при загрузке типов проектов:', err);
        setError(err instanceof Error ? err : new Error('Неизвестная ошибка'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchProjectTypes();
  }, [userId]);

  function mapToProjectType(item: ApiProjectType): CustomProjectType {
    return {
      id: item.id,
      user_id: userId || '',
      name: item.name,
      created_at: item.createdAt
    };
  }

  // Добавление нового типа проекта
  async function addProjectType(name: string, userId: string): Promise<CustomProjectType | null> {
    try {
      const { item } = await api.projectTypes.create(name);
      const mapped = mapToProjectType(item);
      setProjectTypes(prev => [...prev, mapped]);
      return mapped;
    } catch (err) {
      console.error('Ошибка при добавлении типа проекта:', err);
      setError(err instanceof Error ? err : new Error('Неизвестная ошибка'));
      return null;
    }
  }

  // Обновление существующего типа проекта
  async function updateProjectType(id: string, name: string): Promise<CustomProjectType | null> {
    try {
      const { item } = await api.projectTypes.update(id, name);
      const mapped = mapToProjectType(item);
      setProjectTypes(prev => prev.map(type =>
        type.id === id ? { ...type, name: mapped.name } : type
      ));
      return mapped;
    } catch (err) {
      console.error('Ошибка при обновлении типа проекта:', err);
      setError(err instanceof Error ? err : new Error('Неизвестная ошибка'));
      return null;
    }
  }

  // Удаление типа проекта
  async function deleteProjectType(id: string): Promise<boolean> {
    try {
      await api.projectTypes.delete(id);
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