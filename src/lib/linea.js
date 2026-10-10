// ─── Línea de tiempo (Historial y Resumen): días y revisiones de un rango ─
// Cada revisión se ubica en la fecha en que cierra su período. Más reciente primero.
import { addDays, dateRange } from "./fechas";
import { rangoMes, partesTrimestre } from "./periodos";

export const TIPOS = [
  { id:"todo",       t:"Todo" },
  { id:"dia",        t:"Días" },
  { id:"semanal",    t:"Semanales" },
  { id:"mensual",    t:"Mensuales" },
  { id:"trimestral", t:"Trimestrales" },
  { id:"anual",      t:"Anuales" },
];

export function entradasRango(desde, hasta, { semanaLog, mensualLog, trimestreLog, anualLog }, primerDia) {
  const dentro = (f) => f >= desde && f <= hasta;
  const inicioDias = primerDia && primerDia > desde ? primerDia : desde;
  const dias = inicioDias > hasta ? [] : dateRange(inicioDias, hasta).map(d => ({ tipo:"dia", fecha:d, key:d }));
  const revisiones = [
    ...Object.keys(semanaLog || {}).map(W => ({ tipo:"semanal", fecha:addDays(W, 6), key:W })),
    ...Object.keys(mensualLog || {}).map(k => ({ tipo:"mensual", fecha:rangoMes(k).fin, key:k })),
    ...Object.keys(trimestreLog || {}).filter(k => trimestreLog[k]?.v === 2).map(k => ({ tipo:"trimestral", fecha:partesTrimestre(k).fin, key:k })),
    ...Object.keys(anualLog || {}).filter(k => anualLog[k]?.v === 2).map(k => ({ tipo:"anual", fecha:`${k}-12-31`, key:k })),
  ].filter(e => dentro(e.fecha));
  // Mismo día: primero la revisión (resume el período), después el día.
  const orden = { anual:0, trimestral:1, mensual:2, semanal:3, dia:4 };
  return [...revisiones, ...dias].sort((a, b) => b.fecha.localeCompare(a.fecha) || orden[a.tipo] - orden[b.tipo]);
}
