
import type { Claim } from '../types';

const today = new Date();
const formatDate = (date: Date) => date.toISOString().split('T')[0];
const subDays = (date: Date, days: number) => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() - days);
    return newDate;
};

// This is a snapshot of some of MOCK_DATA claims as they were *before* recent changes.
export const MOCK_PREVIOUS_VERSION_DATA: Claim[] = [
    // R-1001: Same as in MOCK_DATA, no changes.
    {
        id: "R-1001", numero: "R-1001", cliente: "Cliente Alfa", monto_reclamado: 1250.50, monto_aceptado: 1250.50,
        motivo: "Producto dañado", motivo_cliente: "Caja rota", resolucion: "Abono completo", fecha_calidad: formatDate(subDays(today, 2)),
        mail_autorizacion_abono: "si", autorizacion: "Autorizado", abono: 1250.50, envio_a_cliente: "2023-10-15",
        fecha_cierre: formatDate(subDays(today, 1)), dias_espera: 5, estado: "SI", observaciones: "Cliente satisfecho.",
        fecha_creacion: formatDate(subDays(today, 2)),
    },
    // R-1002: Changed 'observaciones'
    {
        id: "R-1002", numero: "R-1002", cliente: "Cliente Beta", monto_reclamado: 800, monto_aceptado: 0,
        motivo: "Retraso en entrega", motivo_cliente: "Pedido urgente no llegó a tiempo", resolucion: "Rechazado", fecha_calidad: formatDate(subDays(today, 5)),
        mail_autorizacion_abono: "no", autorizacion: "No aplica", abono: 0, envio_a_cliente: "",
        fecha_cierre: formatDate(subDays(today, 4)), dias_espera: 3, estado: "NO", observaciones: "Investigando con transportista.", // <--- OLD VALUE
        fecha_creacion: formatDate(subDays(today, 5)),
    },
    // R-1003: Changed 'monto_aceptado' and 'estado'
     {
        id: "R-1003", numero: "R-1003", cliente: "Cliente Gamma", monto_reclamado: 350.75, monto_aceptado: 0, // <--- OLD VALUE
        motivo: "Faltante de material", motivo_cliente: "Faltan 2 de 5 unidades", resolucion: "Abono parcial", fecha_calidad: formatDate(subDays(today, 8)),
        mail_autorizacion_abono: "no", autorizacion: "Pendiente", abono: 0, envio_a_cliente: "2023-10-12",
        fecha_cierre: "", dias_espera: 10, estado: "NO", observaciones: "", // <--- OLD VALUE
        fecha_creacion: formatDate(subDays(today, 8)),
    },
    // This claim was deleted in the new version.
    {
        id: "R-9999", numero: "R-9999", cliente: "Cliente Antiguo", monto_reclamado: 100, monto_aceptado: 100,
        motivo: "Error test", motivo_cliente: "Test", resolucion: "Abono", fecha_calidad: "2023-09-01",
        mail_autorizacion_abono: "si", autorizacion: "OK", abono: 100, envio_a_cliente: "2023-09-02",
        fecha_cierre: "2023-09-03", dias_espera: 2, estado: "SI", observaciones: "Reclamo de prueba para ser eliminado.",
        fecha_creacion: "2023-09-01",
    },
    // Other claims from the old dataset that are also present in the new one (without changes)
    {
        id: "R-1005", numero: "R-1005", cliente: "Cliente Delta", monto_reclamado: 450, monto_aceptado: 450,
        motivo: "Error de facturación", motivo_cliente: "Precio incorrecto en factura", resolucion: "Abono", fecha_calidad: formatDate(subDays(today, 15)),
        mail_autorizacion_abono: "si", autorizacion: "Aprobado", abono: 450, envio_a_cliente: "2023-10-05",
        fecha_cierre: formatDate(subDays(today, 12)), dias_espera: 4, estado: "SI", observaciones: "Corregir en sistema.",
        fecha_creacion: formatDate(subDays(today, 15)),
    },
];
