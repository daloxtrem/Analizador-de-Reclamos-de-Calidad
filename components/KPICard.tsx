import React from 'react';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from './Icons';

interface KPICardProps {
    title: string;
    value: number;
    variation: number;
    isCurrency?: boolean;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, variation, isCurrency = false }) => {
    const formatValue = (val: number) => {
        if (isCurrency) {
            return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val);
        }
        return new Intl.NumberFormat('es-ES').format(val);
    };

    const isFiniteVariation = isFinite(variation);
    const variationColor = variation > 0 ? 'text-green-600' : variation < 0 ? 'text-red-600' : 'text-gray-500';
    const VariationIcon = variation > 0 ? ArrowUpIcon : variation < 0 ? ArrowDownIcon : MinusIcon;

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm avoid-break">
            <h4 className="text-sm font-medium text-gray-500">{title}</h4>
            <p className="text-3xl font-bold text-gray-800 mt-2">{formatValue(value)}</p>
            <div className={`flex items-center text-sm mt-2 ${variationColor}`}>
                {isFiniteVariation && <VariationIcon className="h-4 w-4 mr-1" />}
                <span>
                    {isFiniteVariation ? `${variation.toFixed(2)}%` : 'N/A'} vs período anterior
                </span>
            </div>
        </div>
    );
};

export default KPICard;