import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { User, LoginCredentials, RegisterData, AuthResponse } from '../types/auth';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (access: string, refresh: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            fetchUser();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUser = async () => {
        try {
            const response = await api.get<User>('/api/me/');
            setUser(response.data);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Error fetching user:', error);
            // Only clear tokens if it's an authentication error
            if (error.response?.status === 401) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                setUser(null);
                setIsAuthenticated(false);
            }
        } finally {
            setLoading(false);
        }
    };

    const login = async (access: string, refresh: string) => {
        try {
            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);
            await fetchUser();
        } catch (error) {
            console.error('Login error:', error);
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            setUser(null);
            setIsAuthenticated(false);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ user, loading, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 