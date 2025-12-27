import { create } from 'zustand';
import { projectsApi, type Project, type CreateProjectDto } from '../api/projectsApi';

interface ProjectsState {
    projects: Project[];
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchProjects: () => Promise<void>;
    createProject: (name: string, dbType: 'MYSQL' | 'MONGODB') => Promise<Project>;
    deleteProject: (id: string) => Promise<void>;
    clearError: () => void;
}

export const useProjectsStore = create<ProjectsState>((set, get) => ({
    projects: [],
    isLoading: false,
    error: null,

    fetchProjects: async () => {
        set({ isLoading: true, error: null });
        try {
            const projects = await projectsApi.getAll();
            set({ projects, isLoading: false });
        } catch (error: any) {
            set({
                error: error.message || 'Failed to fetch projects',
                isLoading: false
            });
        }
    },

    createProject: async (name, dbType) => {
        set({ error: null });
        try {
            const dto: CreateProjectDto = {
                name,
                type: dbType,
                content: { nodes: [], edges: [], metadata: { version: 1, dbType, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } },
            };
            const project = await projectsApi.create(dto);
            set({ projects: [...get().projects, project] });
            return project;
        } catch (error: any) {
            set({ error: error.message || 'Failed to create project' });
            throw error;
        }
    },

    deleteProject: async (id) => {
        set({ error: null });
        try {
            await projectsApi.delete(id);
            set({ projects: get().projects.filter(p => p.id !== id) });
        } catch (error: any) {
            set({ error: error.message || 'Failed to delete project' });
            throw error;
        }
    },

    clearError: () => set({ error: null }),
}));
