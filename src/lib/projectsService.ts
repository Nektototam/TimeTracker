import { api, ApiProject } from './api';

// Предустановленные цвета для проектов
export const PROJECT_COLORS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#14b8a6', // Teal
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
];

export interface Project extends ApiProject {
  totalTimeMs?: number;
  todayTimeMs?: number;
}

class ProjectsService {
  // Получить все проекты
  async getProjects(): Promise<Project[]> {
    const { items } = await api.projects.list();
    return items;
  }

  // Получить активные проекты
  async getActiveProjects(): Promise<Project[]> {
    const projects = await this.getProjects();
    return projects.filter(p => p.status === 'active');
  }

  // Получить проект по ID
  async getProject(id: string): Promise<Project> {
    const { item } = await api.projects.get(id);
    return item;
  }

  // Создать проект
  async createProject(data: {
    name: string;
    color?: string;
    description?: string;
  }): Promise<Project> {
    const { item } = await api.projects.create({
      ...data,
      color: data.color || this.getRandomColor()
    });
    return item;
  }

  // Обновить проект
  async updateProject(id: string, data: {
    name?: string;
    color?: string;
    description?: string | null;
    status?: 'active' | 'archived';
  }): Promise<Project> {
    const { item } = await api.projects.update(id, data);
    return item;
  }

  // Архивировать проект
  async archiveProject(id: string): Promise<Project> {
    return this.updateProject(id, { status: 'archived' });
  }

  // Восстановить проект
  async restoreProject(id: string): Promise<Project> {
    return this.updateProject(id, { status: 'active' });
  }

  // Удалить проект
  async deleteProject(id: string): Promise<void> {
    await api.projects.delete(id);
  }

  // Активировать проект
  async activateProject(id: string): Promise<void> {
    await api.projects.activate(id);
  }

  // Получить проекты с временем за сегодня
  async getProjectsWithStats(): Promise<Project[]> {
    const [projects, todayEntries] = await Promise.all([
      this.getActiveProjects(),
      api.timeEntries.today()
    ]);

    // Группируем время по проектам
    const timeByProject = new Map<string, number>();
    for (const entry of todayEntries.items) {
      const current = timeByProject.get(entry.projectId) || 0;
      timeByProject.set(entry.projectId, current + entry.durationMs);
    }

    // Добавляем статистику к проектам
    return projects.map(project => ({
      ...project,
      todayTimeMs: timeByProject.get(project.id) || 0
    }));
  }

  // Получить случайный цвет
  getRandomColor(): string {
    return PROJECT_COLORS[Math.floor(Math.random() * PROJECT_COLORS.length)];
  }

  // Форматировать время
  formatDuration(ms: number): string {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  // Вычислить прогресс цели
  calculateProgress(currentMs: number, goalMs: number | null | undefined): number {
    if (!goalMs || goalMs <= 0) return 0;
    return Math.min(100, Math.round((currentMs / goalMs) * 100));
  }
}

const projectsService = new ProjectsService();
export default projectsService;
