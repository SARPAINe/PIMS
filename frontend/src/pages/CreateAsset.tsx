import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { assetService } from '../services/assetService';
import { AssetType } from '../types';

export default function CreateAsset() {
    const [assetTypes, setAssetTypes] = useState<AssetType[]>([]);
    const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        assetNumber: '',
        serialNumber: '',
        vendorName: '',
        purchaseDate: '',
        purchasePriceBdt: '',
    });
    const [dynamicValues, setDynamicValues] = useState<Record<string, any>>({});
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        loadAssetTypes();
    }, []);

    useEffect(() => {
        if (selectedTypeId) {
            const selectedType = assetTypes.find((t) => Number(t.id) === selectedTypeId);
            console.log('Selected Type:', selectedType);
            console.log('Fields:', selectedType?.fields);
            if (selectedType?.fields) {
                const initialValues: Record<string, any> = {};
                selectedType.fields.forEach((field) => {
                    initialValues[field.fieldKey] = '';
                });
                setDynamicValues(initialValues);
            }
        }
    }, [selectedTypeId, assetTypes]);

    const loadAssetTypes = async () => {
        try {
            const data = await assetService.getAllAssetTypes();
            setAssetTypes(data);
        } catch (error) {
            console.error('Failed to load asset types', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTypeId) {
            setError('Please select an asset type');
            return;
        }

        setError('');
        setSubmitting(true);

        try {
            const selectedType = assetTypes.find((t) => Number(t.id) === selectedTypeId);

            // Validate required fields
            if (selectedType?.fields) {
                for (const field of selectedType.fields) {
                    if (field.isRequired && !dynamicValues[field.fieldKey]) {
                        setError(`${field.fieldLabel} is required`);
                        setSubmitting(false);
                        return;
                    }
                }
            }

            const payload: any = {
                assetTypeId: selectedTypeId,
                assetNumber: formData.assetNumber,
            };

            if (formData.serialNumber) payload.serialNumber = formData.serialNumber;
            if (formData.vendorName) payload.vendorName = formData.vendorName;
            if (formData.purchaseDate) payload.purchaseDate = formData.purchaseDate;
            if (formData.purchasePriceBdt) payload.purchasePriceBdt = parseFloat(formData.purchasePriceBdt);

            // Add dynamic values
            const cleanedDynamicValues: Record<string, any> = {};
            Object.entries(dynamicValues).forEach(([key, value]) => {
                if (value !== '' && value !== null && value !== undefined) {
                    cleanedDynamicValues[key] = value;
                }
            });
            if (Object.keys(cleanedDynamicValues).length > 0) {
                payload.dynamicValues = cleanedDynamicValues;
            }

            await assetService.createAsset(payload);
            navigate('/assets');
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to create asset');
        } finally {
            setSubmitting(false);
        }
    };

    const renderDynamicField = (field: any) => {
        const value = dynamicValues[field.fieldKey] || '';

        switch (field.dataType) {
            case 'STRING':
                return (
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => setDynamicValues({ ...dynamicValues, [field.fieldKey]: e.target.value })}
                        required={field.isRequired}
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 sm:text-sm px-3 py-2.5 transition-all"
                        placeholder={`Enter ${field.fieldLabel.toLowerCase()}`}
                    />
                );
            case 'NUMBER':
                return (
                    <input
                        type="number"
                        step="any"
                        value={value}
                        onChange={(e) => setDynamicValues({ ...dynamicValues, [field.fieldKey]: e.target.value })}
                        required={field.isRequired}
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 sm:text-sm px-3 py-2.5 transition-all"
                        placeholder="0"
                    />
                );
            case 'DATE':
                return (
                    <input
                        type="date"
                        value={value}
                        onChange={(e) => setDynamicValues({ ...dynamicValues, [field.fieldKey]: e.target.value })}
                        required={field.isRequired}
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 sm:text-sm px-3 py-2.5 transition-all"
                    />
                );
            case 'TEXT':
                return (
                    <textarea
                        value={value}
                        onChange={(e) => setDynamicValues({ ...dynamicValues, [field.fieldKey]: e.target.value })}
                        required={field.isRequired}
                        rows={3}
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 sm:text-sm px-3 py-2.5 transition-all"
                        placeholder={`Enter ${field.fieldLabel.toLowerCase()}`}
                    />
                );
            case 'BOOLEAN':
                return (
                    <div className="flex items-center mt-1">
                        <input
                            type="checkbox"
                            checked={value === true || value === 'true'}
                            onChange={(e) => setDynamicValues({ ...dynamicValues, [field.fieldKey]: e.target.checked })}
                            className="h-5 w-5 text-indigo-600 focus:ring-2 focus:ring-indigo-500 border-gray-300 rounded transition-all"
                        />
                        <span className="ml-3 text-sm text-gray-600">Enable {field.fieldLabel.toLowerCase()}</span>
                    </div>
                );
            default:
                return null;
        }
    };

    const selectedType = assetTypes.find((t) => Number(t.id) === selectedTypeId);
    console.log('Render - assetTypes:', assetTypes);
    console.log('Render - selectedTypeId:', selectedTypeId, typeof selectedTypeId);
    console.log('Render - selectedType:', selectedType);
    console.log('Render - selectedType.fields:', selectedType?.fields);

    return (
        <div className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto py-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg">
                            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Create New Asset</h2>
                        <p className="mt-1 text-sm text-gray-500">Add a new asset to your inventory system</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Asset Type Selection */}
                <div className="bg-white shadow-lg rounded-2xl border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <svg className="h-5 w-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            Asset Type
                        </h3>
                        <p className="mt-1 text-sm text-gray-600">Select the category for this asset</p>
                    </div>
                    <div className="px-6 py-5">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Type <span className="text-red-500">*</span>
                        </label>
                        <select
                            required
                            value={selectedTypeId || ''}
                            onChange={(e) => setSelectedTypeId(Number(e.target.value))}
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 sm:text-sm px-3 py-2.5 transition-all"
                        >
                            <option value="">Select asset type...</option>
                            {assetTypes.map((type) => (
                                <option key={type.id} value={type.id}>
                                    {type.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Basic Information */}
                <div className="bg-white shadow-lg rounded-2xl border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <svg className="h-5 w-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Basic Information
                        </h3>
                        <p className="mt-1 text-sm text-gray-600">Core asset details and identification</p>
                    </div>
                    <div className="px-6 py-5 space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Asset Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.assetNumber}
                                onChange={(e) => setFormData({ ...formData, assetNumber: e.target.value })}
                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 sm:text-sm px-3 py-2.5 transition-all"
                                placeholder="e.g., LAP-2024-001"
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Serial Number
                                </label>
                                <input
                                    type="text"
                                    value={formData.serialNumber}
                                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 sm:text-sm px-3 py-2.5 transition-all"
                                    placeholder="Device serial number"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Vendor Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.vendorName}
                                    onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 sm:text-sm px-3 py-2.5 transition-all"
                                    placeholder="Vendor or manufacturer"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Purchase Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.purchaseDate}
                                    onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 sm:text-sm px-3 py-2.5 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Purchase Price (BDT)
                                </label>
                                <div className="relative rounded-lg shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="text-gray-500 sm:text-sm">৳</span>
                                    </div>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.purchasePriceBdt}
                                        onChange={(e) => setFormData({ ...formData, purchasePriceBdt: e.target.value })}
                                        className="block w-full rounded-lg border-gray-300 pl-8 pr-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 sm:text-sm py-2.5 transition-all"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dynamic Fields */}
                {selectedType && selectedType.fields && selectedType.fields.length > 0 && (
                    <div className="bg-white shadow-lg rounded-2xl border border-gray-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-green-50 to-teal-50 px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                <svg className="h-5 w-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                {selectedType.name} Specifications
                            </h3>
                            <p className="mt-1 text-sm text-gray-600">Type-specific technical details</p>
                        </div>
                        <div className="px-6 py-5 space-y-5">
                            {selectedType.fields.map((field) => (
                                <div key={field.id}>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {field.fieldLabel}
                                        {field.isRequired && <span className="text-red-500"> *</span>}
                                    </label>
                                    {renderDynamicField(field)}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* No Custom Fields Notice */}
                {selectedType && (!selectedType.fields || selectedType.fields.length === 0) && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg rounded-2xl border-2 border-dashed border-blue-300 overflow-hidden">
                        <div className="px-6 py-8 text-center">
                            <div className="mx-auto h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                                <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                No Custom Fields Defined
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">
                                The "<span className="font-medium">{selectedType.name}</span>" asset type doesn't have any custom fields yet.
                            </p>
                            <p className="text-sm text-gray-500">
                                💡 You can add custom fields like CPU Model, RAM Size, etc. by going to the{' '}
                                <a href="/asset-types" className="text-indigo-600 hover:text-indigo-700 font-medium underline">
                                    Asset Types
                                </a>{' '}
                                page.
                            </p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="rounded-xl bg-red-50 border border-red-200 p-4 shadow-sm">
                        <div className="flex">
                            <svg className="h-5 w-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm font-medium text-red-800">{error}</p>
                        </div>
                    </div>
                )}

                <div className="flex justify-end space-x-4 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/assets')}
                        className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
                    >
                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent shadow-lg text-sm font-medium rounded-xl text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {submitting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creating...
                            </>
                        ) : (
                            <>
                                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Create Asset
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
