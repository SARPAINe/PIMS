export interface User {
    id: number;
    name: string;
    email: string;
    userType: 'ADMIN' | 'USER';
    createdAt: string;
}

export interface Product {
    id: number;
    name: string;
    initialBalance: number;
    vendorName?: string;
    currentStock?: number;
    createdBy?: User;
    createdAt: string;
}

export interface InventoryTransaction {
    id: number;
    productId: number;
    product?: Product;
    transactionType: 'INITIAL' | 'IN' | 'OUT';
    quantity: number;
    unitPrice?: number;
    vendorName?: string;
    recipientUserId?: number;
    recipientUser?: User;
    remarks?: string;
    createdBy?: User;
    transactionDate: string;
}

export interface StockReport {
    productId: number;
    productName: string;
    initialBalance: number;
    totalIn: number;
    totalOut: number;
    currentStock: number;
    createdBy: {
        id: number;
        name: string;
    };
}

export interface LoginResponse {
    accessToken: string;
    user: User;
}

export interface ApiError {
    message: string | string[];
    error: string;
    statusCode: number;
}

// Asset Management Types
export type AssetStatus = 'AVAILABLE' | 'ASSIGNED' | 'MAINTENANCE' | 'RETIRED' | 'LOST';
export type AssetFieldType = 'STRING' | 'NUMBER' | 'DATE' | 'TEXT' | 'BOOLEAN';

export interface AssetType {
    id: number;
    name: string;
    isActive: boolean;
    createdBy?: User;
    createdAt: string;
    fields?: AssetTypeField[];
}

export interface AssetTypeField {
    id: number;
    assetTypeId: number;
    fieldKey: string;
    fieldLabel: string;
    dataType: AssetFieldType;
    isRequired: boolean;
    isUniquePerType: boolean;
    sortOrder: number;
    createdAt: string;
}

export interface Asset {
    id: number;
    assetTypeId: number;
    assetType?: AssetType;
    assetNumber: string;
    serialNumber?: string;
    status: AssetStatus;
    purchaseDate?: string;
    purchasePriceBdt?: number;
    vendorName?: string;
    createdBy?: User;
    createdAt: string;
    dynamicValues?: Record<string, any>;
    currentAssignment?: AssetAssignment;
    assignmentHistory?: AssetAssignment[];
}

export interface AssetAssignment {
    id: number;
    assetId: number;
    asset?: Asset;
    assignedToUserId: number;
    assignedToUser?: User;
    assignedByUserId: number;
    assignedByUser?: User;
    issueDate: string;
    handoverDate?: string;
    remarks?: string;
    createdAt: string;
}

export interface AssetDashboardSummary {
    total: number;
    available: number;
    assigned: number;
    maintenance: number;
    retired: number;
    lost: number;
}
