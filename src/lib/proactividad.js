// ─── Proactividad (Hábito 1) ───────────────────────────────────────────
// Clasificación de cada día a partir de las 4 señales del check-in nocturno
// y métricas de un período. Funciones puras: sin Firestore ni React.
//
// Señales (keys de Firestore, noche/{AAAA-MM-DD}):
//   p1 Foco · p2 Lenguaje · p3 Respuesta  → true / false
//   compromisoCumplido                    → "si" / "parcial" / "no" / null
// El texto del compromiso vive en manana/{fecha}.compromiso.
import { addDays, dateRange, formatDate, getWeekStart } from "./fechas";
import { partesTrimestre, trimestreDe } from "./periodos";

export const SENALES = [
  { id: "p1", nombre: "Foco" },
  { id: "p2", nombre: "Lenguaje" },
  { id: "p3", nombre: "Respuesta" },
  { id: "compromiso", nombre: "Compromiso" },
];

export const ESTADO_TEXTO = {
  bueno: "Bueno", medio: "Medio", malo: "Malo", sin_registro: "Sin registro", pendiente: "Pendiente",
};

// Reglas, en orden:
// 1. Sin registro → "sin_registro" (o "pendiente" si es hoy y todavía no se cargó).
// 2. Foco, Lenguaje, Respuesta en Sí y Compromiso en "si" (estricto) → "bueno".
// 3. Respuesta y Lenguaje en Sí → "medio".
// 4. Resto → "malo".
// Registros incompletos se clasifican con lo que tengan: una señal faltante
// nunca es Sí, así que no pueden ser "bueno".
export function clasificarDia(registro, { esHoy = false } = {}) {
  if (!registro) return esHoy ? "pendiente" : "sin_registro";
  const foco = registro.p1 === true;
  const lenguaje = registro.p2 === true;
  const respuesta = registro.p3 === true;
  const compromiso = registro.compromisoCumplido === "si";
  if (foco && lenguaje && respuesta && compromiso) return "bueno";
  if (respuesta && lenguaje) return "medio";
  return "malo";
}

export const estadoDe = (fecha, registros, hoy) =>
  clasificarDia(registros[fecha], { esHoy: fecha === hoy });

// ─── Períodos ──────────────────────────────────────────────────────────
// tipo: "30" (últimos 30 días, incluye hoy) | "trimestre" (trimestre calendario
// en curso, hasta hoy) | "custom" (desde/hasta, recortado a hoy).
export function rangoPeriodo(tipo, hoy, desde, hasta) {
  if (tipo === "trimestre") return { desde: partesTrimestre(trimestreDe(hoy)).inicio, hasta: hoy };
  if (tipo === "custom" && desde && hasta) {
    let [a, b] = desde <= hasta ? [desde, hasta] : [hasta, desde];
    if (b > hoy) b = hoy;
    if (a > b) a = b;
    return { desde: a, hasta: b };
  }
  return { desde: addDays(hoy, -29), hasta: hoy };
}

const pct = (n, d) => (d ? Math.round((n / d) * 100) : null);

// Racha máxima y racha al final de una lista de booleanos.
function rachas(lista) {
  let mejor = 0, cur = 0;
  for (const ok of lista) { cur = ok ? cur + 1 : 0; if (cur > mejor) mejor = cur; }
  return { actual: cur, mejor };
}

// ─── Análisis del período ──────────────────────────────────────────────
export function analizarPeriodo(desde, hasta, hoy, registros) {
  const dias = dateRange(desde, hasta).map(fecha => ({ fecha, estado: estadoDe(fecha, registros, hoy) }));
  // El día pendiente (hoy sin registro) no cuenta en ningún indicador.
  const contables = dias.filter(d => d.estado !== "pendiente");
  const registrados = contables.filter(d => d.estado !== "sin_registro");
  const dist = { bueno: 0, medio: 0, malo: 0, sin_registro: 0 };
  contables.forEach(d => { dist[d.estado]++; });

  const rBuenos = rachas(contables.map(d => d.estado === "bueno"));
  const rRegistro = rachas(contables.map(d => d.estado !== "sin_registro"));

  // % de Sí por señal, sobre los días registrados que tienen esa señal respondida.
  const senales = SENALES.map(s => {
    let respondidas = 0, si = 0, parcial = 0;
    registrados.forEach(({ fecha }) => {
      const r = registros[fecha];
      if (s.id === "compromiso") {
        const v = r.compromisoCumplido;
        if (v === "si" || v === "parcial" || v === "no") respondidas++;
        if (v === "si") si++;
        if (v === "parcial") parcial++;
      } else if (typeof r[s.id] === "boolean") {
        respondidas++;
        if (r[s.id]) si++;
      }
    });
    return { ...s, respondidas, si, parcial, pct: pct(si, respondidas) };
  });
  // Ordenadas de menor a mayor (sin datos al final).
  const senalesOrdenadas = [...senales].sort((a, b) => (a.pct ?? 101) - (b.pct ?? 101));

  // Tendencia semanal (semanas dom-sáb, clave = domingo).
  const porSemana = new Map();
  contables.forEach(d => {
    const w = getWeekStart(d.fecha);
    if (!porSemana.has(w)) porSemana.set(w, { semana: w, dias: 0, registrados: 0, buenos: 0 });
    const s = porSemana.get(w);
    s.dias++;
    if (d.estado !== "sin_registro") s.registrados++;
    if (d.estado === "bueno") s.buenos++;
  });
  const semanas = [...porSemana.values()].map(s => ({
    ...s, pctBuenos: pct(s.buenos, s.registrados), pctRegistro: pct(s.registrados, s.dias),
  }));

  // % días buenos por día de la semana (0 = domingo).
  const porDiaSemana = [0, 1, 2, 3, 4, 5, 6].map(dow => {
    const regs = registrados.filter(d => new Date(d.fecha + "T12:00:00").getDay() === dow);
    return { dow, registrados: regs.length, pct: pct(regs.filter(d => d.estado === "bueno").length, regs.length) };
  });

  return {
    desde, hasta, dias,
    totalDias: contables.length,
    conRegistro: registrados.length,
    pctRegistro: pct(registrados.length, contables.length),
    pctBuenos: pct(dist.bueno, registrados.length),
    dist,
    rachaBuenos: rBuenos.actual, mejorRachaBuenos: rBuenos.mejor,
    rachaRegistro: rRegistro.actual,
    senales, senalesOrdenadas, semanas, porDiaSemana,
    pendiente: dias.some(d => d.estado === "pendiente"),
  };
}

