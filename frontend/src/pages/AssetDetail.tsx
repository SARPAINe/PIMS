import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assetService } from '../services/assetService';
import { userService } from '../services/userService';
import { Asset, User } from '../types';
import { useAuth } from '../contexts/AuthContext';

const statusColors: Record<string, string> = {
    AVAILABLE: 'bg-green-100 text-green-800',
    ASSIGNED: 'bg-blue-100 text-blue-800',
    MAINTENANCE: 'bg-yellow-100 text-yellow-800',
    RETIRED: 'bg-gray-100 text-gray-800',
    LOST: 'bg-red-100 text-red-800',
};

export default function AssetDetail() {
    const { id } = useParams<{ id: string }>();
    const [asset, setAsset] = useState<Asset | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [assignData, setAssignData] = useState({
        assignedToUserId: '',
        issueDate: new Date().toISOString().split('T')[0],
        remarks: '',
    });
    const [returnData, setReturnData] = useState({
        handoverDate: new Date().toISOString().split('T')[0],
        remarks: '',
    });
    const [error, setError] = useState('');
    const { isAdmin } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (id) {
            loadAssetDetail();
            loadUsers();
        }
    }, [id]);

    const loadAssetDetail = async () => {
        try {
            const data = await assetService.getAssetById(Number(id));
            setAsset(data);
        } catch (error) {
            console.error('Failed to load asset', error);
        } finally {
            setLoading(false);
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

    const handleAssign = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await assetService.assignAsset(Number(id), {
                assignedToUserId: Number(assignData.assignedToUserId),
                issueDate: assignData.issueDate,
                remarks: assignData.remarks || undefined,
            });
            setShowAssignModal(false);
            loadAssetDetail();
            setAssignData({
                assignedToUserId: '',
                issueDate: new Date().toISOString().split('T')[0],
                remarks: '',
            });
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to assign asset');
        }
    };

    const handleReturn = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await assetService.returnAsset(Number(id), {
                handoverDate: returnData.handoverDate,
                remarks: returnData.remarks || undefined,
            });
            setShowReturnModal(false);
            loadAssetDetail();
            setReturnData({
                handoverDate: new Date().toISOString().split('T')[0],
                remarks: '',
            });
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to return asset');
        }
    };

    const handleTransfer = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await assetService.transferAsset(Number(id), {
                assignedToUserId: Number(assignData.assignedToUserId),
                issueDate: assignData.issueDate,
                remarks: assignData.remarks || undefined,
            });
            setShowTransferModal(false);
            loadAssetDetail();
            setAssignData({
                assignedToUserId: '',
                issueDate: new Date().toISOString().split('T')[0],
                remarks: '',
            });
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to transfer asset');
        }
    };

    if (loading) {
        return <div className="text-center py-10">Loading...</div>;
    }

    if (!asset) {
        return <div className="text-center py-10">Asset not found</div>;
    }

    return (
        <div className="px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="md:flex md:items-center md:justify-between">
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                        {asset.assetNumber}
                    </h2>
                    <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                            <span className={`inline-flex rounded-full px-2 text-xs font-semibold ${statusColors[asset.status]}`}>
                                {asset.status}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
                    <button
                        onClick={() => navigate('/assets')}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Back
                    </button>
                    {isAdmin && !asset.currentAssignment && (
                        <button
                            onClick={() => {
                                setShowAssignModal(true);
                                setError('');
                            }}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                            Assign
                        </button>
                    )}
                    {isAdmin && asset.currentAssignment && (
                        <>
                            <button
                                onClick={() => {
                                    setShowTransferModal(true);
                                    setError('');
                                }}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                            >
                                Transfer
                            </button>
                            <button
                                onClick={() => {
                                    setShowReturnModal(true);
                                    setError('');
                                }}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                            >
                                Return
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Asset Details */}
            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Basic Information */}
                <div className="bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Basic Information
                        </h3>
                    </div>
                    <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Asset Type</dt>
                                <dd className="mt-1 text-sm text-gray-900">{asset.assetType?.name}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Asset Number</dt>
                                <dd className="mt-1 text-sm text-gray-900">{asset.assetNumber}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Serial Number</dt>
                                <dd className="mt-1 text-sm text-gray-900">{asset.serialNumber || '-'}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Status</dt>
                                <dd className="mt-1 text-sm text-gray-900">{asset.status}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Vendor</dt>
                                <dd className="mt-1 text-sm text-gray-900">{asset.vendorName || '-'}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Purchase Date</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    {asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : '-'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Purchase Price</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    {asset.purchasePriceBdt ? `৳ ${asset.purchasePriceBdt.toLocaleString()}` : '-'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Created At</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    {new Date(asset.createdAt).toLocaleDateString()}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>

                {/* Dynamic Fields */}
                {asset.dynamicValues && Object.keys(asset.dynamicValues).length > 0 && (
                    <div className="bg-white shadow sm:rounded-lg">
                        <div className="px-4 py-5 sm:px-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                {asset.assetType?.name} Details
                            </h3>
                        </div>
                        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                {Object.entries(asset.dynamicValues).map(([key, value]) => (
                                    <div key={key}>
                                        <dt className="text-sm font-medium text-gray-500 capitalize">
                                            {key.replace(/_/g, ' ')}
                                        </dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : (value?.toString() || '-')}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    </div>
                )}
            </div>

            {/* Current Assignment */}
            {asset.currentAssignment && (
                <div className="mt-8 bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Current Assignment
                        </h3>
                    </div>
                    <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-3">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Assigned To</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    {asset.currentAssignment.assignedToUser?.name}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Assigned By</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    {asset.currentAssignment.assignedByUser?.name}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Issue Date</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    {new Date(asset.currentAssignment.issueDate).toLocaleDateString()}
                                </dd>
                            </div>
                            {asset.currentAssignment.remarks && (
                                <div className="sm:col-span-3">
                                    <dt className="text-sm font-medium text-gray-500">Remarks</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {asset.currentAssignment.remarks}
                                    </dd>
                                </div>
                            )}
                        </dl>
                    </div>
                </div>
            )}

            {/* Assignment History */}
            {asset.assignmentHistory && asset.assignmentHistory.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        Assignment History
                    </h3>
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Assigned To
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Issue Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Handover Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Duration
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Remarks
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {asset.assignmentHistory.map((assignment) => {
                                    const issueDate = new Date(assignment.issueDate);
                                    const endDate = assignment.handoverDate ? new Date(assignment.handoverDate) : new Date();
                                    const durationMs = endDate.getTime() - issueDate.getTime();
                                    const durationDays = Math.floor(durationMs / (1000 * 60 * 60 * 24));

                                    let durationText = '';
                                    if (durationDays < 1) {
                                        durationText = 'Less than a day';
                                    } else if (durationDays < 30) {
                                        durationText = `${durationDays} day${durationDays === 1 ? '' : 's'}`;
                                    } else if (durationDays < 365) {
                                        const months = Math.floor(durationDays / 30);
                                        const days = durationDays % 30;
                                        durationText = `${months} month${months === 1 ? '' : 's'}${days > 0 ? ` ${days} day${days === 1 ? '' : 's'}` : ''}`;
                                    } else {
                                        const years = Math.floor(durationDays / 365);
                                        const remainingDays = durationDays % 365;
                                        const months = Math.floor(remainingDays / 30);
                                        durationText = `${years} year${years === 1 ? '' : 's'}${months > 0 ? ` ${months} month${months === 1 ? '' : 's'}` : ''}`;
                                    }

                                    return (
                                        <tr key={assignment.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {assignment.assignedToUser?.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(assignment.issueDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {assignment.handoverDate
                                                    ? new Date(assignment.handoverDate).toLocaleDateString()
                                                    : <span className="text-blue-600 font-medium">Current</span>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                                                {durationText}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {assignment.remarks || '-'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Assign Modal */}
            {showAssignModal && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowAssignModal(false)}></div>
                        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                            <form onSubmit={handleAssign}>
                                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                    Assign Asset
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">User</label>
                                        <select
                                            required
                                            value={assignData.assignedToUserId}
                                            onChange={(e) => setAssignData({ ...assignData, assignedToUserId: e.target.value })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2.5"
                                        >
                                            <option value="">Select user...</option>
                                            {users.map((user) => (
                                                <option key={user.id} value={user.id}>
                                                    {user.name} ({user.email})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Issue Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={assignData.issueDate}
                                            onChange={(e) => setAssignData({ ...assignData, issueDate: e.target.value })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2.5"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Remarks</label>
                                        <textarea
                                            value={assignData.remarks}
                                            onChange={(e) => setAssignData({ ...assignData, remarks: e.target.value })}
                                            rows={3}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2.5"
                                        />
                                    </div>
                                    {error && <p className="text-sm text-red-600">{error}</p>}
                                </div>
                                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
                                    <button
                                        type="submit"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 sm:text-sm"
                                    >
                                        Assign
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowAssignModal(false)}
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Transfer Modal */}
            {showTransferModal && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowTransferModal(false)}></div>
                        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                            <form onSubmit={handleTransfer}>
                                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                    Transfer Asset
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Transfer To</label>
                                        <select
                                            required
                                            value={assignData.assignedToUserId}
                                            onChange={(e) => setAssignData({ ...assignData, assignedToUserId: e.target.value })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2.5"
                                        >
                                            <option value="">Select user...</option>
                                            {users.filter(u => u.id !== asset.currentAssignment?.assignedToUserId).map((user) => (
                                                <option key={user.id} value={user.id}>
                                                    {user.name} ({user.email})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Transfer Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={assignData.issueDate}
                                            onChange={(e) => setAssignData({ ...assignData, issueDate: e.target.value })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2.5"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Remarks</label>
                                        <textarea
                                            value={assignData.remarks}
                                            onChange={(e) => setAssignData({ ...assignData, remarks: e.target.value })}
                                            rows={3}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2.5"
                                        />
                                    </div>
                                    {error && <p className="text-sm text-red-600">{error}</p>}
                                </div>
                                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
                                    <button
                                        type="submit"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 sm:text-sm"
                                    >
                                        Transfer
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowTransferModal(false)}
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Return Modal */}
            {showReturnModal && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowReturnModal(false)}></div>
                        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                            <form onSubmit={handleReturn}>
                                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                    Return Asset
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Handover Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={returnData.handoverDate}
                                            onChange={(e) => setReturnData({ ...returnData, handoverDate: e.target.value })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2.5"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Remarks</label>
                                        <textarea
                                            value={returnData.remarks}
                                            onChange={(e) => setReturnData({ ...returnData, remarks: e.target.value })}
                                            rows={3}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2.5"
                                        />
                                    </div>
                                    {error && <p className="text-sm text-red-600">{error}</p>}
                                </div>
                                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
                                    <button
                                        type="submit"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 sm:text-sm"
                                    >
                                        Return
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowReturnModal(false)}
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
