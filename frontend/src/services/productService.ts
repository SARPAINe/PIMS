import api from './api';
import { Product } from '../types';

export const productService = {
    async getAll(): Promise<Product[]> {
        const { data } = await api.get<Product[]>('/products');
        return data;
    },

    async getOne(id: number): Promise<Product> {
        const { data } = await api.get<Product>(`/products/${id}`);
        return data;
    },

    async create(product: {
        name: string;
        initialBalance: number;
        unitPrice?: number;
        vendorName?: string;
    }): Promise<Product> {
        const { data } = await api.post<Product>('/products', product);
        return data;
    },

    async update(
        id: number,
        product: { name?: string }
    ): Promise<Product> {
        const { data } = await api.patch<Product>(`/products/${id}`, product);
        return data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/products/${id}`);
    },
};
