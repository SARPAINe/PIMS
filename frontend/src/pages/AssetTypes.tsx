import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { assetService } from '../services/assetService';
import { AssetType, AssetFieldType } from '../types';
import { useAuth } from '../contexts/AuthContext';

const fieldTypeOptions: AssetFieldType[] = ['STRING', 'NUMBER', 'DATE', 'TEXT', 'BOOLEAN'];

export default function AssetTypes() {
    const [assetTypes, setAssetTypes] = useState<AssetType[]>([]);
    const [loading, setLoading] = useState(true);
    const [showTypeModal, setShowTypeModal] = useState(false);
    const [showFieldModal, setShowFieldModal] = useState(false);
    const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
    const [newTypeName, setNewTypeName] = useState('');
    const [newField, setNewField] = useState({
        fieldKey: '',
        fieldLabel: '',
        dataType: 'STRING' as AssetFieldType,
        isRequired: false,
        sortOrder: 0,
    });
    const [error, setError] = useState('');
    const { isAdmin } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        loadAssetTypes();
    }, []);

    const loadAssetTypes = async () => {
        try {
            const data = await assetService.getAllAssetTypes();
            setAssetTypes(data);
        } catch (error) {
            console.error('Failed to load asset types', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateType = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await assetService.createAssetType({ name: newTypeName });
            setNewTypeName('');
            setShowTypeModal(false);
            loadAssetTypes();
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to create asset type');
        }
    };

    const handleAddField = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTypeId) return;
        setError('');

        try {
            await assetService.addFieldToAssetType(selectedTypeId, newField);
            setNewField({
                fieldKey: '',
                fieldLabel: '',
                dataType: 'STRING',
                isRequired: false,
                sortOrder: 0,
            });
            setShowFieldModal(false);
            setSelectedTypeId(null);
            loadAssetTypes();
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to add field');
        }
    };

    const openFieldModal = (typeId: number) => {
        setSelectedTypeId(typeId);
        setShowFieldModal(true);
        setError('');
    };

    if (loading) {
        return <div className="text-center py-10">Loading...</div>;
    }

    return (
        <div className="px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold text-gray-900">Asset Types</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Define asset categories and their custom fields
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-3">
                    <button
                        onClick={() => navigate('/assets')}
                        className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                    >
                        Back to Assets
                    </button>
                    {isAdmin && (
                        <button
                            onClick={() => {
                                setShowTypeModal(true);
                                setError('');
                            }}
                            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
                        >
                            Add Asset Type
                        </button>
                    )}
                </div>
            </div>

            {/* Asset Types List */}
            <div className="mt-8 space-y-6">
                {assetTypes.length === 0 ? (
                    <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300 shadow-inner">
                        <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <h3 className="mt-4 text-lg font-medium text-gray-900">No asset types found</h3>
                        <p className="mt-2 text-sm text-gray-500">Get started by creating your first asset type.</p>
                    </div>
                ) : (
                    assetTypes.map((type) => (
                        <div key={type.id} className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200 hover:shadow-2xl transition-shadow duration-300">
                            <div className="px-6 py-5 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-b border-gray-200 flex justify-between items-center">
                                <div className="flex items-center space-x-3">
                                    <div className="flex-shrink-0">
                                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                                            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">{type.name}</h3>
                                        <p className="mt-1 text-sm text-gray-600 flex items-center">
                                            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            Created on {new Date(type.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                {isAdmin && (
                                    <button
                                        onClick={() => openFieldModal(type.id)}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
                                    >
                                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Add Field
                                    </button>
                                )}
                            </div>

                            {type.fields && type.fields.length > 0 ? (
                                <div className="px-6 py-5">
                                    <div className="overflow-hidden rounded-lg border border-gray-200">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                        Field Label
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                        Field Key
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                        Data Type
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                        Required
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                        Sort Order
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 bg-white">
                                                {type.fields.map((field, idx) => (
                                                    <tr key={field.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                            {field.fieldLabel}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-600 font-mono bg-gray-50 rounded">
                                                            {field.fieldKey}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">
                                                            <span className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-100 to-blue-200 px-3 py-1 text-xs font-semibold text-blue-800">
                                                                {field.dataType === 'STRING' && '📝 '}
                                                                {field.dataType === 'NUMBER' && '🔢 '}
                                                                {field.dataType === 'DATE' && '📅 '}
                                                                {field.dataType === 'TEXT' && '📄 '}
                                                                {field.dataType === 'BOOLEAN' && '✓ '}
                                                                {field.dataType}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">
                                                            {field.isRequired ? (
                                                                <span className="inline-flex items-center text-red-600 font-medium">
                                                                    <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                                                                    </svg>
                                                                    Required
                                                                </span>
                                                            ) : (
                                                                <span className="text-gray-400">Optional</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">
                                                            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-200 text-xs font-medium">
                                                                {field.sortOrder}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="px-6 py-12 text-center">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    <p className="mt-3 text-sm font-medium text-gray-900">No fields defined yet</p>
                                    <p className="mt-1 text-sm text-gray-500">Add custom fields to make this asset type more specific</p>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Create Type Modal */}
            {showTypeModal && (
                <div className="fixed z-50 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity backdrop-blur-sm" onClick={() => setShowTypeModal(false)}></div>

                        <div className="inline-block align-bottom bg-white rounded-2xl px-6 pt-6 pb-6 text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <form onSubmit={handleCreateType}>
                                <div className="mb-6">
                                    <div className="flex items-center space-x-3 mb-4">
                                        <div className="flex-shrink-0">
                                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900">
                                            Create Asset Type
                                        </h3>
                                    </div>
                                    <p className="text-sm text-gray-500">Define a new category for your assets</p>
                                </div>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Asset Type Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={newTypeName}
                                        onChange={(e) => setNewTypeName(e.target.value)}
                                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 sm:text-sm px-3 py-2.5 transition-all"
                                        placeholder="e.g., Laptop, Monitor, Furniture"
                                        autoFocus
                                    />
                                </div>
                                {error && (
                                    <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3">
                                        <p className="text-sm text-red-800">{error}</p>
                                    </div>
                                )}
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowTypeModal(false)}
                                        className="flex-1 inline-flex justify-center items-center rounded-xl border border-gray-300 shadow-sm px-4 py-3 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
                                    >
                                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 inline-flex justify-center items-center rounded-xl border border-transparent shadow-lg px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-sm font-medium text-white hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
                                    >
                                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Create Type
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Field Modal */}
            {showFieldModal && (
                <div className="fixed z-50 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity backdrop-blur-sm" onClick={() => setShowFieldModal(false)}></div>

                        <div className="inline-block align-bottom bg-white rounded-2xl px-6 pt-6 pb-6 text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full">
                            <form onSubmit={handleAddField}>
                                <div className="mb-6">
                                    <div className="flex items-center space-x-3 mb-4">
                                        <div className="flex-shrink-0">
                                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
                                                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                            </div>
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900">
                                            Add Custom Field
                                        </h3>
                                    </div>
                                    <p className="text-sm text-gray-500">Define a new field for this asset type</p>
                                </div>

                                <div className="space-y-5 mb-6">
                                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Field Label <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={newField.fieldLabel}
                                                onChange={(e) => setNewField({ ...newField, fieldLabel: e.target.value })}
                                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 sm:text-sm px-3 py-2.5 transition-all"
                                                placeholder="e.g., Processor"
                                                autoFocus
                                            />
                                            <p className="mt-1 text-xs text-gray-500">Display name for this field</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Field Key <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={newField.fieldKey}
                                                onChange={(e) => setNewField({ ...newField, fieldKey: e.target.value.replace(/\s/g, '_').toLowerCase() })}
                                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 sm:text-sm px-3 py-2.5 font-mono transition-all"
                                                placeholder="e.g., processor"
                                            />
                                            <p className="mt-1 text-xs text-gray-500">Internal identifier (no spaces)</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Data Type <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={newField.dataType}
                                                onChange={(e) => setNewField({ ...newField, dataType: e.target.value as AssetFieldType })}
                                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 sm:text-sm px-3 py-2.5 transition-all"
                                            >
                                                {fieldTypeOptions.map((type) => (
                                                    <option key={type} value={type}>
                                                        {type === 'STRING' && '📝 '}{type === 'NUMBER' && '🔢 '}{type === 'DATE' && '📅 '}{type === 'TEXT' && '📄 '}{type === 'BOOLEAN' && '✓ '}{type}
                                                    </option>
                                                ))}
                                            </select>
                                            <p className="mt-1 text-xs text-gray-500">Type of data to store</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Sort Order
                                            </label>
                                            <input
                                                type="number"
                                                value={newField.sortOrder}
                                                onChange={(e) => setNewField({ ...newField, sortOrder: Number(e.target.value) })}
                                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 sm:text-sm px-3 py-2.5 transition-all"
                                                placeholder="0"
                                            />
                                            <p className="mt-1 text-xs text-gray-500">Display order in forms</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <div className="flex items-center h-5 mt-1">
                                            <input
                                                type="checkbox"
                                                checked={newField.isRequired}
                                                onChange={(e) => setNewField({ ...newField, isRequired: e.target.checked })}
                                                className="h-5 w-5 text-indigo-600 focus:ring-2 focus:ring-indigo-500 border-gray-300 rounded transition-all"
                                            />
                                        </div>
                                        <div className="ml-3 text-sm">
                                            <label className="font-medium text-gray-900">
                                                Required field
                                            </label>
                                            <p className="text-gray-500">Users must provide a value for this field</p>
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3">
                                        <p className="text-sm text-red-800">{error}</p>
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowFieldModal(false)}
                                        className="flex-1 inline-flex justify-center items-center rounded-xl border border-gray-300 shadow-sm px-4 py-3 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
                                    >
                                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 inline-flex justify-center items-center rounded-xl border border-transparent shadow-lg px-4 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-sm font-medium text-white hover:from-green-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all"
                                    >
                                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Add Field
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
