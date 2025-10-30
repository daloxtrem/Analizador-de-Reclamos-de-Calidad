
import React from 'react';
import type { ComparisonResult, Version, Claim, ClaimDiff } from '../types';
import { DataTable } from './DataTable';
import { PlusIcon, MinusIcon, RefreshIcon, XIcon } from './Icons';

interface VersionComparatorProps {
    isOpen: boolean;
    onClose: () => void;
    comparison: ComparisonResult;
    versionA?: Version | null; // Current
    versionB?: Version | null; // Previous
}

const formatDate = (timestamp: number) => new Date(timestamp).toLocaleString('es-ES');

const claimColumns = [
    { accessor: 'numero', header: 'Reclamación' },
    { accessor: 'cliente', header: 'Cliente' },
    { accessor: 'fecha_creacion', header: 'Fecha Creación' },
    { accessor: 'estado', header: 'Estado' },
    { accessor: 'monto_reclamado', header: 'Monto Rec.', isCurrency: true },
    { accessor: 'monto_aceptado', header: 'Monto Acep.', isCurrency: true },
];

const ModifiedClaimRow: React.FC<{ diff: ClaimDiff }> = ({ diff }) => {
    return (
        <tr className="bg-white border-b">
            <td className="px-4 py-2 font-medium">{diff.claimId}</td>
            <td className="px-4 py-2">{diff.current?.cliente}</td>
            <td className="px-4 py-2">
                <ul className="list-disc list-inside">
                {diff.changes?.map(change => (
                    <li key={change.field} className="text-xs">
                        <span className="font-semibold">{change.field}:</span> 
                        <span className="text-red-600 line-through mr-1">{String(change.oldValue)}</span>
                        <span className="text-green-600">{String(change.newValue)}</span>
                    </li>
                ))}
                </ul>
            </td>
        </tr>
    )
}

const VersionComparator: React.FC<VersionComparatorProps> = ({ isOpen, onClose, comparison, versionA, versionB }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex items-center justify-center p-4">
            <div className="bg-gray-100 rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
                <header className="flex items-center justify-between p-4 border-b bg-white rounded-t-lg">
                    <h2 className="text-xl font-bold text-gray-800">Comparador de Versiones</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <XIcon className="h-6 w-6" />
                    </button>
                </header>
                
                <div className="p-6 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-center">
                        <div className="p-3 bg-blue-100 border border-blue-300 rounded">
                            <h3 className="font-semibold">Versión Actual</h3>
                            <p className="text-sm">{versionA ? `${versionA.metadata.name} (${formatDate(versionA.timestamp)})` : 'N/A'}</p>
                            <p className="text-sm">{versionA?.metadata.rows} filas</p>
                        </div>
                         <div className="p-3 bg-gray-200 border border-gray-300 rounded">
                            <h3 className="font-semibold">Versión Anterior</h3>
                             <p className="text-sm">{versionB ? `${versionB.metadata.name} (${formatDate(versionB.timestamp)})` : 'N/A'}</p>
                            <p className="text-sm">{versionB?.metadata.rows} filas</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-green-700 mb-2 flex items-center"><PlusIcon className="mr-2" /> Reclamos Añadidos ({comparison.added.length})</h3>
                            <DataTable columns={claimColumns} data={comparison.added} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-red-700 mb-2 flex items-center"><MinusIcon className="mr-2" /> Reclamos Eliminados ({comparison.removed.length})</h3>
                            <DataTable columns={claimColumns} data={comparison.removed} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-yellow-700 mb-2 flex items-center"><RefreshIcon className="mr-2" /> Reclamos Modificados ({comparison.modified.length})</h3>
                            <div className="overflow-x-auto max-h-80">
                                <table className="w-full text-sm text-left text-gray-500">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                                        <tr>
                                            <th className="px-4 py-3">Reclamación</th>
                                            <th className="px-4 py-3">Cliente</th>
                                            <th className="px-4 py-3">Cambios (Anterior -> Nuevo)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {comparison.modified.length > 0 ? comparison.modified.map(diff => (
                                            <ModifiedClaimRow key={diff.claimId} diff={diff} />
                                        )) : (
                                            <tr><td colSpan={3} className="text-center py-4">No hay reclamos modificados.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VersionComparator;
