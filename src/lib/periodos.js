// ─── Trimestres y ventanas de revisión (Fase 4) ────────────────────────
// Claves: trimestre "AAAA-QN", año "AAAA". Fechas "AAAA-MM-DD".
// Nunca hay "vencida": fuera de ventana se informa la próxima fecha.
import { addDays, getWeekStart } from "./fechas";

const pad = (n) => String(n).padStart(2, "0");

export function trimestreDe(fecha) {
  const [y, m] = fecha.split("-").map(Number);
  return `${y}-Q${Math.ceil(m / 3)}`;
}
export function partesTrimestre(key) {
  const [y, q] = key.split("-Q").map(Number);
  const mesIni = (q - 1) * 3 + 1;
  const inicio = `${y}-${pad(mesIni)}-01`;
  const fin = addDays(q === 4 ? `${y + 1}-01-01` : `${y}-${pad(mesIni + 3)}-01`, -1);
  return { anio: y, q, inicio, fin, meses: [0, 1, 2].map(k => `${y}-${pad(mesIni + k)}`) };
}
export const nombreTrimestre = (key) => { const { anio, q } = partesTrimestre(key); return `T${q} ${anio}`; };
export function trimestreSiguiente(key) {
  const { anio, q } = partesTrimestre(key);
  return q === 4 ? `${anio + 1}-Q1` : `${anio}-Q${q + 1}`;
}

// Semanas (dom-sáb, clave = domingo) cuyo sábado cae dentro del trimestre.
export function semanasDelTrimestre(key) {
  const { inicio, fin } = partesTrimestre(key);
  const semanas = [];
  for (let d = getWeekStart(inicio); addDays(d, 6) <= fin; d = addDays(d, 7)) {
    if (addDays(d, 6) >= inicio) semanas.push(d);
  }
  return semanas;
}

// Trimestral: abre en la fecha agendada en la revisión anual (config/agenda)
// y dura 3 semanas. Sin agenda: 20/03, 20/06 y 20/09. El T4 va con la anual.
export const DURACION_VENTANA_T = 21;
export const inicioTrimestral = (anio, q, agenda) => agenda?.[anio]?.[`t${q}`] || `${anio}-${pad(q * 3)}-20`;
export function ventanaTrimestral(hoy, agenda) {
  const y = Number(hoy.slice(0, 4));
  for (const anio of [y - 1, y]) {
    for (const q of [1, 2, 3]) {
      const desde = inicioTrimestral(anio, q, agenda), hasta = addDays(desde, DURACION_VENTANA_T - 1);
      if (hoy >= desde && hoy <= hasta) return { abierta: true, key: `${anio}-Q${q}`, hasta };
    }
  }
  const proximas = [y, y + 1].flatMap(a => [1, 2, 3].map(q => inicioTrimestral(a, q, agenda))).filter(f => f > hoy).sort();
  return { abierta: false, proxima: proximas[0] };
}

// Anual: del 15/12 al 31/01. Revisa el año que termina.
export function ventanaAnual(hoy) {
  const [y, m, d] = hoy.split("-").map(Number);
  if (m === 12 && d >= 15) return { abierta: true, key: String(y), hasta: `${y + 1}-01-31` };
  if (m === 1) return { abierta: true, key: String(y - 1), hasta: `${y}-01-31` };
  return { abierta: false, proxima: `${y}-12-15`, key: String(y) };
}

// ─── Mensual: del 1 al 7 de cada mes, revisa el mes anterior ────────────
export const MESES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
export function mesAnterior(mesKey) {
  const [y, m] = mesKey.split("-").map(Number);
  return m === 1 ? `${y - 1}-12` : `${y}-${pad(m - 1)}`;
}
export function mesSiguiente(mesKey) {
  const [y, m] = mesKey.split("-").map(Number);
  return m === 12 ? `${y + 1}-01` : `${y}-${pad(m + 1)}`;
}
export const nombreMes = (mesKey) => { const [y, m] = mesKey.split("-").map(Number); return `${MESES[m - 1]} ${y}`; };
export function rangoMes(mesKey) {
  const inicio = `${mesKey}-01`;
  return { inicio, fin: addDays(`${mesSiguiente(mesKey)}-01`, -1) };
}
export function ventanaMensual(hoy) {
  const mes = hoy.slice(0, 7), dia = Number(hoy.slice(8));
  if (dia <= 7) return { abierta: true, key: mesAnterior(mes), hasta: `${mes}-07` };
  return { abierta: false, proxima: `${mesSiguiente(mes)}-01`, key: mesAnterior(mes) };
}
