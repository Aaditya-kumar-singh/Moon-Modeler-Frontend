import api from '@/lib/api/axios';

export interface Team {
    id: string;
    name: string;
    role: 'OWNER' | 'EDITOR' | 'VIEWER';
    // membersCount: number; // Backend doesn't return this yet, optional enhancement
    projects?: any[];
}

export interface TeamMember {
    id: string;
    email: string;
    name: string | null;
    role: 'OWNER' | 'EDITOR' | 'VIEWER';
}

interface ApiResponse<T> {
    success: boolean;
    data: T;
    timestamp: string;
}

export const teamsApi = {
    list: async () => {
        const { data } = await api.get<ApiResponse<Team[]>>('/teams');
        // Backend returns wrapped response, so we need data.data
        return data.data;
    },

    create: async (name: string) => {
        const { data } = await api.post<ApiResponse<Team>>('/teams', { name });
        return data.data;
    },

    getMembers: async (teamId: string) => {
        const { data } = await api.get<ApiResponse<TeamMember[]>>(`/teams/${teamId}/members`);
        return data.data;
    },

    inviteMember: async (teamId: string, email: string, role: TeamMember['role'] = 'VIEWER') => {
        const { data } = await api.post<ApiResponse<any>>(`/teams/${teamId}/members`, { email, role });
        return data.data;
    }
};
