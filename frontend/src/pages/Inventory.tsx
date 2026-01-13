import { useState, useEffect, FormEvent } from 'react';
import { productService } from '../services/productService';
import { userService } from '../services/userService';
import { inventoryService } from '../services/inventoryService';
import { Product, User, InventoryTransaction } from '../types';

export default function Inventory() {
    const [products, setProducts] = useState<Product[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
    const [activeTab, setActiveTab] = useState<'in' | 'out' | 'history'>('in');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalTransactions, setTotalTransactions] = useState(0);
    const itemsPerPage = 10;

    // IN form state
    const [inProductId, setInProductId] = useState('');
    const [inQuantity, setInQuantity] = useState('');
    const [inUnitPrice, setInUnitPrice] = useState('');
    const [inVendorName, setInVendorName] = useState('');
    const [inRemarks, setInRemarks] = useState('');

    // OUT form state
    const [outProductId, setOutProductId] = useState('');
    const [outQuantity, setOutQuantity] = useState('');
    const [outRecipientUserId, setOutRecipientUserId] = useState('');
    const [outRemarks, setOutRemarks] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async (page: number = currentPage) => {
        try {
            const [productsData, usersData, transactionsData] = await Promise.all([
                productService.getAll(),
                userService.getAll(),
                inventoryService.getAll(page, itemsPerPage),
            ]);
            setProducts(productsData);
            setUsers(usersData);
            setTransactions(transactionsData.data);
            setTotalPages(transactionsData.totalPages);
            setTotalTransactions(transactionsData.total);
            setCurrentPage(transactionsData.page);
        } catch (error) {
            console.error('Failed to load data', error);
        }
    };

    const handleInSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await inventoryService.createIn({
                productId: parseInt(inProductId),
                quantity: parseInt(inQuantity),
                unitPrice: parseFloat(inUnitPrice),
                vendorName: inVendorName,
                remarks: inRemarks || undefined,
            });
            setInProductId('');
            setInQuantity('');
            setInUnitPrice('');
            setInVendorName('');
            setInRemarks('');
            await loadData();
            alert('IN transaction created successfully');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create transaction');
        } finally {
            setLoading(false);
        }
    };

    const handleOutSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await inventoryService.createOut({
                productId: parseInt(outProductId),
                quantity: parseInt(outQuantity),
                recipientUserId: parseInt(outRecipientUserId),
                remarks: outRemarks || undefined,
            });
            setOutProductId('');
            setOutQuantity('');
            setOutRecipientUserId('');
            setOutRemarks('');
            await loadData();
            alert('OUT transaction created successfully');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create transaction');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-semibold text-gray-900">
                Inventory Transactions
            </h1>

            {/* Tabs */}
            <div className="mt-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('in')}
                        className={`${activeTab === 'in'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Stock IN
                    </button>
                    <button
                        onClick={() => setActiveTab('out')}
                        className={`${activeTab === 'out'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Stock OUT
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`${activeTab === 'history'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        History
                    </button>
                </nav>
            </div>

            {error && (
                <div className="mt-4 rounded-md bg-red-50 p-4">
                    <p className="text-sm text-red-800">{error}</p>
                </div>
            )}

            {/* IN Form */}
            {activeTab === 'in' && (
                <div className="mt-6 max-w-2xl">
                    <form onSubmit={handleInSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Product *
                            </label>
                            <select
                                required
                                value={inProductId}
                                onChange={(e) => setInProductId(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                            >
                                <option value="">Select a product</option>
                                {products.map((product) => (
                                    <option key={product.id} value={product.id}>
                                        {product.name} (Current: {product.currentStock})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Quantity *
                            </label>
                            <input
                                type="number"
                                required
                                min="1"
                                value={inQuantity}
                                onChange={(e) => setInQuantity(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Unit Price *
                            </label>
                            <input
                                type="number"
                                required
                                step="0.01"
                                min="0"
                                value={inUnitPrice}
                                onChange={(e) => setInUnitPrice(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Vendor Name *
                            </label>
                            <input
                                type="text"
                                required
                                value={inVendorName}
                                onChange={(e) => setInVendorName(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Remarks
                            </label>
                            <textarea
                                value={inRemarks}
                                onChange={(e) => setInRemarks(e.target.value)}
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400"
                        >
                            {loading ? 'Processing...' : 'Record IN Transaction'}
                        </button>
                    </form>
                </div>
            )}

            {/* OUT Form */}
            {activeTab === 'out' && (
                <div className="mt-6 max-w-2xl">
                    <form onSubmit={handleOutSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Product *
                            </label>
                            <select
                                required
                                value={outProductId}
                                onChange={(e) => setOutProductId(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                            >
                                <option value="">Select a product</option>
                                {products.map((product) => (
                                    <option key={product.id} value={product.id}>
                                        {product.name} (Available: {product.currentStock})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Quantity *
                            </label>
                            <input
                                type="number"
                                required
                                min="1"
                                value={outQuantity}
                                onChange={(e) => setOutQuantity(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Recipient User *
                            </label>
                            <select
                                required
                                value={outRecipientUserId}
                                onChange={(e) => setOutRecipientUserId(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                            >
                                <option value="">Select a user</option>
                                {users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.name} ({user.email})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Remarks
                            </label>
                            <textarea
                                value={outRemarks}
                                onChange={(e) => setOutRemarks(e.target.value)}
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400"
                        >
                            {loading ? 'Processing...' : 'Record OUT Transaction'}
                        </button>
                    </form>
                </div>
            )}

            {/* History */}
            {activeTab === 'history' && (
                <div className="mt-6">
                    {(() => {
                        // Pagination calculations
                        const startIndex = (currentPage - 1) * itemsPerPage;
                        const endIndex = Math.min(startIndex + itemsPerPage, totalTransactions);

                        const handlePageChange = async (newPage: number) => {
                            setCurrentPage(newPage);
                            await loadData(newPage);
                        };

                        return (
                            <>
                                <div className="mb-4 text-sm text-gray-700">
                                    Showing {totalTransactions === 0 ? 0 : startIndex + 1} to {endIndex} of {totalTransactions} transactions
                                </div>
                                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                                    <table className="min-w-full divide-y divide-gray-300">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                    Date
                                                </th>
                                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                    Type
                                                </th>
                                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                    Product
                                                </th>
                                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                    Quantity
                                                </th>
                                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                    Details
                                                </th>
                                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                    Created By
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {transactions.map((transaction) => (
                                                <tr key={transaction.id}>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                        {new Date(
                                                            transaction.transactionDate
                                                        ).toLocaleString()}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                        <span
                                                            className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${transaction.transactionType === 'IN'
                                                                ? 'bg-green-100 text-green-800'
                                                                : transaction.transactionType === 'OUT'
                                                                    ? 'bg-red-100 text-red-800'
                                                                    : 'bg-gray-100 text-gray-800'
                                                                }`}
                                                        >
                                                            {transaction.transactionType}
                                                        </span>
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                                                        {transaction.product?.name}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                        {transaction.quantity}
                                                    </td>
                                                    <td className="px-3 py-4 text-sm text-gray-500">
                                                        {transaction.transactionType === 'IN' ? (
                                                            <>
                                                                <div>Vendor: {transaction.vendorName}</div>
                                                                <div>Price: ${transaction.unitPrice}</div>
                                                            </>
                                                        ) : transaction.transactionType === 'OUT' ? (
                                                            <div>To: {transaction.recipientUser?.name}</div>
                                                        ) : null}
                                                        {transaction.remarks && (
                                                            <div className="text-gray-400">
                                                                {transaction.remarks}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                        {transaction.createdBy?.name}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <div className="mt-4 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                                        <div className="flex flex-1 justify-between sm:hidden">
                                            <button
                                                onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                                                disabled={currentPage === 1}
                                                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                                            >
                                                Previous
                                            </button>
                                            <button
                                                onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                                                disabled={currentPage === totalPages}
                                                className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                                            >
                                                Next
                                            </button>
                                        </div>
                                        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                            <div>
                                                <p className="text-sm text-gray-700">
                                                    Page <span className="font-medium">{currentPage}</span> of{' '}
                                                    <span className="font-medium">{totalPages}</span>
                                                </p>
                                            </div>
                                            <div>
                                                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                                    <button
                                                        onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                                                        disabled={currentPage === 1}
                                                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:bg-gray-100 disabled:text-gray-300"
                                                    >
                                                        <span className="sr-only">Previous</span>
                                                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                            <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                    {[...Array(totalPages)].map((_, index) => {
                                                        const pageNumber = index + 1;
                                                        // Show first page, last page, current page, and pages around current
                                                        if (
                                                            pageNumber === 1 ||
                                                            pageNumber === totalPages ||
                                                            (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                                                        ) {
                                                            return (
                                                                <button
                                                                    key={pageNumber}
                                                                    onClick={() => handlePageChange(pageNumber)}
                                                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${currentPage === pageNumber
                                                                            ? 'z-10 bg-indigo-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                                                                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                                                                        }`}
                                                                >
                                                                    {pageNumber}
                                                                </button>
                                                            );
                                                        } else if (
                                                            pageNumber === currentPage - 2 ||
                                                            pageNumber === currentPage + 2
                                                        ) {
                                                            return (
                                                                <span
                                                                    key={pageNumber}
                                                                    className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0"
                                                                >
                                                                    ...
                                                                </span>
                                                            );
                                                        }
                                                        return null;
                                                    })}
                                                    <button
                                                        onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                                                        disabled={currentPage === totalPages}
                                                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:bg-gray-100 disabled:text-gray-300"
                                                    >
                                                        <span className="sr-only">Next</span>
                                                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </nav>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        );
                    })()}
                </div>
            )}
        </div>
    );
}
