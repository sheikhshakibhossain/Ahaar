import { api } from './api';
import { LoginCredentials, RegisterData, AuthResponse, User } from '../types/auth';

export const authService = {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/api/login/', credentials);
        return response.data;
    },

    async register(data: RegisterData): Promise<User> {
        try {
            const response = await api.post<User>('/api/register/', data);
            return response.data;
        } catch (error: any) {
            console.error('Registration API error:', error.response?.data);
            throw error;
        }
    },

    async getCurrentUser(): Promise<User> {
        const response = await api.get<User>('/api/me/');
        return response.data;
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
    }
}; 