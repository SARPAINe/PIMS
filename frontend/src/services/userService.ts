import api from './api';
import { User } from '../types';

export const userService = {
    async getAll(): Promise<User[]> {
        const { data } = await api.get<User[]>('/users');
        return data;
    },

    async getOne(id: number): Promise<User> {
        const { data } = await api.get<User>(`/users/${id}`);
        return data;
    },

    async create(user: {
        name: string;
        email: string;
        password: string;
        userType?: 'ADMIN' | 'USER';
    }): Promise<User> {
        const { data } = await api.post<User>('/users', user);
        return data;
    },

    async update(
        id: number,
        user: {
            name?: string;
            email?: string;
            password?: string;
            userType?: 'ADMIN' | 'USER';
        }
    ): Promise<User> {
        const { data } = await api.patch<User>(`/users/${id}`, user);
        return data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/users/${id}`);
    },
};
