import api from './api';
import { InventoryTransaction } from '../types';

export const inventoryService = {
    async createIn(transaction: {
        productId: number;
        quantity: number;
        unitPrice: number;
        vendorName: string;
        remarks?: string;
    }): Promise<InventoryTransaction> {
        const { data } = await api.post<InventoryTransaction>(
            '/inventory/in',
            transaction
        );
        return data;
    },

    async createOut(transaction: {
        productId: number;
        quantity: number;
        recipientUserId: number;
        remarks?: string;
    }): Promise<InventoryTransaction> {
        const { data } = await api.post<InventoryTransaction>(
            '/inventory/out',
            transaction
        );
        return data;
    },

    async getAll(page: number = 1, limit: number = 10): Promise<{
        data: InventoryTransaction[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        const { data } = await api.get<{
            data: InventoryTransaction[];
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        }>(
            '/inventory/transactions',
            { params: { page, limit } }
        );
        return data;
    },

    async getByProduct(productId: number): Promise<InventoryTransaction[]> {
        const { data } = await api.get<InventoryTransaction[]>(
            `/inventory/transactions/product/${productId}`
        );
        return data;
    },

    async getByRecipient(recipientId: number): Promise<InventoryTransaction[]> {
        const { data } = await api.get<InventoryTransaction[]>(
            `/inventory/transactions/recipient/${recipientId}`
        );
        return data;
    },
};
