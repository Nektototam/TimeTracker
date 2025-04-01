import React, { useState } from 'react';
import { useCustomProjectTypes } from '../hooks/useCustomProjectTypes';
import { supabase } from '../lib/supabase';
import { CustomProjectType } from '../types/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './ui/Button';
import { useTranslation } from 'react-i18next';

interface WorkTypeManagerProps {
  userId: string;
}

export default function WorkTypeManager({ userId }: WorkTypeManagerProps) {
  const { projectTypes, isLoading, error, addProjectType, updateProjectType, deleteProjectType } = useCustomProjectTypes(userId);
  const { t } = useTranslation();
  
  const [newTypeName, setNewTypeName] = useState('');
  const [editMode, setEditMode] = useState<{id: string, name: string} | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  
  // Стандартные типы работ
  const standardTypes = [
    { id: 'development', name: t('workTypes.development', 'Веб-разработка') },
    { id: 'design', name: t('workTypes.design', 'Дизайн') },
    { id: 'marketing', name: t('workTypes.marketing', 'Маркетинг') },
    { id: 'meeting', name: t('workTypes.meeting', 'Совещание') },
    { id: 'other', name: t('workTypes.other', 'Другое') },
  ];

  const handleAddType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;
    
    await addProjectType(newTypeName.trim(), userId);
    setNewTypeName('');
  };

  const handleUpdateType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editMode || !editMode.name.trim()) return;
    
    await updateProjectType(editMode.id, editMode.name.trim());
    setEditMode(null);
  };

  const handleDeleteType = async (id: string) => {
    setDeleteError(null);
    
    // Сначала проверяем, есть ли записи с этим типом работы
    try {
      const { data, error } = await supabase
        .from('time_entries')
        .select('id')
        .eq('project_type', id)
        .limit(1);
      
      if (error) throw new Error(error.message);
      
      if (data && data.length > 0) {
        setDeleteError(t('settings.cannotDeleteUsedType', 'Нельзя удалить тип, который используется в записях. Сначала измените тип в записях.'));
        return;
      }
      
      // Если записей нет, удаляем тип
      await deleteProjectType(id);
    } catch (err) {
      console.error('Ошибка при удалении типа работы:', err);
      setDeleteError(t('settings.deleteError', 'Произошла ошибка при удалении. Попробуйте еще раз.'));
    }
  };

  const startEdit = (type: CustomProjectType) => {
    setEditMode({ id: type.id as string, name: type.name });
  };

  const cancelEdit = () => {
    setEditMode(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10 text-gray-500">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {t('loading')}...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-error-50 border border-error-100 text-error rounded-lg mt-4">
        <p>{t('errorLoadingData')}: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="work-type-manager mt-4">
      <div className="mb-6">
        <h4 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-3">
          {t('settings.standardTypes')}
        </h4>
        <div className="space-y-2">
          {standardTypes.map(type => (
            <div 
              key={type.id} 
              className="flex justify-between items-center p-3 bg-gradient-to-r from-primary-50 to-white dark:from-primary-600/10 dark:to-gray-800 rounded-lg shadow-sm border border-primary-100 dark:border-primary-600/20"
            >
              <span className="font-medium text-gray-800 dark:text-gray-200">{type.name}</span>
              <span className="px-2 py-1 text-xs font-medium text-primary-600 dark:text-primary-300 bg-primary-100 dark:bg-primary-900/40 rounded-md">
                {t('settings.standard')}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <h4 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-3">
          {t('settings.customTypes')}
        </h4>
        
        {projectTypes.length === 0 ? (
          <div className="p-4 text-center bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400 italic">
              {t('settings.noCustomTypes', 'У вас пока нет пользовательских типов работ')}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {projectTypes.map(type => (
              <div 
                key={type.id} 
                className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md"
              >
                {editMode && editMode.id === type.id ? (
                  <form onSubmit={handleUpdateType} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editMode.name}
                      onChange={(e) => setEditMode({ ...editMode, name: e.target.value })}
                      className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button 
                        variant="success" 
                        size="sm" 
                        rounded="lg"
                        type="submit"
                      >
                        {t('save')}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        rounded="lg"
                        onClick={cancelEdit}
                      >
                        {t('cancel')}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-800 dark:text-gray-200">{type.name}</span>
                    <div className="flex gap-2">
                      <Button 
                        variant="secondary"
                        size="sm"
                        rounded="lg"
                        onClick={() => startEdit(type)}
                      >
                        {t('edit')}
                      </Button>
                      <Button 
                        variant="danger"
                        size="sm"
                        rounded="lg"
                        onClick={() => handleDeleteType(type.id as string)}
                      >
                        {t('delete')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {deleteError && (
          <div className="mt-4 p-3 bg-error-50 border border-error-100 text-error rounded-lg animate-fadeIn">
            {deleteError}
          </div>
        )}
        
        <form onSubmit={handleAddType} className="mt-4 flex gap-2">
          <input
            type="text"
            value={newTypeName}
            onChange={(e) => setNewTypeName(e.target.value)}
            placeholder={t('settings.addWorkType', 'Добавить тип работы')}
            className="flex-1 p-2.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <Button 
            variant="primary" 
            size="md" 
            rounded="lg"
            type="submit" 
            disabled={!newTypeName.trim()}
          >
            {t('add')}
          </Button>
        </form>
      </div>
    </div>
  );
} 