"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { api, ApiProject } from "@/lib/api";
import { ChevronDown, Plus, FolderKanban, Check } from "lucide-react";

interface ProjectSwitcherProps {
  activeProjectId: string | null;
  onProjectChange: (projectId: string) => void;
  onProjectCreated?: (project: ApiProject) => void;
}

export function ProjectSwitcher({ activeProjectId, onProjectChange, onProjectCreated }: ProjectSwitcherProps) {
  const { t } = useTranslation();
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [loading, setLoading] = useState(true);

  const activeProject = projects.find(p => p.id === activeProjectId);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      const { items } = await api.projects.list();
      setProjects(items.filter(p => p.status === "active"));
    } catch (error) {
      console.error("Failed to load projects:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateProject() {
    if (!newProjectName.trim()) return;

    try {
      const { item } = await api.projects.create({ name: newProjectName.trim() });
      setProjects(prev => [item, ...prev]);
      setNewProjectName("");
      setIsCreating(false);
      onProjectChange(item.id);
      onProjectCreated?.(item);
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  }

  async function handleSelectProject(projectId: string) {
    try {
      await api.projects.activate(projectId);
      onProjectChange(projectId);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to activate project:", error);
    }
  }

  if (loading) {
    return (
      <div className="h-10 w-48 bg-zinc-800 rounded-lg animate-pulse" />
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors min-w-[200px]"
      >
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: activeProject?.color || "#6366f1" }}
        />
        <span className="flex-1 text-left truncate">
          {activeProject?.name || t("dashboard.selectProject", "Select project")}
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
          <div className="absolute top-full left-0 mt-1 w-64 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-50 overflow-hidden">
            <div className="max-h-64 overflow-y-auto">
              {projects.length === 0 && !isCreating ? (
                <div className="p-4 text-center text-zinc-400 text-sm">
                  {t("dashboard.noProjects")}
                </div>
              ) : (
                projects.map(project => (
                  <button
                    key={project.id}
                    onClick={() => handleSelectProject(project.id)}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-zinc-700 transition-colors"
                  >
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="flex-1 text-left truncate">{project.name}</span>
                    {project.id === activeProjectId && (
                      <Check className="w-4 h-4 text-indigo-400" />
                    )}
                  </button>
                ))
              )}
            </div>

            <div className="border-t border-zinc-700">
              {isCreating ? (
                <div className="p-2">
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreateProject();
                      if (e.key === "Escape") {
                        setIsCreating(false);
                        setNewProjectName("");
                      }
                    }}
                    placeholder={t("dashboard.newProjectName")}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-600 rounded text-sm focus:outline-none focus:border-indigo-500"
                    autoFocus
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleCreateProject}
                      disabled={!newProjectName.trim()}
                      className="flex-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm transition-colors"
                    >
                      {t("common.create", "Create")}
                    </button>
                    <button
                      onClick={() => {
                        setIsCreating(false);
                        setNewProjectName("");
                      }}
                      className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 rounded text-sm transition-colors"
                    >
                      {t("common.cancel", "Cancel")}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsCreating(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-indigo-400 hover:bg-zinc-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t("dashboard.createProject", "Create project")}</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
