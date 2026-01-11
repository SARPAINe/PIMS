import api from './api';
import { LoginResponse, User } from '../types';

export const authService = {
    async login(email: string, password: string): Promise<LoginResponse> {
        const { data } = await api.post<LoginResponse>('/auth/login', {
            email,
            password,
        });
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        return data;
    },

    async register(
        name: string,
        email: string,
        password: string,
        userType?: 'ADMIN' | 'USER'
    ): Promise<User> {
        const { data } = await api.post<User>('/auth/register', {
            name,
            email,
            password,
            userType,
        });
        return data;
    },

    logout() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
    },

    getCurrentUser(): User | null {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    isAuthenticated(): boolean {
        return !!localStorage.getItem('accessToken');
    },
};
