
export interface Claim {
  id: string; // Unique identifier for the claim (numero)
  numero: string;
  cliente: string;
  monto_reclamado: number;
  monto_aceptado: number;
  motivo: string;
  motivo_cliente: string;
  resolucion: string;
  fecha_calidad: string; // ISO Date string (YYYY-MM-DD)
  mail_autorizacion_abono: string;
  autorizacion: string;
  abono: number;
  envio_a_cliente: string;
  fecha_cierre: string; // ISO Date string (YYYY-MM-DD)
  dias_espera: number;
  estado: 'SI' | 'NO' | 'PARCIAL';
  observaciones: string;
  fecha_creacion: string; // ISO Date string, assumed to be fecha_calidad if not present
}

export interface Version {
  id: string;
  timestamp: number;
  metadata: {
    name: string;
    rows: number;
  };
  data: Claim[];
}

export type DiffType = 'added' | 'removed' | 'modified';

export interface ClaimDiff {
  type: DiffType;
  claimId: string;
  current?: Claim;
  previous?: Claim;
  changes?: { field: keyof Claim; oldValue: any; newValue: any }[];
}

export interface ComparisonResult {
  added: Claim[];
  removed: Claim[];
  modified: ClaimDiff[];
}

export interface DataWithErrors {
    data: Claim[];
    errors: { rowIndex: number; error: string; rowData: any }[];
    errorRows: any[];
}
