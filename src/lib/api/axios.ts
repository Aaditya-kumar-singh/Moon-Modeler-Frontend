import axios, { AxiosError } from 'axios';

// Match the backend response structure
export interface ApiErrorResponse {
    success: boolean;
    error: {
        code: string;
        message: string;
        details?: any;
    };
    timestamp: string;
}

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - add auth token
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
    (response) => {
        // Unwrap the 'data' property if the backend wraps success responses in { data: ... }
        // Our ResponseUtil.success wraps in { success: true, data: ..., timestamp: ... }
        // So we return the full response or just the data depending on preference.
        // For now, let's return the full response to keep access to meta fields, 
        // OR we can strip it. Let's return the standard axios response, but consumers 
        // should know to look at response.data.data
        return response;
    },
    (error: AxiosError<ApiErrorResponse>) => {
        // 1. Extract the standardized error message from backend
        const backendError = error.response?.data?.error;

        if (backendError) {
            // Override the generic Axios error message with the backend's specific message
            error.message = backendError.message;
        }

        // 2. Handle Authentication Errors (401)
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                // Prevent infinite redirect loops if we are already on login
                if (!window.location.pathname.includes('/login')) {
                    // Optional: Clear token
                    localStorage.removeItem('token');
                    window.location.href = '/login?expired=true';
                }
            }
        }

        // 3. Return the modified error so components can access error.response.data.error.details
        return Promise.reject(error);
    }
);

export default api;
