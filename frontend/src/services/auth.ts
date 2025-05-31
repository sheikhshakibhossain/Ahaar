import { api } from './api';
import { LoginCredentials, RegisterData, AuthResponse, User } from '../types/auth';
import axios from 'axios';

export const authService = {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        try {
            // Clear any existing tokens before login
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            
            console.log('Attempting login with username:', credentials.username);
            
            const response = await api.post<AuthResponse>('/api/login/', {
                username: credentials.username,
                password: credentials.password
            });
            
            console.log('Login response:', response.data);
            
            // Store tokens immediately after successful login
            if (response.data.access && response.data.refresh) {
                localStorage.setItem('access_token', response.data.access);
                localStorage.setItem('refresh_token', response.data.refresh);
            } else {
                throw new Error('Invalid response from server');
            }
            
            return response.data;
        } catch (error: any) {
            console.log('Login error:', error);
            console.log('Error response:', error.response);
            console.log('Error data:', error.response?.data);
            
            // Clear tokens on error
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            
            // Handle specific error messages
            if (error.response?.data?.detail) {
                if (error.response.data.is_banned) {
                    const userInfo = error.response.data.user_info;
                    const emailBody = `Account Information:\nUsername: ${userInfo.username}\nEmail: ${userInfo.email}\nName: ${userInfo.first_name} ${userInfo.last_name}\n\nPlease review my account status.`;
                    const mailtoLink = `mailto:admin@ahaar.com?subject=Account Ban Review Request&body=${encodeURIComponent(emailBody)}`;
                    throw new Error(`The account is banned. Please contact admin for more information. <a href="${mailtoLink}" style="color: #1976d2; text-decoration: underline;">Click here to email admin</a>`);
                }
                throw new Error(error.response.data.detail);
            } else {
                throw new Error('An error occurred during login. Please try again.');
            }
        }
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
        try {
            const response = await api.get<User>('/api/me/');
            return response.data;
        } catch (error: any) {
            console.error('Get current user API error:', error.response?.data);
            throw error;
        }
    },

    logout() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    }
}; 