import api from './api';
import { StockReport } from '../types';

export const reportService = {
    async getStockReport(): Promise<StockReport[]> {
        const { data } = await api.get<StockReport[]>('/reports/stock');
        return data;
    },

    async getProductToPersonReport(
        productId?: number,
        recipientUserId?: number
    ): Promise<any[]> {
        const params = new URLSearchParams();
        if (productId) params.append('productId', productId.toString());
        if (recipientUserId)
            params.append('recipientUserId', recipientUserId.toString());
        const { data } = await api.get(`/reports/product-to-person?${params}`);
        return data;
    },

    async getPriceHistory(productId?: number): Promise<any[]> {
        const params = productId ? `?productId=${productId}` : '';
        const { data } = await api.get(`/reports/price-history${params}`);
        return data;
    },

    async getProductDetailed(productId: number): Promise<any> {
        const { data } = await api.get(`/reports/product/${productId}/detailed`);
        return data;
    },
};
