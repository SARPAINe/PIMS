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
            <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>

            {/* Tabs */}
            <div className="mt-6 border-b border-gray-200">
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
                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">
                        Filter by Product
                    </label>
                    <select
                        value={selectedProduct}
                        onChange={(e) => setSelectedProduct(e.target.value)}
                        className="mt-1 block w-64 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
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
                <div className="mt-4 flex gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Filter by Product
                        </label>
                        <select
                            value={selectedProduct}
                            onChange={(e) => setSelectedProduct(e.target.value)}
                            className="mt-1 block w-64 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                        >
                            <option value="">All Products</option>
                            {products.map((product) => (
                                <option key={product.id} value={product.id}>
                                    {product.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Filter by User
                        </label>
                        <select
                            value={selectedUser}
                            onChange={(e) => setSelectedUser(e.target.value)}
                            className="mt-1 block w-64 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
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
            )}

            {loading ? (
                <div className="text-center py-10">Loading...</div>
            ) : (
                <div className="mt-6">
                    {/* Stock Report */}
                    {activeTab === 'stock' && (
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Product
                                        </th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Initial Balance
                                        </th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Total IN
                                        </th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Total OUT
                                        </th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Current Stock
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {stockReport.map((item) => (
                                        <tr key={item.productId}>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                                                {item.productName}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {item.initialBalance}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-green-600">
                                                +{item.totalIn}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-red-600">
                                                -{item.totalOut}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm font-bold text-gray-900">
                                                {item.currentStock}
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
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Date
                                        </th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Product
                                        </th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Type
                                        </th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Quantity
                                        </th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Unit Price
                                        </th>
                                        {/* <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Total Price
                                        </th> */}
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Vendor
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {priceHistory.map((item) => (
                                        <tr key={item.id}>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {new Date(item.transactionDate).toLocaleDateString()}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                                                {item.productName}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                <span
                                                    className={`inline-flex rounded-full px-2 text-xs font-semibold ${item.transactionType === 'INITIAL'
                                                        ? 'bg-gray-100 text-gray-800'
                                                        : 'bg-green-100 text-green-800'
                                                        }`}
                                                >
                                                    {item.transactionType}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {item.quantity}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                                                ${item.unitPrice}
                                            </td>
                                            {/* <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                                                ${item.totalPrice.toFixed(2)}
                                            </td> */}
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
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
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Date
                                        </th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Product
                                        </th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Recipient
                                        </th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Email
                                        </th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Quantity
                                        </th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Remarks
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {productToPersonReport.map((item, index) => (
                                        <>
                                            {item.transactions.map((transaction: any, txIndex: number) => (
                                                <tr key={`${index}-${txIndex}`}>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                        {new Date(transaction.transactionDate).toLocaleDateString()}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                                                        {item.productName}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                                                        {item.recipientName}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                        {item.recipientEmail}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                                                        {transaction.quantity}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
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
