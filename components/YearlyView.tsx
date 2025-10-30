
import React, { useMemo } from 'react';
import type { Claim } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PrintIcon } from './Icons';

interface YearlyViewProps {
    data: Claim[];
}

const YearlyView: React.FC<YearlyViewProps> = ({ data }) => {
    const yearlyData = useMemo(() => {
        const monthlyAggregates: { [key: string]: { name: string, reclamado: number, aceptado: number, count: number } } = {};
        
        data.forEach(claim => {
            if (claim.fecha_creacion) {
                const month = claim.fecha_creacion.substring(0, 7); // YYYY-MM
                if (!monthlyAggregates[month]) {
                    const monthName = new Date(claim.fecha_creacion).toLocaleString('es-ES', { month: 'short', year: 'numeric' });
                    monthlyAggregates[month] = { name: monthName, reclamado: 0, aceptado: 0, count: 0 };
                }
                monthlyAggregates[month].reclamado += claim.monto_reclamado;
                monthlyAggregates[month].aceptado += claim.monto_aceptado;
                monthlyAggregates[month].count++;
            }
        });

        return Object.values(monthlyAggregates).sort((a,b) => a.name.localeCompare(b.name));
    }, [data]);

    const handlePrint = () => {
        const element = document.getElementById('yearly-view-printable');
        if (element) {
            const opt = {
                margin:       0.5,
                filename:     'acumulado_anual.pdf',
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, useCORS: true },
                jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
            };
            (window as any).html2pdf().from(element).set(opt).save();
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm" id="yearly-view-printable">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Acumulado del Año</h2>
                <button onClick={handlePrint} className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center print-hide">
                    <PrintIcon className="mr-2"/> Imprimir / PDF
                </button>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-700 mt-6 mb-4">Evolución Mensual de Reclamos</h3>
            <ResponsiveContainer width="100%" height={400}>
                <BarChart data={yearlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" label={{ value: 'Monto (€)', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" stroke="#10b981" label={{ value: 'Nº Reclamos', angle: 90, position: 'insideRight' }}/>
                    <Tooltip formatter={(value, name) => [name === 'count' ? value : new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(Number(value)), '']} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="reclamado" fill="#3b82f6" name="Monto Reclamado" />
                    <Bar yAxisId="left" dataKey="aceptado" fill="#84cc16" name="Monto Aceptado" />
                    <Bar yAxisId="right" dataKey="count" fill="#a855f7" name="Nº Reclamos" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default YearlyView;
