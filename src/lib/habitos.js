// ─── Hábitos que se siguen (Fase 4) ────────────────────────────────────
// Cada hábito define cómo se cuenta un día cumplido a partir de lo que ya
// se registra. Para sumar un hábito: agregarlo acá con su regla.
import { dateRange } from "./fechas";

export const HABITOS_SEGUIDOS = [
  {
    id: "control",
    nombre: "Control de hábitos",
    regla: "Se cumple el día que guardo la Noche.",
    cumple: (d, { registros }) => !!registros[d],
  },
  {
    id: "proactivo",
    nombre: "Ser proactivo",
    regla: "Se cumple el día que respondo Sí a Energía, Lenguaje y Respuesta.",
    cumple: (d, { registros }) => { const r = registros[d]; return !!r && !!r.p1 && !!r.p2 && !!r.p3; },
  },
];

// % de cumplimiento en un rango. Hoy no cuenta hasta que termina (salvo que ya se cumplió).
export function cumplimientoHabito(habito, desde, hasta, hoy, datos) {
  const dias = dateRange(desde, hasta < hoy ? hasta : hoy).filter(d => d < hoy || habito.cumple(d, datos));
  const si = dias.filter(d => habito.cumple(d, datos)).length;
  return { dias: dias.length, si, pct: dias.length ? Math.round(si / dias.length * 100) : null };
}
