// ─── Revisión semanal (Fase 2): cálculos puros ─────────────────────────
// W = domingo de la semana revisada (clave de semana/{W}).
// P = W + 7 = domingo de la semana planificada (clave de plan/{P}).
import { addDays, dateRange, dayOfWeek } from "./fechas";
import { ROLES } from "../content/contenido";

export const PASOS = [
  "Reconexión", "Datos de la semana", "Realizado vs. plan", "Reflexión semanal",
  "Qué necesita cada rol", "Capacidad y priorización", "Plan semanal",
];
export const OBJETIVO_CAPACIDAD = 0.8; // criterio personal: planificar al 80%
export const LIMITE_DIVIDIR_MIN = 180; // ítems de más de 3 h se dividen
export const CUADRANTES = ["I", "II", "III", "IV"];

export const semanaPlanDe = (W) => addDays(W, 7);
export const diasDe = (inicio) => dateRange(inicio, addDays(inicio, 6));

// Revisión en formato nuevo (v2) vs. formato anterior (s1-s3 + metas).
export const esV2 = (doc) => !!doc && doc.v === 2;
export const revisionCompleta = (doc) => !!doc && (esV2(doc) ? doc.estado === "completa" : true);

// Metas previstas para la semana W: plan/{W} (nuevo) o, en el formato anterior,
// semana/{W-7}.metas (se cargaban en la revisión de la semana previa).
export function metasPrevistas(W, planLog, semanaLog) {
  const plan = planLog[W];
  if (plan?.metas) return plan.metas;
  const vieja = semanaLog[addDays(W, -7)];
  return vieja && !esV2(vieja) ? vieja.metas || null : null;
}

// Foto de la semana a partir de Noche y Mañana.
export function datosSemana(W, registros, mananaLog) {
  const dias = diasDe(W);
  const regs = dias.map(d => ({ d, r: registros[d] })).filter(x => x.r);
  const puntos = r => [r.p1, r.p2, r.p3, r.p4].filter(Boolean).length;
  const si = regs.reduce((a, x) => a + puntos(x.r), 0);
  const porDia = regs.map(x => ({
    fecha: x.d, dia: dayOfWeek(x.d), puntos: puntos(x.r),
    nota: [x.r.p1_nota, x.r.p3_nota, x.r.p4_nota].filter(Boolean).join(" · ").slice(0, 140),
  }));
  const orden = [...porDia].sort((a, b) => b.puntos - a.puntos || a.fecha.localeCompare(b.fecha));
  return {
    noches: regs.length,
    mananas: dias.filter(d => mananaLog[d]?.visto).length,
    score: regs.length ? Math.round((si / (regs.length * 4)) * 100) : null,
    proactivos: orden.filter(x => x.puntos >= 3).slice(0, 3),
    reactivos: [...orden].reverse().filter(x => x.puntos <= 2).slice(0, 3),
  };
}

// ─── Inventario ────────────────────────────────────────────────────────
// Un ítem cuenta si está planificado y no fue dividido (cuentan sus partes).
export function itemsActivos(items) {
  const conHijos = new Set(items.filter(i => i.padreId).map(i => i.padreId));
  return items.filter(i => i.estado === "planificado" && !conHijos.has(i.id));
}
export const horas = (min) => Math.round((min || 0) / 6) / 10; // 1 decimal (para inputs)
export const hs = (min) => horas(min).toLocaleString("es-AR"); // para mostrar: "7,5"

export function demandaMin(items) {
  return itemsActivos(items).reduce((a, i) => a + (i.minutos || 0), 0);
}
export function disponibleMin(capacidad, P) {
  return diasDe(P).reduce((a, d) => a + (Number(capacidad?.[d]) || 0) * 60, 0);
}

// % de tiempo por rol: lo ya agendado (Calendar) + lo planificado en el inventario.
export function tiempoPorRol(items, agendadoPorRol) {
  const min = {};
  ROLES.forEach(r => { min[r.num] = (Number(agendadoPorRol?.[r.num]) || 0) * 60; });
  itemsActivos(items).forEach(i => { if (min[i.rol] !== undefined) min[i.rol] += i.minutos || 0; });
  const total = Object.values(min).reduce((a, b) => a + b, 0);
  return ROLES.map(r => ({ rol: r, min: min[r.num], pct: total ? Math.round(min[r.num] / total * 100) : 0 }));
}

// Carga por día: primero los fijos, después los "a asignar" con día elegido.
export function cargaPorDia(items, P) {
  const activos = itemsActivos(items);
  return diasDe(P).map(d => ({
    fecha: d,
    fijos: activos.filter(i => i.tipo === "fijo" && i.dia === d).reduce((a, i) => a + (i.minutos || 0), 0),
    flexibles: activos.filter(i => i.tipo !== "fijo" && i.dia === d).reduce((a, i) => a + (i.minutos || 0), 0),
  }));
}
export const sinDia = (items) => itemsActivos(items).filter(i => !i.dia);

// ─── "Pegar resumen de Claude" ─────────────────────────────────────────
// Formato (una línea por dato, en cualquier orden):
//   Dom 27/09: 5,5 h libres
//   Rol 6: 22 h agendadas
export function parsearResumen(texto, P) {
  const dias = diasDe(P);
  const capacidad = {}, agendado = {}, errores = [];
  texto.split(/\r?\n/).map(l => l.trim()).filter(Boolean).forEach(l => {
    const num = (s) => parseFloat(s.replace(",", "."));
    let m = l.match(/^(?:dom|lun|mar|mi[eé]|jue|vie|s[aá]b)\w*\s+(\d{1,2})\/(\d{1,2})(?:\/\d{2,4})?\s*:\s*([\d.,]+)/i);
    if (m) {
      const d = dias.find(x => x.slice(8) === m[1].padStart(2, "0") && x.slice(5, 7) === m[2].padStart(2, "0"));
      if (d) { capacidad[d] = num(m[3]); return; }
    }
    m = l.match(/^rol\s*(\d)\s*[:\-–]\s*([\d.,]+)/i);
    if (m && ROLES.some(r => r.num === m[1])) { agendado[m[1]] = num(m[2]); return; }
    errores.push(l);
  });
  return { capacidad, agendado, errores };
}
