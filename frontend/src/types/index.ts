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
