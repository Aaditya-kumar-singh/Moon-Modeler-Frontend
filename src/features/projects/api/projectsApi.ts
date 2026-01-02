import api from '@/lib/api/axios';

export interface Project {
    id: string;
    name: string;
    description?: string;
    type: 'MYSQL' | 'MONGODB';
    content: any; // JSON object of diagram
    createdAt: string;
    updatedAt: string;
}

export interface CreateProjectDto {
    name: string;
    type: 'MYSQL' | 'MONGODB';
    description?: string;
    content?: any;
}

interface ApiResponse<T> {
    data: T;
}

export interface PaginatedResponse<T> {
    projects?: T[]; // for getAll
    versions?: T[]; // for getVersions
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface ProjectParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    type?: 'MYSQL' | 'MONGODB';
}

export const projectsApi = {
    /**
     * Get all projects for the current user
     */
    async getAll(params: ProjectParams = {}): Promise<{ projects: Project[], meta: any }> {
        // Backend returns: 
        // { success: true, data: { projects: [...], total: 5, page: 1, limit: 10, pages: 1 } }
        // Axios (api.get) returns { data: ... }
        // So we get: data.data which is the object above.

        const { data } = await api.get<ApiResponse<any>>('/projects', { params });

        // This 'data.data' is the object containing { projects, total, page... }
        // It is NOT nested under another 'data' key inside it.
        const result = data.data;

        return {
            projects: result.projects || [],
            meta: {
                total: result.total || 0,
                page: result.page || 1,
                limit: result.limit || 10,
                totalPages: result.pages || 0
            }
        };
    },

    /**
     * Get a single project by ID
     */
    async getById(id: string): Promise<Project> {
        const { data } = await api.get<ApiResponse<Project>>(`/projects/${id}`);
        return data.data;
    },

    /**
     * Create a new project
     */
    async create(dto: CreateProjectDto): Promise<Project> {
        const { data } = await api.post<ApiResponse<Project>>('/projects', dto);
        return data.data;
    },

    /**
     * Update an existing project
     */
    async update(id: string, updates: Partial<Project>): Promise<Project> {
        const { data } = await api.patch<ApiResponse<Project>>(`/projects/${id}`, updates);
        return data.data;
    },

    /**
     * Delete a project
     */
    async delete(id: string): Promise<void> {
        await api.delete(`/projects/${id}`);
    },

    /**
     * Get version history for a project
     */
    async getVersions(projectId: string, params: { page?: number; limit?: number } = {}): Promise<{ versions: any[], meta: any }> {
        const { data } = await api.get<ApiResponse<PaginatedResponse<any>>>(`/projects/${projectId}/versions`, { params });
        return {
            versions: data.data.versions || [],
            meta: data.data.meta
        };
    },

    /**
     * Restore a project version
     */
    async restoreVersion(projectId: string, versionId: string): Promise<Project> {
        const { data } = await api.post<ApiResponse<Project>>(`/projects/${projectId}/versions/${versionId}/restore`);
        return data.data;
    },

    /**
     * Export project to SQL/JS
     */
    async export(id: string): Promise<{ filename: string; content: string }> {
        const { data } = await api.post<ApiResponse<{ filename: string; content: string }>>(`/projects/${id}/export`);
        return data.data;
    },

    /**
     * Import diagram from DB connection
     */
    async importFromDb(type: 'MYSQL' | 'MONGODB', connectionString: string): Promise<any> {
        const { data } = await api.post<ApiResponse<any>>('/import', { type, connectionString });
        return data.data;
    },

    // --- Collaboration ---

    async share(projectId: string, email: string, role: 'EDITOR' | 'VIEWER'): Promise<any> {
        const { data } = await api.post<ApiResponse<any>>(`/projects/${projectId}/share`, { email, role });
        return data.data;
    },

    async getCollaborators(projectId: string): Promise<Collaborator[]> {
        const { data } = await api.get<ApiResponse<Collaborator[]>>(`/projects/${projectId}/collaborators`);
        return data.data;
    },

    async removeCollaborator(projectId: string, userId: string): Promise<void> {
        await api.delete(`/projects/${projectId}/collaborators/${userId}`);
    }
};

export interface Collaborator {
    id: string;
    projectId: string;
    userId: string;
    role: 'EDITOR' | 'VIEWER';
    user: {
        id: string;
        name: string;
        email: string;
    };
}
