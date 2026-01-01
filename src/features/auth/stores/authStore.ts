import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, User } from '../api/authApi';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    login: (data: any) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            login: async (data) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await authApi.login(data);
                    set({
                        user: response.user,
                        token: response.token,
                        isAuthenticated: true,
                        isLoading: false
                    });
                    // Explicitly set token in localStorage for Axios interceptor (Redundant with persist but safe)
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('token', response.token);
                    }
                } catch (error: any) {
                    set({
                        error: error.response?.data?.error || 'Login failed',
                        isLoading: false
                    });
                    throw error;
                }
            },

            register: async (data) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await authApi.register(data);
                    set({
                        user: response.user,
                        token: response.token,
                        isAuthenticated: true,
                        isLoading: false
                    });
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('token', response.token);
                    }
                } catch (error: any) {
                    console.error('❌ Registration Failed');
                    console.error('Full error:', error);
                    console.error('Response data:', JSON.stringify(error.response?.data, null, 2));
                    console.error('Status:', error.response?.status);

                    // Extract detailed error message
                    let errorMessage = 'Registration failed';

                    if (error.response?.data) {
                        const data = error.response.data;

                        // Check for Zod validation errors
                        if (data.details && Array.isArray(data.details)) {
                            errorMessage = data.details.map((d: any) => d.message).join(', ');
                        }
                        // Check for general error message
                        else if (data.error) {
                            errorMessage = data.error;
                        }
                        // Check for message field
                        else if (data.message) {
                            errorMessage = data.message;
                        }
                    } else if (error.message) {
                        errorMessage = error.message;
                    }

                    console.error('📝 Error message:', errorMessage);

                    set({
                        error: errorMessage,
                        isLoading: false
                    });
                    throw error;
                }
            },

            logout: () => {
                set({ user: null, token: null, isAuthenticated: false });
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('token');
                }
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
        }
    )
);
