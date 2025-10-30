
import React, { useState, useMemo } from 'react';
import type { Claim } from '../types';
import { DataTable } from './DataTable';
import { PrintIcon } from './Icons';

interface MonthlyViewProps {
    data: Claim[];
}

const MonthlyView: React.FC<MonthlyViewProps> = ({ data }) => {
    const availableMonths = useMemo(() => {
        const months = new Set<string>();
        data.forEach(claim => {
            if (claim.fecha_creacion) {
                months.add(claim.fecha_creacion.substring(0, 7)); // YYYY-MM
            }
        });
        return Array.from(months).sort().reverse();
    }, [data]);

    const [selectedMonth, setSelectedMonth] = useState<string>(availableMonths[0] || '');

    const filteredData = useMemo(() => {
        if (!selectedMonth) return [];
        return data.filter(claim => claim.fecha_creacion && claim.fecha_creacion.startsWith(selectedMonth));
    }, [data, selectedMonth]);

    const columns = [
        { accessor: 'numero', header: 'Reclamación' },
        { accessor: 'cliente', header: 'Cliente' },
        { accessor: 'fecha_creacion', header: 'Fecha Creación' },
        { accessor: 'estado', header: 'Estado' },
        { accessor: 'monto_reclamado', header: 'Monto Rec.', isCurrency: true },
        { accessor: 'monto_aceptado', header: 'Monto Acep.', isCurrency: true },
        { accessor: 'motivo', header: 'Motivo' },
    ];

    const handlePrint = () => {
        const element = document.getElementById('monthly-view-printable');
        if (element) {
            const monthName = new Date(selectedMonth + '-02').toLocaleString('es-ES', { month: 'long', year: 'numeric'});
            const opt = {
                margin: 0.5,
                filename: `detalle_mensual_${monthName.replace(' ', '_')}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' }
            };
            (window as any).html2pdf().from(element).set(opt).save();
        }
    };
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <div id="monthly-view-printable">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Vista Mensual</h2>
                    <div className="flex items-center space-x-4 print-hide">
                         <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2"
                        >
                            <option value="">Seleccione un mes</option>
                            {availableMonths.map(month => (
                                <option key={month} value={month}>
                                    {new Date(month + '-02').toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
                                </option>
                            ))}
                        </select>
                        <button onClick={handlePrint} className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center">
                            <PrintIcon className="mr-2"/> Imprimir / PDF
                        </button>
                    </div>
                </div>
                
                {selectedMonth && (
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center print-show">
                        Detalle de Reclamos - {new Date(selectedMonth + '-02').toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
                    </h3>
                )}

                <DataTable columns={columns} data={filteredData} exportable={true} fileName={`reclamos_${selectedMonth}`} />
            </div>
             <style>{`
                @media print {
                    .print-hide { display: none; }
                    .print-show { display: block !important; }
                    body, #monthly-view-printable {
                        margin: 0;
                        padding: 0;
                    }
                }
                .print-show { display: none; }
            `}</style>
        </div>
    );
};

export default MonthlyView;
