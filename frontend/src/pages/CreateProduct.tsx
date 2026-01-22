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
            {/* Header */}
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold text-gray-900">Create New Product</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Add a new product to the inventory
                    </p>
                </div>
            </div>

            {/* Form */}
            <div className="mt-8 max-w-2xl">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                                <div className="flex">
                                    <svg className="h-5 w-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-sm text-red-800 font-medium">{error}</p>
                                </div>
                            </div>
                        )}

                        <div>
                            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                                Product Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="name"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2.5 border transition-colors"
                                placeholder="Enter product name"
                            />
                        </div>

                        <div>
                            <label htmlFor="initialBalance" className="block text-sm font-semibold text-gray-700 mb-2">
                                Initial Balance <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                id="initialBalance"
                                required
                                min="0"
                                value={initialBalance}
                                onChange={(e) => setInitialBalance(e.target.value)}
                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2.5 border transition-colors"
                                placeholder="0"
                            />
                        </div>

                        <div>
                            <label htmlFor="unitPrice" className="block text-sm font-semibold text-gray-700 mb-2">
                                Unit Price <span className="text-gray-400 text-xs font-normal">(optional)</span>
                            </label>
                            <input
                                type="number"
                                id="unitPrice"
                                step="0.01"
                                min="0"
                                value={unitPrice}
                                onChange={(e) => setUnitPrice(e.target.value)}
                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2.5 border transition-colors"
                                placeholder="0.00"
                            />
                        </div>

                        <div>
                            <label htmlFor="vendorName" className="block text-sm font-semibold text-gray-700 mb-2">
                                Vendor Name <span className="text-gray-400 text-xs font-normal">(optional)</span>
                            </label>
                            <input
                                type="text"
                                id="vendorName"
                                value={vendorName}
                                onChange={(e) => setVendorName(e.target.value)}
                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2.5 border transition-colors"
                                placeholder="Enter vendor name"
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 inline-flex justify-center items-center rounded-lg border border-transparent bg-gradient-to-r from-indigo-600 to-purple-600 py-3 px-6 text-sm font-semibold text-white shadow-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Create Product
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/products')}
                                className="inline-flex justify-center items-center rounded-lg border border-gray-300 bg-white py-3 px-6 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all"
                            >
                                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
