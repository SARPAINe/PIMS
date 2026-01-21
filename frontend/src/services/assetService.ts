import api from './api';
import {
    Asset,
    AssetType,
    AssetTypeField,
    AssetAssignment,
    AssetDashboardSummary,
    AssetStatus,
} from '../types';

export const assetService = {
    // Asset Types
    async getAllAssetTypes(): Promise<AssetType[]> {
        const { data } = await api.get<AssetType[]>('/assets/asset-types');
        return data;
    },

    async createAssetType(assetType: { name: string }): Promise<AssetType> {
        const { data } = await api.post<AssetType>('/assets/asset-types', assetType);
        return data;
    },

    async addFieldToAssetType(
        assetTypeId: number,
        field: {
            fieldKey: string;
            fieldLabel: string;
            dataType: string;
            isRequired?: boolean;
            isUniquePerType?: boolean;
            sortOrder?: number;
        }
    ): Promise<AssetTypeField> {
        const { data } = await api.post<AssetTypeField>(
            `/assets/asset-types/${assetTypeId}/fields`,
            field
        );
        return data;
    },

    // Assets
    async getAllAssets(filters?: {
        assetTypeId?: number;
        status?: AssetStatus;
        q?: string;
    }): Promise<Asset[]> {
        const params = new URLSearchParams();
        if (filters?.assetTypeId) params.append('assetTypeId', filters.assetTypeId.toString());
        if (filters?.status) params.append('status', filters.status);
        if (filters?.q) params.append('q', filters.q);

        const { data } = await api.get<Asset[]>(`/assets?${params.toString()}`);
        return data;
    },

    async getAssetById(id: number): Promise<Asset> {
        const { data } = await api.get<Asset>(`/assets/${id}`);
        return data;
    },

    async createAsset(asset: {
        assetTypeId: number;
        assetNumber: string;
        serialNumber?: string;
        vendorName?: string;
        purchaseDate?: string;
        purchasePriceBdt?: number;
        dynamicValues?: Record<string, any>;
    }): Promise<Asset> {
        const { data } = await api.post<Asset>('/assets', asset);
        return data;
    },

    async getDashboardSummary(filters?: {
        assetTypeId?: number;
        status?: AssetStatus;
        q?: string;
    }): Promise<AssetDashboardSummary> {
        const params = new URLSearchParams();
        if (filters?.assetTypeId) params.append('assetTypeId', filters.assetTypeId.toString());
        if (filters?.status) params.append('status', filters.status);
        if (filters?.q) params.append('q', filters.q);

        const queryString = params.toString();
        const url = queryString ? `/assets/dashboard-summary?${queryString}` : '/assets/dashboard-summary';
        const { data } = await api.get<AssetDashboardSummary>(url);
        return data;
    },

    // Assignments
    async assignAsset(
        assetId: number,
        assignment: {
            assignedToUserId: number;
            issueDate: string;
            remarks?: string;
        }
    ): Promise<AssetAssignment> {
        const { data } = await api.post<AssetAssignment>(
            `/assets/${assetId}/assign`,
            assignment
        );
        return data;
    },

    async returnAsset(
        assetId: number,
        returnData: {
            handoverDate: string;
            remarks?: string;
        }
    ): Promise<AssetAssignment> {
        const { data } = await api.post<AssetAssignment>(
            `/assets/${assetId}/return`,
            returnData
        );
        return data;
    },

    async transferAsset(
        assetId: number,
        transfer: {
            assignedToUserId: number;
            issueDate: string;
            remarks?: string;
        }
    ): Promise<AssetAssignment> {
        const { data } = await api.post<AssetAssignment>(
            `/assets/${assetId}/transfer`,
            transfer
        );
        return data;
    },

    async getAssetAssignments(assetId: number): Promise<AssetAssignment[]> {
        const { data } = await api.get<AssetAssignment[]>(`/assets/${assetId}/assignments`);
        return data;
    },

    async getUserAssets(userId: number): Promise<Asset[]> {
        const { data } = await api.get<Asset[]>(`/assets/users/${userId}/assets`);
        return data;
    },
};
