import { useState, useEffect } from 'react';
import { reportService } from '../services/reportService';
import { StockReport } from '../types';

export default function Dashboard() {
    const [stockReport, setStockReport] = useState<StockReport[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStockReport();
    }, []);

    const loadStockReport = async () => {
        try {
            const data = await reportService.getStockReport();
            setStockReport(data);
        } catch (error) {
            console.error('Failed to load stock report', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-10">Loading...</div>;
    }

    return (
        <div className="px-4 sm:px-6 lg:px-8">
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Overview of current inventory stock levels
                    </p>
                </div>
            </div>

            <div className="mt-8 flex flex-col">
                <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
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
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Created By
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {stockReport.map((item) => (
                                        <tr key={item.productId}>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                                                {item.productName}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {item.initialBalance}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {item.totalIn}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {item.totalOut}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                                                {item.currentStock}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {item.createdBy.name}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
