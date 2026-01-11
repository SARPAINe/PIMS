import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';

export default function CreateProduct() {
    const [name, setName] = useState('');
    const [initialBalance, setInitialBalance] = useState('0');
    const [unitPrice, setUnitPrice] = useState('');
    const [vendorName, setVendorName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await productService.create({
                name,
                initialBalance: parseInt(initialBalance),
                unitPrice: unitPrice ? parseFloat(unitPrice) : undefined,
                vendorName: vendorName || undefined,
            });
            navigate('/products');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="px-4 sm:px-6 lg:px-8">
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Create New Product
                    </h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Add a new product to the inventory
                    </p>
                </div>
            </div>

            <div className="mt-8 max-w-2xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="rounded-md bg-red-50 p-4">
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    )}

                    <div>
                        <label
                            htmlFor="name"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Product Name *
                        </label>
                        <input
                            type="text"
                            id="name"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="initialBalance"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Initial Balance *
                        </label>
                        <input
                            type="number"
                            id="initialBalance"
                            required
                            min="0"
                            value={initialBalance}
                            onChange={(e) => setInitialBalance(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="unitPrice"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Unit Price (optional)
                        </label>
                        <input
                            type="number"
                            id="unitPrice"
                            step="0.01"
                            min="0"
                            value={unitPrice}
                            onChange={(e) => setUnitPrice(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="vendorName"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Vendor Name (optional)
                        </label>
                        <input
                            type="text"
                            id="vendorName"
                            value={vendorName}
                            onChange={(e) => setVendorName(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                        />
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400"
                        >
                            {loading ? 'Creating...' : 'Create Product'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/products')}
                            className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
