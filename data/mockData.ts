
import type { Claim } from '../types';

const today = new Date();
const formatDate = (date: Date) => date.toISOString().split('T')[0];
const subDays = (date: Date, days: number) => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() - days);
    return newDate;
};

export const MOCK_DATA: Claim[] = [
    {
        id: "R-1001", numero: "R-1001", cliente: "Cliente Alfa", monto_reclamado: 1250.50, monto_aceptado: 1250.50,
        motivo: "Producto dañado", motivo_cliente: "Caja rota", resolucion: "Abono completo", fecha_calidad: formatDate(subDays(today, 2)),
        mail_autorizacion_abono: "si", autorizacion: "Autorizado", abono: 1250.50, envio_a_cliente: "2023-10-15",
        fecha_cierre: formatDate(subDays(today, 1)), dias_espera: 5, estado: "SI", observaciones: "Cliente satisfecho.",
        fecha_creacion: formatDate(subDays(today, 2)),
    },
    {
        id: "R-1002", numero: "R-1002", cliente: "Cliente Beta", monto_reclamado: 800, monto_aceptado: 0,
        motivo: "Retraso en entrega", motivo_cliente: "Pedido urgente no llegó a tiempo", resolucion: "Rechazado", fecha_calidad: formatDate(subDays(today, 5)),
        mail_autorizacion_abono: "no", autorizacion: "No aplica", abono: 0, envio_a_cliente: "",
        fecha_cierre: formatDate(subDays(today, 4)), dias_espera: 3, estado: "NO", observaciones: "Transportista confirma entrega en plazo.",
        fecha_creacion: formatDate(subDays(today, 5)),
    },
    {
        id: "R-1003", numero: "R-1003", cliente: "Cliente Gamma", monto_reclamado: 350.75, monto_aceptado: 175,
        motivo: "Faltante de material", motivo_cliente: "Faltan 2 de 5 unidades", resolucion: "Abono parcial", fecha_calidad: formatDate(subDays(today, 8)),
        mail_autorizacion_abono: "si", autorizacion: "Autorizado parcial", abono: 175, envio_a_cliente: "2023-10-12",
        fecha_cierre: formatDate(subDays(today, 6)), dias_espera: 10, estado: "PARCIAL", observaciones: "",
        fecha_creacion: formatDate(subDays(today, 8)),
    },
    {
        id: "R-1004", numero: "R-1004", cliente: "Cliente Alfa", monto_reclamado: 2500, monto_aceptado: 2500,
        motivo: "Calidad deficiente", motivo_cliente: "Producto no cumple especificaciones", resolucion: "Abono completo", fecha_calidad: formatDate(subDays(today, 1)),
        mail_autorizacion_abono: "si", autorizacion: "OK", abono: 2500, envio_a_cliente: "2023-10-18",
        fecha_cierre: formatDate(subDays(today, 0)), dias_espera: 2, estado: "SI", observaciones: "Caso crítico, resuelto con urgencia.",
        fecha_creacion: formatDate(subDays(today, 1)),
    },
    {
        id: "R-1005", numero: "R-1005", cliente: "Cliente Delta", monto_reclamado: 450, monto_aceptado: 450,
        motivo: "Error de facturación", motivo_cliente: "Precio incorrecto en factura", resolucion: "Abono", fecha_calidad: formatDate(subDays(today, 15)),
        mail_autorizacion_abono: "si", autorizacion: "Aprobado", abono: 450, envio_a_cliente: "2023-10-05",
        fecha_cierre: formatDate(subDays(today, 12)), dias_espera: 4, estado: "SI", observaciones: "Corregir en sistema.",
        fecha_creacion: formatDate(subDays(today, 15)),
    },
    // Add more realistic data
    ...Array.from({ length: 60 }, (_, i) => {
        const id = `R-1${String(106 + i).padStart(2, '0')}`;
        const daysAgo = Math.floor(Math.random() * 90) + 1;
        const creationDate = subDays(today, daysAgo);
        const modificationDate = subDays(creationDate, -Math.floor(Math.random() * 5));
        const closeDate = subDays(modificationDate, -Math.floor(Math.random() * 3));
        const monto = parseFloat((Math.random() * 2000 + 50).toFixed(2));
        const estadoRand = Math.random();
        let estado: "SI" | "NO" | "PARCIAL" = "SI";
        let monto_aceptado = monto;
        if (estadoRand < 0.2) {
            estado = "NO";
            monto_aceptado = 0;
        } else if (estadoRand < 0.4) {
            estado = "PARCIAL";
            monto_aceptado = parseFloat((monto * (Math.random() * 0.5 + 0.2)).toFixed(2));
        }

        return {
            id,
            numero: id,
            cliente: ["Cliente Alfa", "Cliente Beta", "Cliente Gamma", "Cliente Delta", "Cliente Epsilon", "Cliente Zeta"][i % 6],
            monto_reclamado: monto,
            monto_aceptado,
            motivo: ["Producto dañado", "Retraso en entrega", "Calidad deficiente", "Faltante de material", "Error de facturación"][i % 5],
            motivo_cliente: "Detalle de cliente " + id,
            resolucion: ["Abono completo", "Rechazado", "Abono parcial", "Nota de crédito"][i % 4],
            fecha_calidad: formatDate(modificationDate),
            mail_autorizacion_abono: Math.random() > 0.3 ? "si" : "no",
            autorizacion: ["Autorizado", "Rechazado", "Pendiente"][i % 3],
            abono: monto_aceptado,
            envio_a_cliente: formatDate(subDays(creationDate, -2)),
            fecha_cierre: estado !== "NO" ? formatDate(closeDate) : "",
            dias_espera: Math.floor(Math.random() * 15) + 1,
            estado,
            observaciones: `Obs. para reclamo ${id}`,
            fecha_creacion: formatDate(creationDate),
        }
    })
];
