import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../services/productService';
import { Product } from '../types';
import { useAuth } from '../contexts/AuthContext';

export default function Products() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const { isAdmin } = useAuth();

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const data = await productService.getAll();
            setProducts(data);
        } catch (error) {
            console.error('Failed to load products', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            await productService.delete(id);
            loadProducts();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to delete product');
        }
    };

    if (loading) {
        return <div className="text-center py-10">Loading...</div>;
    }

    return (
        <div className="px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        A list of all products in inventory
                    </p>
                </div>
                {isAdmin && (
                    <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                        <Link
                            to="/products/create"
                            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Add Product
                        </Link>
                    </div>
                )}
            </div>

            {/* Products Table */}
            <div className="mt-8 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Vendor
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Initial Balance
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Current Stock
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Created At
                                </th>
                                {isAdmin && (
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Actions
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {products.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-900">
                                        {product.name}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                                        {product.vendorName || <span className="text-gray-400">-</span>}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            {product.initialBalance}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-indigo-100 text-indigo-800">
                                            {product.currentStock}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                                        {new Date(product.createdAt).toLocaleDateString()}
                                    </td>
                                    {isAdmin && (
                                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                                            >
                                                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                Delete
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
