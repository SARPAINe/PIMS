import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { assetService } from '../services/assetService';
import { Asset, AssetType, AssetStatus, AssetDashboardSummary } from '../types';
import { useAuth } from '../contexts/AuthContext';

const statusColors: Record<AssetStatus, string> = {
    AVAILABLE: 'bg-green-100 text-green-800',
    ASSIGNED: 'bg-blue-100 text-blue-800',
    MAINTENANCE: 'bg-yellow-100 text-yellow-800',
    RETIRED: 'bg-gray-100 text-gray-800',
    LOST: 'bg-red-100 text-red-800',
};

export default function Assets() {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [assetTypes, setAssetTypes] = useState<AssetType[]>([]);
    const [summary, setSummary] = useState<AssetDashboardSummary>({
        total: 0,
        available: 0,
        assigned: 0,
        maintenance: 0,
        retired: 0,
        lost: 0,
    });
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<number | ''>('');
    const [filterStatus, setFilterStatus] = useState<AssetStatus | ''>('');
    const { isAdmin } = useAuth();

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        loadAssets();
        loadSummary();
    }, [filterType, filterStatus, searchQuery]);

    const loadData = async () => {
        try {
            const typesData = await assetService.getAllAssetTypes();
            setAssetTypes(typesData);
            await loadAssets();
            await loadSummary();
        } catch (error) {
            console.error('Failed to load data', error);
        } finally {
            setLoading(false);
        }
    };

    const loadAssets = async () => {
        try {
            const filters: any = {};
            if (filterType) filters.assetTypeId = filterType;
            if (filterStatus) filters.status = filterStatus;
            if (searchQuery) filters.q = searchQuery;

            const data = await assetService.getAllAssets(filters);
            setAssets(data);
        } catch (error) {
            console.error('Failed to load assets', error);
        }
    };

    const loadSummary = async () => {
        try {
            const filters: any = {};
            if (filterType) filters.assetTypeId = filterType;
            if (filterStatus) filters.status = filterStatus;
            if (searchQuery) filters.q = searchQuery;

            const summaryData = await assetService.getDashboardSummary(filters);
            setSummary(summaryData);
        } catch (error) {
            console.error('Failed to load summary', error);
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
                    <h1 className="text-2xl font-semibold text-gray-900">Asset Management</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Manage and track all organizational assets
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-3">
                    <Link
                        to="/assets/types"
                        className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Asset Types
                    </Link>
                    {isAdmin && (
                        <Link
                            to="/assets/create"
                            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Add Asset
                        </Link>
                    )}
                </div>
            </div>

            {/* Dashboard Summary */}
            <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
                <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden shadow-lg rounded-xl border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                    <div className="p-5">
                        <div className="flex items-center justify-between">
                            <div className="flex-shrink-0">
                                <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Assets</div>
                            <div className="mt-1 text-3xl font-bold text-gray-900">
                                {summary.total}
                            </div>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-gray-200 opacity-20"></div>
                </div>

                <div className="relative bg-gradient-to-br from-green-50 to-green-100 overflow-hidden shadow-lg rounded-xl border border-green-200 hover:shadow-xl transition-shadow duration-300">
                    <div className="p-5">
                        <div className="flex items-center justify-between">
                            <div className="flex-shrink-0">
                                <svg className="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="text-sm font-medium text-green-700 uppercase tracking-wide">Available</div>
                            <div className="mt-1 text-3xl font-bold text-green-900">
                                {summary.available}
                            </div>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-green-300 opacity-20"></div>
                </div>

                <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden shadow-lg rounded-xl border border-blue-200 hover:shadow-xl transition-shadow duration-300">
                    <div className="p-5">
                        <div className="flex items-center justify-between">
                            <div className="flex-shrink-0">
                                <svg className="h-8 w-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="text-sm font-medium text-blue-700 uppercase tracking-wide">Assigned</div>
                            <div className="mt-1 text-3xl font-bold text-blue-900">
                                {summary.assigned}
                            </div>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-blue-300 opacity-20"></div>
                </div>

                <div className="relative bg-gradient-to-br from-yellow-50 to-yellow-100 overflow-hidden shadow-lg rounded-xl border border-yellow-200 hover:shadow-xl transition-shadow duration-300">
                    <div className="p-5">
                        <div className="flex items-center justify-between">
                            <div className="flex-shrink-0">
                                <svg className="h-8 w-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="text-sm font-medium text-yellow-700 uppercase tracking-wide">Maintenance</div>
                            <div className="mt-1 text-3xl font-bold text-yellow-900">
                                {summary.maintenance}
                            </div>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-yellow-300 opacity-20"></div>
                </div>

                <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden shadow-lg rounded-xl border border-gray-300 hover:shadow-xl transition-shadow duration-300">
                    <div className="p-5">
                        <div className="flex items-center justify-between">
                            <div className="flex-shrink-0">
                                <svg className="h-8 w-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">Retired</div>
                            <div className="mt-1 text-3xl font-bold text-gray-900">
                                {summary.retired}
                            </div>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-gray-300 opacity-20"></div>
                </div>

                <div className="relative bg-gradient-to-br from-red-50 to-red-100 overflow-hidden shadow-lg rounded-xl border border-red-200 hover:shadow-xl transition-shadow duration-300">
                    <div className="p-5">
                        <div className="flex items-center justify-between">
                            <div className="flex-shrink-0">
                                <svg className="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="text-sm font-medium text-red-700 uppercase tracking-wide">Lost</div>
                            <div className="mt-1 text-3xl font-bold text-red-900">
                                {summary.lost}
                            </div>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-red-300 opacity-20"></div>
                </div>
            </div>

            {/* Filters */}
            <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Search Assets
                        </label>
                        <div className="relative rounded-lg shadow-sm">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search by asset number or serial number..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-full rounded-lg border-gray-300 pl-10 pr-3 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 sm:text-sm transition-all"
                            />
                        </div>
                    </div>
                    <div className="sm:w-56">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Asset Type
                        </label>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value ? Number(e.target.value) : '')}
                            className="block w-full rounded-lg border-gray-300 py-2.5 pl-3 pr-10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 sm:text-sm transition-all"
                        >
                            <option value="">All Types</option>
                            {assetTypes.map((type) => (
                                <option key={type.id} value={type.id}>
                                    {type.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="sm:w-56">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                        </label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as AssetStatus | '')}
                            className="block w-full rounded-lg border-gray-300 py-2.5 pl-3 pr-10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 sm:text-sm transition-all"
                        >
                            <option value="">All Status</option>
                            <option value="AVAILABLE">✓ Available</option>
                            <option value="ASSIGNED">👤 Assigned</option>
                            <option value="MAINTENANCE">🔧 Maintenance</option>
                            <option value="RETIRED">📦 Retired</option>
                            <option value="LOST">⚠️ Lost</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Assets Table */}
            <div className="mt-8 flex flex-col">
                <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                        <div className="overflow-hidden shadow-xl ring-1 ring-black ring-opacity-5 rounded-xl border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                    <tr>
                                        <th className="px-3 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                                            Asset Number
                                        </th>
                                        <th className="px-3 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-3 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                                            Serial Number
                                        </th>
                                        <th className="px-3 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-3 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                                            Vendor
                                        </th>
                                        <th className="px-3 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                                            Purchase Date
                                        </th>
                                        <th className="relative py-4 pl-3 pr-6">
                                            <span className="sr-only">View</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {assets.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-3 py-16 text-center">
                                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                </svg>
                                                <p className="mt-2 text-sm font-medium text-gray-900">No assets found</p>
                                                <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        assets.map((asset) => (
                                            <tr key={asset.id} className="hover:bg-gray-50 transition-colors duration-150">
                                                <td className="whitespace-nowrap px-3 py-4 text-sm font-semibold text-indigo-600">
                                                    {asset.assetNumber}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                                                    <div className="flex items-center">
                                                        <div className="h-8 w-8 flex-shrink-0 rounded-lg bg-indigo-100 flex items-center justify-center mr-3">
                                                            <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                            </svg>
                                                        </div>
                                                        {asset.assetType?.name || '-'}
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600 font-mono">
                                                    {asset.serialNumber || <span className="text-gray-400">-</span>}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusColors[asset.status]} ring-1 ring-inset ring-opacity-20`}>
                                                        {asset.status === 'AVAILABLE' && '✓ '}
                                                        {asset.status === 'ASSIGNED' && '👤 '}
                                                        {asset.status === 'MAINTENANCE' && '🔧 '}
                                                        {asset.status === 'RETIRED' && '📦 '}
                                                        {asset.status === 'LOST' && '⚠️ '}
                                                        {asset.status}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600">
                                                    {asset.vendorName || <span className="text-gray-400">-</span>}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600">
                                                    {asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : <span className="text-gray-400">-</span>}
                                                </td>
                                                <td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
                                                    <Link
                                                        to={`/assets/${asset.id}`}
                                                        className="inline-flex items-center text-indigo-600 hover:text-indigo-900 font-medium"
                                                    >
                                                        View Details
                                                        <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
