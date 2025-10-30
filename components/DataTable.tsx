
import React, { useState, useMemo } from 'react';
import { DownloadIcon, ChevronUpIcon, ChevronDownIcon } from './Icons';

interface Column {
    accessor: string;
    header: string;
    isCurrency?: boolean;
}

interface DataTableProps {
    columns: Column[];
    data: any[];
    exportable?: boolean;
    fileName?: string;
}

const formatValue = (value: any, isCurrency?: boolean) => {
    if (value === null || typeof value === 'undefined') return '';
    if (isCurrency) {
        return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(Number(value));
    }
    return String(value);
};

export const DataTable: React.FC<DataTableProps> = ({ columns, data, exportable = false, fileName = 'export' }) => {
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

    const sortedData = useMemo(() => {
        let sortableData = [...data];
        if (sortConfig !== null) {
            sortableData.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableData;
    }, [data, sortConfig]);

    const requestSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: string) => {
        if (!sortConfig || sortConfig.key !== key) {
            return null;
        }
        return sortConfig.direction === 'asc' ? <ChevronUpIcon className="inline ml-1 h-4 w-4" /> : <ChevronDownIcon className="inline ml-1 h-4 w-4" />;
    }

    const exportToCSV = () => {
        const headerRow = columns.map(c => c.header).join(',');
        const dataRows = sortedData.map(row => 
            columns.map(col => `"${formatValue(row[col.accessor], col.isCurrency).replace(/"/g, '""')}"`).join(',')
        );
        const csvContent = [headerRow, ...dataRows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `${fileName}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div>
            {exportable && data.length > 0 && (
                <div className="flex justify-end mb-2">
                    <button onClick={exportToCSV} className="bg-primary-600 text-white px-3 py-1.5 rounded-md hover:bg-primary-700 text-sm flex items-center">
                        <DownloadIcon className="mr-2" /> Exportar a CSV
                    </button>
                </div>
            )}
            <div className="overflow-x-auto max-h-80">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                        <tr>
                            {columns.map(col => (
                                <th key={col.accessor} scope="col" className="px-4 py-3 cursor-pointer" onClick={() => requestSort(col.accessor)}>
                                    {col.header} {getSortIcon(col.accessor)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {sortedData.length > 0 ? sortedData.map((row, index) => (
                            <tr key={index} className="bg-white border-b hover:bg-gray-50">
                                {columns.map(col => (
                                    <td key={col.accessor} className="px-4 py-2">
                                        {formatValue(row[col.accessor], col.isCurrency)}
                                    </td>
                                ))}
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={columns.length} className="text-center py-4">No hay datos disponibles.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
