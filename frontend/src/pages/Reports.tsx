import { useState, useEffect } from 'react';
import { reportService } from '../services/reportService';
import { productService } from '../services/productService';
import { userService } from '../services/userService';
import { Product, User } from '../types';

export default function Reports() {
    const [activeTab, setActiveTab] = useState<
        'stock' | 'price-history' | 'product-to-person'
    >('stock');
    const [stockReport, setStockReport] = useState<any[]>([]);
    const [priceHistory, setPriceHistory] = useState<any[]>([]);
    const [productToPersonReport, setProductToPersonReport] = useState<any[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [selectedUser, setSelectedUser] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadProducts();
        loadUsers();
        if (activeTab === 'stock') {
            loadStockReport();
        }
    }, [activeTab]);

    const loadProducts = async () => {
        try {
            const data = await productService.getAll();
            setProducts(data);
        } catch (error) {
            console.error('Failed to load products', error);
        }
    };

    const loadUsers = async () => {
        try {
            const data = await userService.getAll();
            setUsers(data);
        } catch (error) {
            console.error('Failed to load users', error);
        }
    };

    const loadStockReport = async () => {
        setLoading(true);
        try {
            const data = await reportService.getStockReport();
            setStockReport(data);
        } catch (error) {
            console.error('Failed to load stock report', error);
        } finally {
            setLoading(false);
        }
    };

    const loadPriceHistory = async () => {
        setLoading(true);
        try {
            const data = await reportService.getPriceHistory(
                selectedProduct ? parseInt(selectedProduct) : undefined
            );
            setPriceHistory(data);
        } catch (error) {
            console.error('Failed to load price history', error);
        } finally {
            setLoading(false);
        }
    };

    const loadProductToPersonReport = async () => {
        setLoading(true);
        try {
            const data = await reportService.getProductToPersonReport(
                selectedProduct ? parseInt(selectedProduct) : undefined,
                selectedUser ? parseInt(selectedUser) : undefined
            );
            setProductToPersonReport(data);
        } catch (error) {
            console.error('Failed to load product to person report', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'price-history') {
            loadPriceHistory();
        } else if (activeTab === 'product-to-person') {
            loadProductToPersonReport();
        }
    }, [activeTab, selectedProduct, selectedUser]);

    return (
        <div className="px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        View stock reports, price history, and product allocations
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="mt-8 border-b border-gray-300 bg-white rounded-t-xl shadow-sm px-6">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('stock')}
                        className={`${activeTab === 'stock'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Stock Report
                    </button>
                    <button
                        onClick={() => setActiveTab('price-history')}
                        className={`${activeTab === 'price-history'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Price History
                    </button>
                    <button
                        onClick={() => setActiveTab('product-to-person')}
                        className={`${activeTab === 'product-to-person'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Product to Person
                    </button>
                </nav>
            </div>

            {/* Filters for some tabs */}
            {activeTab === 'price-history' && (
                <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Filter by Product
                    </label>
                    <select
                        value={selectedProduct}
                        onChange={(e) => setSelectedProduct(e.target.value)}
                        className="block w-64 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2.5 border transition-colors"
                    >
                        <option value="">All Products</option>
                        {products.map((product) => (
                            <option key={product.id} value={product.id}>
                                {product.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}
            {activeTab === 'product-to-person' && (
                <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Filter by Product
                            </label>
                            <select
                                value={selectedProduct}
                                onChange={(e) => setSelectedProduct(e.target.value)}
                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2.5 border transition-colors"
                            >
                                <option value="">All Products</option>
                                {products.map((product) => (
                                    <option key={product.id} value={product.id}>
                                        {product.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Filter by User
                            </label>
                            <select
                                value={selectedUser}
                                onChange={(e) => setSelectedUser(e.target.value)}
                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2.5 border transition-colors"
                            >
                                <option value="">All Users</option>
                                {users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.name} ({user.email})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="text-center py-10 bg-white rounded-xl shadow-sm">
                    <div className="flex flex-col items-center">
                        <svg className="animate-spin h-10 w-10 text-indigo-600 mb-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-gray-600 font-medium">Loading...</p>
                    </div>
                </div>
            ) : (
                <div className="mt-6">
                    {/* Stock Report */}
                    {activeTab === 'stock' && (
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Product
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Initial Balance
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Total IN
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Total OUT
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Current Stock
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {stockReport.map((item) => (
                                        <tr key={item.productId} className="hover:bg-gray-50 transition-colors">
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-900">
                                                {item.productName}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    {item.initialBalance}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    +{item.totalIn}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    -{item.totalOut}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-indigo-100 text-indigo-800">
                                                    {item.currentStock}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Price History */}
                    {activeTab === 'price-history' && (
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Product
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Quantity
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Unit Price
                                        </th>
                                        {/* <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Total Price
                                        </th> */}
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Vendor
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {priceHistory.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                                                {new Date(item.transactionDate).toLocaleDateString()}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-900">
                                                {item.productName}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.transactionType === 'INITIAL'
                                                        ? 'bg-gray-100 text-gray-800'
                                                        : 'bg-green-100 text-green-800'
                                                        }`}
                                                >
                                                    {item.transactionType}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                                                {item.quantity}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    ${item.unitPrice}
                                                </span>
                                            </td>
                                            {/* <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                                ${item.totalPrice.toFixed(2)}
                                            </td> */}
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                                                {item.vendorName || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Product to Person */}
                    {activeTab === 'product-to-person' && (
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Product
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Recipient
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Quantity
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Remarks
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {productToPersonReport.map((item, index) => (
                                        <>
                                            {item.transactions.map((transaction: any, txIndex: number) => (
                                                <tr key={`${index}-${txIndex}`} className="hover:bg-gray-50 transition-colors">
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                                                        {new Date(transaction.transactionDate).toLocaleDateString()}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-900">
                                                        {item.productName}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                                        {item.recipientName}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                                                        {item.recipientEmail}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            {transaction.quantity}
                                                        </span>
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                                                        {transaction.remarks || '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
