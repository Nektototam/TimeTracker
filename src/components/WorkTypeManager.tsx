import React, { useState } from 'react';
import { useCustomProjectTypes } from '../hooks/useCustomProjectTypes';
import { supabase } from '../lib/supabase';
import { CustomProjectType } from '../types/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './ui/Button';

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
      const { data, error } = await supabase
        .from('time_entries')
        .select('id')
        .eq('project_type', id)
        .limit(1);
      
      if (error) throw new Error(error.message);
      
      if (data && data.length > 0) {
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
    return <div className="loading">Загрузка типов работ...</div>;
  }

  if (error) {
    return <div className="error">Ошибка загрузки типов работ: {error.message}</div>;
  }

  return (
    <div className="work-type-manager">
      <div className="standard-types">
        <h3>{translate('standardTypes')}</h3>
        <ul className="type-list">
          {standardTypes.map(type => (
            <li key={type.id} className="type-item">
              <span className="type-name">{type.name}</span>
              <span className="type-badge standard">{translate('standard')}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="custom-types">
        <h3>{translate('customTypes')}</h3>
        {projectTypes.length === 0 ? (
          <p className="no-types">У вас пока нет пользовательских типов работ</p>
        ) : (
          <ul className="type-list">
            {projectTypes.map(type => (
              <li key={type.id} className="type-item">
                {editMode && editMode.id === type.id ? (
                  <form onSubmit={handleUpdateType} className="edit-form">
                    <input
                      type="text"
                      value={editMode.name}
                      onChange={(e) => setEditMode({ ...editMode, name: e.target.value })}
                      className="type-input"
                      autoFocus
                    />
                    <div className="type-actions">
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
                    <span className="type-name">{type.name}</span>
                    <div className="type-actions">
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
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
        
        {deleteError && (
          <div className="error-message">{deleteError}</div>
        )}
        
        <form onSubmit={handleAddType} className="add-type-form">
          <input
            type="text"
            value={newTypeName}
            onChange={(e) => setNewTypeName(e.target.value)}
            placeholder={translate('addWorkType')}
            className="type-input"
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
      
      <style jsx>{`
        .work-type-manager {
          margin-top: 15px;
        }
        
        .standard-types, .custom-types {
          margin-bottom: 24px;
        }
        
        h3 {
          font-size: 16px;
          margin-bottom: 10px;
          color: #444;
        }
        
        .type-list {
          list-style: none;
          padding: 0;
        }
        
        .type-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 15px;
          background-color: #f8f9fe;
          border-radius: 8px;
          margin-bottom: 8px;
        }
        
        .type-name {
          font-weight: 500;
        }
        
        .type-badge {
          font-size: 12px;
          padding: 2px 8px;
          border-radius: 4px;
          background-color: #e1e5f7;
          color: #5266c4;
        }
        
        .type-actions {
          display: flex;
          gap: 8px;
        }
        
        .btn-edit, .btn-delete, .btn-save, .btn-cancel, .btn-add {
          padding: 5px 10px;
          border-radius: 6px;
          border: none;
          font-size: 13px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .btn-edit {
          background-color: #e1e5f7;
          color: #5266c4;
        }
        
        .btn-delete {
          background-color: #ffe5e5;
          color: #e54d4d;
        }
        
        .btn-save {
          background-color: #5266c4;
          color: white;
        }
        
        .btn-cancel {
          background-color: #f0f0f0;
          color: #666;
        }
        
        .btn-add {
          background-color: #5266c4;
          color: white;
          padding: 8px 16px;
          font-size: 14px;
        }
        
        .btn-add:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .type-input {
          padding: 8px 12px;
          border-radius: 6px;
          border: 1px solid #ddd;
          flex-grow: 1;
          font-size: 14px;
        }
        
        .add-type-form {
          display: flex;
          gap: 10px;
          margin-top: 15px;
        }
        
        .edit-form {
          display: flex;
          width: 100%;
          justify-content: space-between;
          gap: 10px;
        }
        
        .no-types {
          color: #888;
          font-style: italic;
        }
        
        .error-message {
          color: #e54d4d;
          margin: 10px 0;
          padding: 8px 12px;
          background-color: #ffe5e5;
          border-radius: 6px;
          font-size: 14px;
        }
        
        .loading, .error {
          padding: 20px 0;
          color: #666;
          font-style: italic;
        }
      `}</style>
    </div>
  );
} 