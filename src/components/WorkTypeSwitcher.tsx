"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { api, ApiWorkType } from "@/lib/api";
import { ChevronDown, Plus, Check, Briefcase } from "lucide-react";

interface WorkTypeSwitcherProps {
  projectId: string | null;
  activeWorkTypeId: string | null;
  onWorkTypeChange: (workTypeId: string | null, workTypeName?: string) => void;
}

export function WorkTypeSwitcher({ projectId, activeWorkTypeId, onWorkTypeChange }: WorkTypeSwitcherProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [workTypes, setWorkTypes] = useState<ApiWorkType[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newWorkTypeName, setNewWorkTypeName] = useState("");
  const [loading, setLoading] = useState(false);

  // Load work types when projectId changes
  useEffect(() => {
    if (projectId && user) {
      loadWorkTypes(projectId);
    } else {
      setWorkTypes([]);
      onWorkTypeChange(null);
    }
  }, [projectId, user]);

  async function loadWorkTypes(id: string) {
    setLoading(true);
    try {
      const { items } = await api.workTypes.list(id);
      setWorkTypes(items.filter(wt => wt.status !== "archived"));
    } catch (error) {
      console.error("Failed to load work types:", error);
    } finally {
      setLoading(false);
    }
  }

  const activeWorkType = workTypes.find(wt => wt.id === activeWorkTypeId);

  async function handleCreateWorkType() {
    if (!newWorkTypeName.trim() || !projectId) return;

    try {
      const { item } = await api.workTypes.create({ 
        projectId, 
        name: newWorkTypeName.trim() 
      });
      setWorkTypes(prev => [item, ...prev]);
      setNewWorkTypeName("");
      setIsCreating(false);
      onWorkTypeChange(item.id, item.name);
    } catch (error) {
      console.error("Failed to create work type:", error);
    }
  }

  async function handleSelectWorkType(id: string | null, name?: string) {
      onWorkTypeChange(id, name);
      setIsOpen(false);
  }

  if (!projectId) {
     return null; 
  }

  if (loading && workTypes.length === 0) {
    return (
      <div className="h-10 w-48 bg-muted rounded-lg animate-pulse" />
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-card border border-border hover:bg-muted/50 rounded-lg transition-colors min-w-[200px] text-foreground"
      >
        {activeWorkType ? (
           <div
            className="w-3 h-3 rounded-full border border-border"
            style={{ backgroundColor: activeWorkType.color || "#6366f1" }}
          />
        ) : (
           <Briefcase className="w-4 h-4 text-muted-foreground" />
        )}
        
        <span className="flex-1 text-left truncate text-sm">
          {activeWorkType?.name || t("timer.selectWorkType", "Select work type")}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setIsOpen(false);
              setIsCreating(false);
            }}
          />
          <div className="absolute top-full left-0 mt-1 w-64 bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden text-foreground">
             
            <button
                onClick={() => handleSelectWorkType(null, undefined)}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted transition-colors border-b border-border"
              >
                 <Briefcase className="w-4 h-4 text-muted-foreground" />
                <span className="flex-1 text-left truncate text-sm italic text-muted-foreground">{t("timer.noWorkType", "No work type")}</span>
                {!activeWorkTypeId && (
                  <Check className="w-4 h-4 text-primary" />
                )}
            </button>

            <div className="max-h-64 overflow-y-auto">
              {workTypes.length === 0 && !isCreating ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  {t("timer.noWorkTypes", "No work types created")}
                </div>
              ) : (
                workTypes.map(wt => (
                  <button
                    key={wt.id}
                    onClick={() => handleSelectWorkType(wt.id, wt.name)}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted transition-colors"
                  >
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: wt.color }}
                    />
                    <span className="flex-1 text-left truncate text-sm">{wt.name}</span>
                    {wt.id === activeWorkTypeId && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </button>
                ))
              )}
            </div>

            <div className="border-t border-border">
              {isCreating ? (
                <div className="p-2">
                  <input
                    type="text"
                    value={newWorkTypeName}
                    onChange={(e) => setNewWorkTypeName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreateWorkType();
                      if (e.key === "Escape") {
                        setIsCreating(false);
                        setNewWorkTypeName("");
                      }
                    }}
                    placeholder={t("timer.newWorkTypeName", "Work type name")}
                    className="w-full px-3 py-2 bg-muted/30 border border-input rounded text-sm focus:outline-none focus:border-primary text-foreground"
                    autoFocus
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleCreateWorkType}
                      disabled={!newWorkTypeName.trim()}
                      className="flex-1 px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm transition-colors"
                    >
                      {t("common.create", "Create")}
                    </button>
                    <button
                      onClick={() => {
                        setIsCreating(false);
                        setNewWorkTypeName("");
                      }}
                      className="px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground rounded text-sm transition-colors"
                    >
                      {t("common.cancel", "Cancel")}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsCreating(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-primary hover:bg-muted transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t("timer.createWorkType", "Create work type")}</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
