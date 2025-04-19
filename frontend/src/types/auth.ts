export interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role: 'donor' | 'recipient';
    phone_number?: string;
    address?: string;
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface RegisterData {
    username: string;
    password: string;
    password2: string;
    email: string;
    first_name: string;
    last_name: string;
    role: 'donor' | 'recipient';
    phone_number?: string;
    address?: string;
}

export interface AuthResponse {
    access: string;
    refresh: string;
} 