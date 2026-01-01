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

export const teamsApi = {
    list: async () => {
        const response = await api.get<Team[]>('/teams');
        return response.data;
    },

    create: async (name: string) => {
        const response = await api.post<Team>('/teams', { name });
        return response.data;
    },

    getMembers: async (teamId: string) => {
        const response = await api.get<TeamMember[]>(`/teams/${teamId}/members`);
        return response.data;
    },

    inviteMember: async (teamId: string, email: string, role: TeamMember['role'] = 'VIEWER') => {
        const response = await api.post(`/teams/${teamId}/members`, { email, role });
        return response.data;
    }
};
