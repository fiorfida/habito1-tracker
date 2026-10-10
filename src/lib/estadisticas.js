// ─── Estadísticas de un rango de fechas (trimestral, mensual, anual) ───
import { dateRange } from "./fechas";
import { HABITOS_SEGUIDOS, cumplimientoHabito } from "./habitos";

const pct = (a, b) => b ? Math.round(a / b * 100) : null;

// Hoy no cuenta como incumplido hasta que termina.
export function estadisticasRango(desdePedido, hasta, hoy, { registros, mananaLog }) {
  // Los días anteriores al primer registro no cuentan como incumplidos.
  const primerRegistro = [...Object.keys(registros), ...Object.keys(mananaLog)].sort()[0] || hoy;
  const desde = desdePedido < primerRegistro ? primerRegistro : desdePedido;
  const fin = hasta < hoy ? hasta : hoy;
  const dias = fin < desde ? [] : dateRange(desde, fin);
  const cerradosNoche  = dias.filter(d => d < hoy || registros[d]);
  const cerradosManana = dias.filter(d => d < hoy || mananaLog[d]?.visto);
  const regs = dias.map(d => registros[d]).filter(Boolean);
  const si = (campo) => regs.filter(r => r[campo]).length;
  const cumpl = (tiene, campo) => {
    const conDato = dias.filter(d => tiene(mananaLog[d]));
    return { cargados: conDato.length, si: conDato.filter(d => registros[d]?.[campo] === "si").length,
      parcial: conDato.filter(d => registros[d]?.[campo] === "parcial").length };
  };
  return {
    noches: regs.length, diasNoche: cerradosNoche.length, consistencia: pct(regs.length, cerradosNoche.length),
    mananas: dias.filter(d => mananaLog[d]?.visto).length, diasManana: cerradosManana.length,
    score: regs.length ? pct(regs.reduce((a, r) => a + [r.p1, r.p2, r.p3, r.p4].filter(Boolean).length, 0), regs.length * 4) : null,
    porPregunta: ["p1", "p2", "p3", "p4"].map(c => pct(si(c), regs.length)),
    compromisos: cumpl(m => !!m?.compromiso, "compromisoCumplido"),
    tareasClave: cumpl(m => !!m?.tareaClave?.texto, "tareaClaveHecha"),
    habitos: HABITOS_SEGUIDOS.map(h => ({ ...h, ...cumplimientoHabito(h, desde, hasta, hoy, { registros, mananaLog }) })),
  };
}

// Ajustes de misión y visión anotados en las mañanas del rango.
export function ajustesRango(desde, hasta, mananaLog) {
  return Object.values(mananaLog || {})
    .filter(m => m.fecha >= desde && m.fecha <= hasta && (m.misionAjuste || m.visionAjuste))
    .sort((a, b) => b.fecha.localeCompare(a.fecha)); // más reciente primero
}
