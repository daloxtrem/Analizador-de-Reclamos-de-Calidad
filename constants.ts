
export const HEADER_MAPPINGS: { [key: string]: keyof import('./types').Claim } = {
    'reclamacion': 'numero',
    'reclamación': 'numero',
    'cliente': 'cliente',
    'importe': 'monto_reclamado',
    'importe (€)': 'monto_reclamado',
    'importe aceptado': 'monto_aceptado',
    'motivo': 'motivo',
    'motivo cliente': 'motivo_cliente',
    'resolucion': 'resolucion',
    'resolución': 'resolucion',
    'data calidad': 'fecha_calidad',
    'mail autorizacion abono': 'mail_autorizacion_abono',
    'autorizacion': 'autorizacion',
    'autorización': 'autorizacion',
    'abono': 'abono',
    'envio a cliente': 'envio_a_cliente',
    'tancada a sap': 'fecha_cierre',
    'tancada sap': 'fecha_cierre',
    'dias de espera': 'dias_espera',
    'días de espera': 'dias_espera',
    'estado': 'estado',
    'observaciones': 'observaciones',
};

export const EXPECTED_HEADERS = Object.keys(HEADER_MAPPINGS);
