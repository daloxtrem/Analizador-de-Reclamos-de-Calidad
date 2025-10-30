import type { Claim, DataWithErrors } from '../types';
import { HEADER_MAPPINGS } from '../constants';

const normalizeHeader = (header: string): string => {
    return (header || '')
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ')
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
};

export const mapHeaders = (rawHeaders: any[]): { [key: string]: keyof Claim } => {
    const headerMap: { [key: string]: keyof Claim } = {};
    rawHeaders.forEach((header, index) => {
        const normalized = normalizeHeader(header);
        if (HEADER_MAPPINGS[normalized]) {
            headerMap[index] = HEADER_MAPPINGS[normalized];
        }
    });
    return headerMap;
};

const parseNumber = (value: any): number => {
    if (typeof value === 'number') return value;
    if (typeof value !== 'string' || !value) return 0;

    let cleanValue = value.replace(/[€$ ]/g, '');
    
    const hasComma = cleanValue.includes(',');
    const hasDot = cleanValue.includes('.');

    if (hasComma && hasDot) {
        if (cleanValue.lastIndexOf(',') > cleanValue.lastIndexOf('.')) {
            // Format: 1.234,56
            cleanValue = cleanValue.replace(/\./g, '').replace(',', '.');
        } else {
            // Format: 1,234.56
            cleanValue = cleanValue.replace(/,/g, '');
        }
    } else if (hasComma) {
        // Assume comma is decimal
        cleanValue = cleanValue.replace(',', '.');
    }

    const number = parseFloat(cleanValue);
    return isNaN(number) ? 0 : number;
};

const parseDate = (value: any): string => {
    if (!value) return '';
    if (value instanceof Date) return value.toISOString().split('T')[0];
    
    const strValue = String(value).trim();
    
    // Handle Excel serial date number
    if (/^\d{5}$/.test(strValue)) {
        const excelEpoch = new Date(1899, 11, 30);
        const date = new Date(excelEpoch.getTime() + parseInt(strValue, 10) * 86400000);
        if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
        }
    }

    let date;
    // YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}/.test(strValue)) {
        date = new Date(strValue);
    }
    // DD/MM/YYYY or DD-MM-YYYY
    else if (/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/.test(strValue)) {
        const parts = strValue.split(/[/-]/);
        date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    }
    // MM/DD/YYYY or MM-DD-YYYY
    else if (/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/.test(strValue)) {
        date = new Date(strValue);
    } 
    else {
        date = new Date(strValue);
    }

    return date && !isNaN(date.getTime()) ? date.toISOString().split('T')[0] : '';
};

const normalizeEstado = (value: any): 'SI' | 'NO' | 'PARCIAL' => {
    const strValue = String(value || '').toLowerCase().trim();
    if (['si', 'aceptado', 'ok', 'aprobado', 'completo'].includes(strValue)) return 'SI';
    if (['parcial', 'parcialmente'].includes(strValue)) return 'PARCIAL';
    // Everything else is considered not accepted
    return 'NO';
};

export const transformRow = (row: any[], headerMap: { [key: number]: keyof Claim }): Partial<Claim> => {
    const claim: Partial<Claim> = {};
    for (const index in headerMap) {
        const key = headerMap[index];
        const rawValue = row[index];
        
        switch (key) {
            case 'numero':
            case 'cliente':
            case 'motivo':
            case 'motivo_cliente':
            case 'resolucion':
            case 'mail_autorizacion_abono':
            case 'autorizacion':
            case 'envio_a_cliente':
            case 'observaciones':
                claim[key] = String(rawValue || '');
                break;
            case 'monto_reclamado':
            case 'monto_aceptado':
            case 'abono':
            case 'dias_espera':
                claim[key] = parseNumber(rawValue);
                break;
            case 'fecha_calidad':
            case 'fecha_cierre':
                claim[key] = parseDate(rawValue);
                break;
            case 'estado':
                claim[key] = normalizeEstado(rawValue);
                break;
        }
    }
    return claim;
};

export const processRawData = (rawData: any[][]): DataWithErrors => {
    if (!rawData || rawData.length < 2) {
        return { data: [], errors: [], errorRows: [] };
    }

    const headers = rawData[0];
    const dataRows = rawData.slice(1);
    const headerMap = mapHeaders(headers);
    const processedClaims: Claim[] = [];
    const errors: { rowIndex: number; error: string; rowData: any }[] = [];
    const errorRows: any[][] = [];

    const claimIds = new Set<string>();

    dataRows.forEach((row, index) => {
        try {
            const partialClaim = transformRow(row, headerMap);

            if (!partialClaim.numero) {
                throw new Error("Falta el número de reclamación (ID único).");
            }
            
            if (claimIds.has(partialClaim.numero)) {
                // Defaulting to skip duplicate
                return;
            }
            claimIds.add(partialClaim.numero);

            const completeClaim: Claim = {
                id: partialClaim.numero,
                numero: partialClaim.numero,
                cliente: partialClaim.cliente || 'N/A',
                monto_reclamado: partialClaim.monto_reclamado || 0,
                monto_aceptado: partialClaim.monto_aceptado ?? (partialClaim.estado === 'SI' ? partialClaim.monto_reclamado : 0),
                motivo: partialClaim.motivo || 'N/A',
                motivo_cliente: partialClaim.motivo_cliente || 'N/A',
                resolucion: partialClaim.resolucion || 'N/A',
                fecha_calidad: partialClaim.fecha_calidad || '',
                mail_autorizacion_abono: partialClaim.mail_autorizacion_abono || 'no',
                autorizacion: partialClaim.autorizacion || 'N/A',
                abono: partialClaim.abono ?? partialClaim.monto_aceptado ?? 0,
                envio_a_cliente: partialClaim.envio_a_cliente || '',
                fecha_cierre: partialClaim.fecha_cierre || '',
                dias_espera: partialClaim.dias_espera || 0,
                estado: partialClaim.estado || 'NO',
                observaciones: partialClaim.observaciones || '',
                fecha_creacion: partialClaim.fecha_calidad || new Date().toISOString().split('T')[0] // Assumption
            };

            processedClaims.push(completeClaim);
        } catch (e: any) {
            errors.push({ rowIndex: index + 1, error: e.message, rowData: row });
            errorRows.push(row);
        }
    });

    return { data: processedClaims, errors, errorRows };
};