// ─── Export Markdown para Claude ───────────────────────────────────────
const DIAS_LARGOS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const DIAS_CORTOS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const siNo = v => (v === true ? "Sí" : v === false ? "No" : "—");
const CUMPL = { si: "Sí", parcial: "Parcial", no: "No" };
const fmtPct = p => (p == null ? "—" : `${p}%`);
const ddmm = f => formatDate(f).slice(0, 5);

export function exportarMarkdown(a, registros, mananaLog = {}) {
  const L = [];
  const comp = a.senales.find(s => s.id === "compromiso");
  L.push("# Hábito 1 — Proactividad | Export para análisis");
  L.push(`Período: ${formatDate(a.desde)} – ${formatDate(a.hasta)}`);
  L.push("Criterio: Bueno = 4 señales OK | Medio = Respuesta + Lenguaje OK | Malo = resto | Parcial en compromiso ≠ OK");
  L.push("");
  L.push("## Resumen");
  L.push(`- Días del período: ${a.totalDias} | Con registro: ${a.conRegistro} (${fmtPct(a.pctRegistro)})`);
  L.push(`- Bueno: ${a.dist.bueno} | Medio: ${a.dist.medio} | Malo: ${a.dist.malo} | Sin registro: ${a.dist.sin_registro}`);
  L.push(`- % días buenos (sobre registrados): ${fmtPct(a.pctBuenos)}`);
  L.push(`- Racha actual de días buenos: ${a.rachaBuenos} | Mejor racha: ${a.mejorRachaBuenos}`);
  L.push(`- % Sí por señal: ${a.senales.map(s => `${s.nombre} ${fmtPct(s.pct)}`).join(" | ")} (Parcial: ${comp.parcial})`);
  L.push(`- Por día de la semana (% días buenos): ${a.porDiaSemana.map(d => `${DIAS_CORTOS[d.dow]} ${fmtPct(d.pct)}`).join(" | ")}`);
  L.push("");
  L.push("## Registros");
  const nota = t => (t && t.trim() ? ` — "${t.trim()}"` : "");
  a.dias.filter(d => d.estado !== "sin_registro" && d.estado !== "pendiente").forEach(({ fecha, estado }) => {
    const r = registros[fecha];
    const textoComp = mananaLog[fecha]?.compromiso?.trim();
    L.push(`### ${formatDate(fecha)} (${DIAS_LARGOS[new Date(fecha + "T12:00:00").getDay()]}) — ${ESTADO_TEXTO[estado].toUpperCase()}`);
    L.push(`- Foco: ${siNo(r.p1)}${nota(r.p1_nota)}`);
    L.push(`- Lenguaje: ${siNo(r.p2)}${nota(r.p2_nota)}`);
    L.push(`- Respuesta: ${siNo(r.p3)}${nota(r.p3_nota)}`);
    L.push(`- Compromiso: ${textoComp ? `"${textoComp}"` : "(sin compromiso cargado)"} → ${CUMPL[r.compromisoCumplido] || "—"}`);
    L.push("");
  });
  const sin = a.dias.filter(d => d.estado === "sin_registro").map(d => ddmm(d.fecha));
  if (sin.length) L.push(`Sin registro: ${sin.join(", ")}`);
  const pend = a.dias.find(d => d.estado === "pendiente");
  if (pend) L.push(`Pendiente (hoy): ${ddmm(pend.fecha)}`);
  return L.join("\n").replace(/\n+$/, "") + "\n";
}
