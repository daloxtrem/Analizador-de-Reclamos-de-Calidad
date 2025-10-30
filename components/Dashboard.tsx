import React, { useState, useMemo } from 'react';
import type { Claim, ComparisonResult, ClaimDiff } from '../types';
import { calculateKPIs, getTopClients } from '../services/dataProcessor';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import KPICard from './KPICard';
import { DataTable } from './DataTable';
import { ChartIcon, RefreshIcon, PrintIcon, PlusIcon, MinusIcon } from './Icons';

interface DashboardProps {
    currentData: Claim[];
    previousData?: Claim[];
    comparisonResult: ComparisonResult | null;
}

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

const Dashboard: React.FC<DashboardProps> = ({ currentData, previousData, comparisonResult }) => {
    const [days, setDays] = useState(7);

    const { kpis, topClients } = useMemo(() => {
        return {
            kpis: calculateKPIs(currentData, previousData, days),
            topClients: getTopClients(currentData, days),
        };
    }, [currentData, previousData, days]);

    const versionComparisonStats = useMemo(() => {
        if (!comparisonResult) {
            return null;
        }

        const addedCount = comparisonResult.added.length;

        const closedCount = comparisonResult.modified.filter(
            diff => diff.changes?.some(c => c.field === 'estado' && c.oldValue !== 'SI' && c.newValue === 'SI')
        ).length;

        const paymentsRequestedCount = comparisonResult.modified.filter(
            diff => (diff.previous?.monto_aceptado === 0 || !diff.previous?.monto_aceptado) && (diff.current?.monto_aceptado ?? 0) > 0
        ).length;

        const addedAmount = comparisonResult.added.reduce((sum, claim) => sum + (claim.monto_aceptado || 0), 0);
        const removedAmount = comparisonResult.removed.reduce((sum, claim) => sum + (claim.monto_aceptado || 0), 0);
        const modifiedAmountChange = comparisonResult.modified.reduce((sum, diff) => {
            const oldVal = diff.previous?.monto_aceptado ?? 0;
            const newVal = diff.current?.monto_aceptado ?? 0;
            return sum + (newVal - oldVal);
        }, 0);

        const netAcceptedAmountChange = addedAmount - removedAmount + modifiedAmountChange;

        return {
            addedCount,
            closedCount,
            paymentsRequestedCount,
            netAcceptedAmountChange,
        };

    }, [comparisonResult]);


    const claimColumns = [
        { accessor: 'numero', header: 'Reclamación' },
        { accessor: 'cliente', header: 'Cliente' },
        { accessor: 'fecha_creacion', header: 'Fecha Creación' },
        { accessor: 'estado', header: 'Aceptación' },
        { accessor: 'monto_reclamado', header: 'Monto Rec.', isCurrency: true },
    ];
    
    const handlePrint = () => {
        const element = document.getElementById('dashboard-printable');
        if (element) {
            const opt = {
                margin:       0.5,
                filename:     'dashboard_analisis_reclamos.pdf',
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, useCORS: true },
                jsPDF:        { unit: 'in', format: 'a4', orientation: 'landscape' }
            };
            (window as any).html2pdf().from(element).set(opt).save();
        }
    };

    return (
        <div className="space-y-6" id="dashboard-printable">
            <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between print-hide">
                <h2 className="text-xl font-semibold text-gray-800">Dashboard de Análisis</h2>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <label htmlFor="days-select" className="text-sm font-medium text-gray-600">Período:</label>
                        <select
                            id="days-select"
                            value={days}
                            onChange={(e) => setDays(Number(e.target.value))}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2"
                        >
                            <option value="7">Últimos 7 días</option>
                            <option value="15">Últimos 15 días</option>
                            <option value="30">Últimos 30 días</option>
                            <option value="90">Últimos 90 días</option>
                        </select>
                    </div>
                     <button onClick={handlePrint} className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center">
                        <PrintIcon className="mr-2"/> Imprimir / PDF
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 print:grid-cols-2">
                <KPICard title="Nuevos Reclamos" value={kpis.newClaims.value} variation={kpis.newClaims.variation} />
                <KPICard title="Reclamos Aceptados" value={kpis.acceptedClaims.value} variation={kpis.acceptedClaims.variation} />
                <KPICard title="Monto Reclamado" value={kpis.totalClaimed.value} variation={kpis.totalClaimed.variation} isCurrency />
                <KPICard title="Monto Aceptado" value={kpis.totalAccepted.value} variation={kpis.totalAccepted.variation} isCurrency />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm avoid-break">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center"><ChartIcon className="mr-2" /> Top 5 Clientes por Monto Reclamado</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topClients} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tickFormatter={(value) => `€${new Intl.NumberFormat('es-ES').format(value)}`} />
                        <Tooltip formatter={(value: number) => [new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value), 'Monto']} />
                        <Legend />
                        <Bar dataKey="value" fill="#3b82f6" name="Monto Reclamado" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            
            {comparisonResult && versionComparisonStats && (
                <div className="bg-white p-6 rounded-lg shadow-sm avoid-break">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Resumen de Cambios vs Versión Anterior</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 text-center print:grid-cols-2">
                        <div className="p-3 bg-green-100 border border-green-200 rounded-lg avoid-break">
                            <p className="font-bold text-green-800 text-2xl">{versionComparisonStats.addedCount}</p>
                            <p className="text-sm font-medium text-green-700">Reclamos Añadidos</p>
                        </div>
                        <div className="p-3 bg-blue-100 border border-blue-200 rounded-lg avoid-break">
                             <p className="font-bold text-blue-800 text-2xl">{versionComparisonStats.closedCount}</p>
                            <p className="text-sm font-medium text-blue-700">Reclamos Cerrados</p>
                        </div>
                         <div className="p-3 bg-purple-100 border border-purple-200 rounded-lg avoid-break">
                             <p className="font-bold text-purple-800 text-2xl">{versionComparisonStats.paymentsRequestedCount}</p>
                            <p className="text-sm font-medium text-purple-700">Abonos Solicitados</p>
                        </div>
                         <div className={`p-3 rounded-lg border avoid-break ${versionComparisonStats.netAcceptedAmountChange >= 0 ? 'bg-green-100 border-green-200' : 'bg-red-100 border-red-200'}`}>
                            <p className={`font-bold text-2xl ${versionComparisonStats.netAcceptedAmountChange >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                                {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(versionComparisonStats.netAcceptedAmountChange)}
                            </p>
                            <p className={`text-sm font-medium ${versionComparisonStats.netAcceptedAmountChange >= 0 ? 'text-green-700' : 'text-red-700'}`}>Variación Importe Aceptado</p>
                        </div>
                    </div>
                    
                    <div className="space-y-6">
                         {comparisonResult.added.length > 0 && (
                            <div className="avoid-break">
                                <h4 className="text-md font-semibold text-green-700 mb-2 flex items-center"><PlusIcon className="mr-2" /> Detalle de Reclamos Añadidos</h4>
                                <DataTable columns={claimColumns} data={comparisonResult.added} exportable />
                            </div>
                        )}
                        {comparisonResult.removed.length > 0 && (
                            <div className="avoid-break">
                                <h4 className="text-md font-semibold text-red-700 mb-2 flex items-center"><MinusIcon className="mr-2" /> Detalle de Reclamos Eliminados</h4>
                                <DataTable columns={claimColumns} data={comparisonResult.removed} exportable />
                            </div>
                        )}
                        {comparisonResult.modified.length > 0 && (
                            <div className="avoid-break">
                                <h4 className="text-md font-semibold text-yellow-700 mb-2 flex items-center"><RefreshIcon className="mr-2" /> Detalle de Reclamos Modificados</h4>
                                <div className="overflow-x-auto max-h-80 print-overflow-visible">
                                    <table className="w-full text-sm text-left text-gray-500">
                                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                                            <tr>
                                                <th className="px-4 py-3">Reclamación</th>
                                                <th className="px-4 py-3">Cliente</th>
                                                <th className="px-4 py-3">Cambios (Anterior -> Nuevo)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {comparisonResult.modified.map(diff => (
                                                <ModifiedClaimRow key={diff.claimId} diff={diff} />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
             <style>{`
                @media print {
                    .print-hide { display: none !important; }
                    body, #dashboard-printable {
                        margin: 0;
                        padding: 0;
                        box-shadow: none !important;
                        font-size: 9pt;
                        -webkit-print-color-adjust: exact;
                    }
                    .bg-white {
                        box-shadow: none !important;
                        border: 1px solid #eee !important;
                        border-radius: 0 !important;
                    }
                    .avoid-break {
                        page-break-inside: avoid;
                    }
                    .print-overflow-visible {
                        overflow: visible !important;
                        max-height: none !important;
                    }
                    h3, h4 {
                        padding-top: 1rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default Dashboard;