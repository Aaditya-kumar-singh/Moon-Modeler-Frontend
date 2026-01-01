import api from '@/lib/api/axios';

export interface User {
    id: string;
    email: string;
    name?: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export const authApi = {
    login: async (data: any) => {
        const response = await api.post<AuthResponse>('/auth/login', data);
        return response.data;
    },

    register: async (data: any) => {
        const response = await api.post<AuthResponse>('/auth/register', data);
        return response.data;
    },

    // Optional: Get current user if token exists (me endpoint)
    // me: async () => { ... }
};
