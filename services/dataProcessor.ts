
import type { Claim } from '../types';

interface PeriodStats {
    newClaims: number;
    acceptedClaims: number;
    totalClaimed: number;
    totalAccepted: number;
}

const getPeriodStats = (data: Claim[], startDate: Date, endDate: Date): PeriodStats => {
    const claimsInPeriod = data.filter(c => {
        const creationDate = new Date(c.fecha_creacion);
        return creationDate >= startDate && creationDate <= endDate;
    });

    return {
        newClaims: claimsInPeriod.length,
        acceptedClaims: claimsInPeriod.filter(c => c.estado === 'SI' || c.estado === 'PARCIAL').length,
        totalClaimed: claimsInPeriod.reduce((sum, c) => sum + c.monto_reclamado, 0),
        totalAccepted: claimsInPeriod.reduce((sum, c) => sum + c.monto_aceptado, 0),
    };
};

export const calculateKPIs = (currentData: Claim[], previousData: Claim[] | undefined, days: number) => {
    const today = new Date();
    const endDateCurrent = new Date(today);
    const startDateCurrent = new Date(today);
    startDateCurrent.setDate(today.getDate() - days);

    const endDatePrevious = new Date(startDateCurrent);
    endDatePrevious.setDate(endDatePrevious.getDate() - 1);
    const startDatePrevious = new Date(endDatePrevious);
    startDatePrevious.setDate(endDatePrevious.getDate() - days + 1);

    const currentPeriodStats = getPeriodStats(currentData, startDateCurrent, endDateCurrent);
    const dataForPreviousPeriod = previousData || currentData;
    const previousPeriodStats = getPeriodStats(dataForPreviousPeriod, startDatePrevious, endDatePrevious);

    const calculateVariation = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? Infinity : 0;
        return ((current - previous) / previous) * 100;
    };

    return {
        newClaims: {
            value: currentPeriodStats.newClaims,
            variation: calculateVariation(currentPeriodStats.newClaims, previousPeriodStats.newClaims)
        },
        acceptedClaims: {
            value: currentPeriodStats.acceptedClaims,
            variation: calculateVariation(currentPeriodStats.acceptedClaims, previousPeriodStats.acceptedClaims)
        },
        totalClaimed: {
            value: currentPeriodStats.totalClaimed,
            variation: calculateVariation(currentPeriodStats.totalClaimed, previousPeriodStats.totalClaimed)
        },
        totalAccepted: {
            value: currentPeriodStats.totalAccepted,
            variation: calculateVariation(currentPeriodStats.totalAccepted, previousPeriodStats.totalAccepted)
        }
    };
};

export const getTopClients = (data: Claim[], days: number) => {
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - days);

    const claimsInPeriod = data.filter(c => new Date(c.fecha_creacion) >= startDate);
    
    const clientTotals = claimsInPeriod.reduce((acc, claim) => {
        acc[claim.cliente] = (acc[claim.cliente] || 0) + claim.monto_reclamado;
        return acc;
    }, {} as { [key: string]: number });

    return Object.entries(clientTotals)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, value]) => ({ name, value }));
};

export const getModifiedClaims = (data: Claim[], days: number) => {
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - days);

    return data.filter(c => {
        const modDate = new Date(c.fecha_calidad);
        const creationDate = new Date(c.fecha_creacion);
        // Modified if mod date is in period and it's different from creation date
        return modDate >= startDate && c.fecha_calidad !== c.fecha_creacion;
    });
};
