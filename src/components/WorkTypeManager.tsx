import React, { useState } from 'react';
import { useCustomProjectTypes } from '../hooks/useCustomProjectTypes';
import { api } from '../lib/api';
import { CustomProjectType } from '../types/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface WorkTypeManagerProps {
  userId: string;
}

export default function WorkTypeManager({ userId }: WorkTypeManagerProps) {
  const { projectTypes, isLoading, error, addProjectType, updateProjectType, deleteProjectType } = useCustomProjectTypes(userId);
  const { translationInstance } = useLanguage();
  const { t } = translationInstance;
  
  const [newTypeName, setNewTypeName] = useState('');
  const [editMode, setEditMode] = useState<{id: string, name: string} | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  
  // Функция перевода
  const translate = (key: string): string => {
    const i18nTranslation = t(`settings.${key}`);
    
    // Если перевод вернул тот же ключ (не найден), используем фиксированные значения
    if (i18nTranslation === `settings.${key}`) {
      const localTranslations: Record<string, string> = {
        workTypes: 'Work Types',
        addWorkType: 'Add Work Type',
        workTypesDesc: 'Manage your work types and projects',
        standardTypes: 'Standard Types',
        customTypes: 'Custom Types',
        standard: 'Standard'
      };
      return localTranslations[key] || key;
    }
    
    return i18nTranslation;
  };
  
  // Стандартные типы работ
  const standardTypes = [
    { id: 'development', name: 'Веб-разработка' },
    { id: 'design', name: 'Дизайн' },
    { id: 'marketing', name: 'Маркетинг' },
    { id: 'meeting', name: 'Совещание' },
    { id: 'other', name: 'Другое' },
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
      const { items } = await api.timeEntries.list({ projectType: id, limit: 1 });
      if (items && items.length > 0) {
        setDeleteError('Нельзя удалить тип, который используется в записях. Сначала измените тип в записях.');
        return;
      }
      
      // Если записей нет, удаляем тип
      await deleteProjectType(id);
    } catch (err) {
      console.error('Ошибка при удалении типа работы:', err);
      setDeleteError('Произошла ошибка при удалении. Попробуйте еще раз.');
    }
  };

  const startEdit = (type: CustomProjectType) => {
    setEditMode({ id: type.id as string, name: type.name });
  };

  const cancelEdit = () => {
    setEditMode(null);
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Загрузка типов работ...</div>;
  }

  if (error) {
    return <div className="text-sm text-destructive">Ошибка загрузки типов работ: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {translate('standardTypes')}
        </h3>
        <ul className="space-y-2">
          {standardTypes.map(type => (
            <li key={type.id} className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-4 py-2">
              <span className="text-sm font-medium text-foreground">{type.name}</span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {translate('standard')}
              </span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {translate('customTypes')}
        </h3>
        {projectTypes.length === 0 ? (
          <p className="text-sm text-muted-foreground">У вас пока нет пользовательских типов работ</p>
        ) : (
          <ul className="space-y-2">
            {projectTypes.map(type => (
              <li key={type.id} className="rounded-lg border border-border bg-card px-4 py-2">
                {editMode && editMode.id === type.id ? (
                  <form onSubmit={handleUpdateType} className="flex w-full items-center gap-2">
                    <Input
                      type="text"
                      value={editMode.name}
                      onChange={(e) => setEditMode({ ...editMode, name: e.target.value })}
                      className="flex-1"
                      autoFocus
                      fullWidth
                    />
                    <div className="flex items-center gap-2">
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
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{type.name}</span>
                      <div className="flex items-center gap-2">
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
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
        
        {deleteError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {deleteError}
          </div>
        )}
        
        <form onSubmit={handleAddType} className="flex flex-col gap-2 sm:flex-row">
          <Input
            type="text"
            value={newTypeName}
            onChange={(e) => setNewTypeName(e.target.value)}
            placeholder={translate('addWorkType')}
            className="flex-1"
            fullWidth
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