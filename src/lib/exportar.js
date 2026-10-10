// ─── Documentos exportados a Drive (diseño aprobado en la Fase 5) ──────
// Unidades: "mes:AAAA-MM", "semana:P" (domingo de la semana planificada),
// "trimestre:AAAA-QN", "anual:AAAA". Cada una se arma entera desde los datos.
// Todo registro va de más reciente a más viejo; las agendas, en orden calendario.
import { PREGUNTAS_H1, PREGUNTA_H2, ROLES, nombreRol } from "../content/contenido";
import { formatDate, dayOfWeek, addDays, dateRange } from "./fechas";
import { rangoMes, nombreMes, partesTrimestre, nombreTrimestre, trimestreSiguiente, semanasDelTrimestre, MESES } from "./periodos";
import { HABITOS_SEGUIDOS } from "./habitos";
import { estadisticasRango } from "./estadisticas";
import { datosSemana, itemsActivos, tiempoPorRol, diasDe, hs, esV2, metasPrevistas } from "./semanal";
import { metasActivas } from "./metas";

// ─── Qué documentos toca cada guardado ─────────────────────────────────
const trimestreAnterior = (K) => { const [y, q] = K.split("-Q").map(Number); return q === 1 ? `${y - 1}-Q4` : `${y}-Q${q - 1}`; };
export function unidadesDe(col, id, data) {
  switch (col) {
    case "noche": case "manana": return [`mes:${id.slice(0, 7)}`];
    case "semana": return [`semana:${addDays(id, 7)}`];
    case "plan": return [`semana:${id}`];
    case "mensual": return [`mes:${id}`];
    case "trimestre": return [`trimestre:${id}`];
    case "planTrimestral": return [`trimestre:${trimestreAnterior(id)}`];
    case "anual": return [`anual:${id}`];
    case "objetivos": return data?.anio ? [`anual:${data.anio}`, `anual:${data.anio - 1}`] : [];
    case "habitos": return data?.anio ? [`anual:${data.anio - 1}`] : [];
    default: return [];
  }
}

// Unidades con datos dentro de un rango (botón "Exportar período").
export function unidadesDelRango(desde, hasta, d) {
  const u = new Set();
  const primer = [...Object.keys(d.registros), ...Object.keys(d.mananaLog)].sort()[0];
  if (primer) dateRange(desde < primer ? primer : desde, hasta).forEach(f => u.add(`mes:${f.slice(0, 7)}`));
  Object.keys(d.semanaLog).forEach(W => { const P = addDays(W, 7); if (P >= desde && P <= hasta) u.add(`semana:${P}`); });
  Object.keys(d.planLog).forEach(P => { if (P >= desde && P <= hasta) u.add(`semana:${P}`); });
  Object.keys(d.trimestreLog).filter(K => d.trimestreLog[K]?.v === 2).forEach(K => { const p = partesTrimestre(K); if (p.fin >= desde && p.inicio <= hasta) u.add(`trimestre:${K}`); });
  Object.keys(d.anualLog).filter(Y => d.anualLog[Y]?.v === 2).forEach(Y => { if (`${Y}-12-31` >= desde && `${Y}-01-01` <= hasta) u.add(`anual:${Y}`); });
  return [...u];
}

// ─── HTML ──────────────────────────────────────────────────────────────
const esc = (t) => String(t ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const h1 = (t) => `<h1>${esc(t)}</h1>`, h2 = (t) => `<h2>${esc(t)}</h2>`, h3 = (t) => `<h3>${esc(t)}</h3>`;
const p = (t) => `<p>${esc(t)}</p>`;
const lista = (items, vacio = "—") => { const xs = items.filter(Boolean); return xs.length ? `<ul>${xs.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : p(vacio); };
const sn = (v) => v === true ? "Sí" : v === false ? "No" : "—";
const res = (v) => ({ si: "Sí", parcial: "Parcial", no: "No" }[v] || "sin responder");
const DIAS_LARGOS = { Dom: "DOMINGO", Lun: "LUNES", Mar: "MARTES", "Mié": "MIÉRCOLES", Jue: "JUEVES", Vie: "VIERNES", "Sáb": "SÁBADO" };
const ahora = () => new Date().toLocaleString("es-AR", { timeZone: "America/Argentina/Buenos_Aires", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).replace(",", "");
const encabezado = (titulo, autor) => h1(titulo) + p(`Actualizado: ${ahora()}${autor ? ` · ${autor}` : ""}`);
const envolver = (cuerpo) => `<html><head><meta charset="utf-8"></head><body>${cuerpo}</body></html>`;

// Devuelve {nombre, html} o null si la unidad no tiene datos.
export function armarDocumento(unidad, d, hoy, autor) {
  const [tipo, clave] = [unidad.slice(0, unidad.indexOf(":")), unidad.slice(unidad.indexOf(":") + 1)];
  if (tipo === "mes") return docMes(clave, d, hoy, autor);
  if (tipo === "semana") return docSemana(clave, d, autor);
  if (tipo === "trimestre") return docTrimestre(clave, d, hoy, autor);
  if (tipo === "anual") return docAnual(clave, d, autor);
  return null;
}

// ─── 1. Mes: cierre mensual + días (más reciente primero) ──────────────
function docMes(mes, d, hoy, autor) {
  const { inicio, fin } = rangoMes(mes);
  const primer = [...Object.keys(d.registros), ...Object.keys(d.mananaLog)].sort()[0];
  const desde = primer && primer > inicio ? primer : inicio, hasta = fin < hoy ? fin : hoy;
  if (!primer || desde > hasta) return null;
  let html = encabezado(`REGISTROS DIARIOS · ${nombreMes(mes).toUpperCase()}`, autor);
  const c = d.mensualLog[mes];
  if (c) {
    const r = c.resumen || {};
    html += h2(`CIERRE MENSUAL${c.ts ? ` (revisado el ${formatDate(c.ts)})` : ""}${c.estado === "completa" ? "" : " · en curso"}`) + lista([
      c.auditoria?.frase && `Frase reactiva más frecuente: "${c.auditoria.frase}"${r.frases?.[0] ? ` (${r.frases.find(f => f.frase === c.auditoria.frase)?.cantidad ?? r.frases[0].cantidad})` : ""}${c.auditoria.contexto ? ` — contexto: ${c.auditoria.contexto}` : ""}`,
      ...(c.tenerASer || []).filter(x => x.tener || x.ser).map(x => `De TENER a SER: ${x.tener || "…"} → ${x.ser || "…"}`),
      c.cualidad && `Cualidad para el mes siguiente: ${c.cualidad}`,
      r.consistencia != null && `Resumen: consistencia Noche ${r.consistencia}% · score ${r.score ?? "—"}%${(r.habitos || []).map(h => ` · ${h.nombre} ${h.pct ?? "—"}%`).join("")}`,
    ]);
  }
  dateRange(desde, hasta).reverse().forEach(f => { html += docDia(f, d); });
  return { nombre: `${mes} · Registros diarios · ${nombreMes(mes)}`, html: envolver(html) };
}

function docDia(f, d) {
  const m = d.mananaLog[f], r = d.registros[f];
  let html = h2(`${DIAS_LARGOS[dayOfWeek(f)] || dayOfWeek(f)} ${formatDate(f)}`);
  if (!m) html += p("MAÑANA: sin registro");
  else {
    html += h3(`MAÑANA (${m.visto ? "completada" : "en curso"})`) + lista([
      m.misionOk != null && `Misión: ${sn(m.misionOk)}${m.misionAjuste ? ` — ajustes: ${m.misionAjuste}` : ""} · Visión: ${sn(m.visionOk)}${m.visionAjuste ? ` — cambios: ${m.visionAjuste}` : ""}`,
      (m.visionAlternativas || []).filter(a => a.texto).length > 0 && `Alternativas de visión: ${m.visionAlternativas.filter(a => a.texto).map((a, k) => `${a.texto}${m.visionElegida === k ? " (elegida)" : ""}`).join(" · ")}`,
      m.cambio && `Cambios al plan: ${[...(m.agregados || []).map(a => `+ ${a}`), m.quitados?.length ? `${m.quitados.length} bloque(s) quitado(s)` : ""].filter(Boolean).join(" · ") || "sí"}`,
      m.distinto && `Qué hacer distinto hoy: ${m.distinto}`,
      m.tareaClave?.texto && `Tarea más importante: ${m.tareaClave.texto}`,
      m.compromiso && `Compromiso: ${m.compromiso}`,
      ...(m.situaciones || []).filter(s => s.situacion).map(s => `Anticipación: ${s.situacion} → ${s.respuesta || "…"}`),
      m.v !== 2 && "Mañana leída (formato anterior)",
    ], m.visto ? "Completada, sin detalle cargado." : "En curso, sin detalle cargado.");
  }
  if (!r) html += p("NOCHE: sin registro");
  else {
    html += h3("NOCHE") + lista([
      ...[...PREGUNTAS_H1, PREGUNTA_H2].map(q => `${q.label.replace(/^H\d — /, "")}: ${sn(r[q.id])}${r[`${q.id}_nota`] ? ` — ${r[`${q.id}_nota`]}` : ""}`),
      r.conflicto != null && `Conflicto: ${sn(r.conflicto)}${r.conflicto_nota ? ` — Qué pude hacer diferente: ${r.conflicto_nota}` : ""}`,
      (r.compromisoCumplido || r.tareaClaveHecha) && `Compromiso cumplido: ${res(r.compromisoCumplido)} · Tarea clave hecha: ${res(r.tareaClaveHecha)}`,
      `Hábitos: ${HABITOS_SEGUIDOS.map(h => `${h.nombre} ${h.cumple(f, d) ? "✓" : "✗"}`).join(" · ")}`,
    ]);
  }
  return html;
}

// ─── 2. Semana: revisión de W y plan de P ──────────────────────────────
function docSemana(P, d, autor) {
  const W = addDays(P, -7), rev = d.semanaLog[W], plan = d.planLog[P];
  if (!rev && !plan) return null;
  const titulo = `SEMANA DEL ${formatDate(P)} AL ${formatDate(addDays(P, 6))} · REVISIÓN Y PLAN`;
  let html = encabezado(titulo, autor);
  if (rev && esV2(rev)) {
    const x = rev.datos || datosSemana(W, d.registros, d.mananaLog);
    const c = (k) => x[k]?.cargados ? `${x[k].cargados} cargados · ${x[k].si} sí · ${x[k].parcial} parcial · ${x[k].no} no` : "sin cargar";
    html += p(`Revisión hecha el ${formatDate(rev.ts || addDays(W, 6))}${rev.minutos ? ` · ${rev.minutos} min` : ""} · estado: ${rev.estado === "completa" ? "completa" : "en curso"}`);
    html += h2(`DATOS DE LA SEMANA REVISADA (${formatDate(W).slice(0, 5)} al ${formatDate(addDays(W, 6)).slice(0, 5)})`) + lista([
      `Noches ${x.noches}/7 · Score ${x.score ?? "—"}% · Mañanas ${x.mananas}/7`,
      `Compromisos: ${c("compromisos")} · Tareas clave: ${c("tareasClave")}`,
      ...(x.proactivos || []).map(y => `Más proactivo: ${y.dia} ${formatDate(y.fecha)} (${y.puntos}/4)${y.nota ? ` — ${y.nota}` : ""}`),
      ...(x.reactivos || []).map(y => `Más reactivo: ${y.dia} ${formatDate(y.fecha)} (${y.puntos}/4)${y.nota ? ` — ${y.nota}` : ""}`),
    ]);
    const previstas = metasPrevistas(W, d.planLog, d.semanaLog) || {};
    const realizado = rev.realizado || {};
    html += h2("REALIZADO VS. PLAN") + lista([
      ...ROLES.flatMap(r => (previstas[r.num] || []).map((t, k) => t && t.trim() && `${r.num} · ${r.nombre}: ${t} → ${res(realizado[r.num]?.metas?.[k])}`)),
      ...ROLES.map(r => realizado[r.num]?.nota && `${r.num} · ${r.nombre} — avance: ${realizado[r.num].nota}`),
      realizado.general?.nota && `Avance general: ${realizado.general.nota}`,
    ]);
    const rf = rev.reflexion || {};
    html += h2("REFLEXIÓN") + lista([
      (rf.preocupaciones || []).length > 0 && `Círculo de influencia: ${rf.preocupaciones.map(x => `${x.texto} (${x.control === true ? "en mi control" : x.control === false ? "no en mi control" : "sin clasificar"})`).join(" · ")}`,
      rf.libre && `Reflexión libre: ${rf.libre}`,
      rf.intencion && `Intención para la semana: ${rf.intencion}`,
    ]);
  } else if (rev) {
    html += h2("REVISIÓN (formato anterior)") + lista([rev.s1 && `Rol más descuidado: ${rev.s1}`, rev.s2 && `Decisión alineada: ${rev.s2}`, rev.s3 && `Qué hacer diferente: ${rev.s3}`]);
    if (metasActivas(rev.metas).length) html += h2("METAS POR ROL") + lista(metasActivas(rev.metas).map(r => `${r.num} · ${r.nombre}: ${(rev.metas[r.num] || []).filter(Boolean).join(" · ")}`));
  }
  if (plan) {
    const activos = itemsActivos(plan.items || []);
    html += h2("PLAN · METAS POR ROL") + lista(ROLES.map(r => { const m = (plan.metas?.[r.num] || []).filter(t => t && t.trim()); return m.length && `${r.num} · ${r.nombre}: ${m.join(" · ")}`; }));
    html += h2("PLAN · BLOQUES POR DÍA") + lista(diasDe(P).map(f => {
      const del = activos.filter(i => i.dia === f).sort((a, b) => (a.hora || "99").localeCompare(b.hora || "99"));
      return `${dayOfWeek(f)} ${formatDate(f).slice(0, 5)}: ${del.length ? del.map(i => `${i.hora ? `${i.hora} ` : ""}${i.titulo} (${hs(i.minutos)} h · Rol ${i.rol})${plan.tareaClave?.[f] === i.id ? " ★ tarea clave" : ""}`).join(" · ") : "—"}`;
    }));
    const sinDia = activos.filter(i => !i.dia);
    if (sinDia.length) html += p(`Sin día asignado: ${sinDia.map(i => i.titulo).join(" · ")}`);
    const libres = diasDe(P).reduce((a, f) => a + (Number(plan.capacidad?.[f]) || 0), 0);
    const plan_h = activos.reduce((a, i) => a + (i.minutos || 0), 0);
    html += p(`CAPACIDAD: libres ${libres.toLocaleString("es-AR")} h · objetivo 80% ${(Math.round(libres * 8) / 10).toLocaleString("es-AR")} h · planificadas ${hs(plan_h)} h${plan.excesoAceptado ? " · por encima del 80% (decidido conscientemente)" : ""}`);
    const porRol = tiempoPorRol(plan.items || [], plan.agendadoPorRol).filter(x => x.min);
    if (porRol.length) html += p(`% POR ROL: ${porRol.map(x => `Rol ${x.rol.num} ${x.pct}%`).join(" · ")}`);
    const fuera = [["postergado", "Postergado"], ["delegado", "Delegado"], ["rechazado", "Dije que no"], ["eliminado", "Eliminado"]]
      .map(([e, t]) => { const l = (plan.items || []).filter(i => i.estado === e); return l.length && `${t}: ${l.map(i => i.titulo + (e === "delegado" && i.delegadoA ? ` (a ${i.delegadoA})` : "")).join(" · ")}`; }).filter(Boolean);
    if (fuera.length) html += p(`FUERA DEL PLAN: ${fuera.join(" · ")}`);
    if ((plan.decisiones || []).length) html += p(`DECISIONES CON LA MATRIZ: ${plan.decisiones.map(x => `${x.contexto} → ${x.elegida}`).join(" · ")}`);
  }
  return { nombre: `${P} · Semana del ${formatDate(P)} al ${formatDate(addDays(P, 6))}`, html: envolver(html) };
}

// ─── 3. Trimestre: revisión + plan del siguiente ───────────────────────
function docTrimestre(K, d, hoy, autor) {
  const rev = d.trimestreLog[K];
  if (!rev || rev.v !== 2) return null;
  const { inicio, fin, anio, q } = partesTrimestre(K);
  const e = estadisticasRango(inicio, fin, hoy, d);
  let html = encabezado(`REVISIÓN TRIMESTRAL ${nombreTrimestre(K).toUpperCase()}`, autor);
  html += p(`Período: ${formatDate(inicio)} al ${formatDate(fin)} · estado: ${rev.estado === "completa" ? "completa" : "en curso"}`);
  html += h2("RECOLECCIÓN") + lista([
    `Consistencia Noche ${e.consistencia ?? "—"}% (${e.noches} de ${e.diasNoche} días) · Score ${e.score ?? "—"}% · Mañanas ${e.mananas}`,
    `Por pregunta: ${[...PREGUNTAS_H1, PREGUNTA_H2].map((x, i) => `${x.label.replace(/^H\d — /, "")} ${e.porPregunta[i] ?? "—"}%`).join(" · ")}`,
    `Hábitos: ${e.habitos.map(h => `${h.nombre} ${h.pct ?? "—"}%`).join(" · ")}`,
  ]);
  html += h2("MISIÓN Y VISIÓN") + lista([
    rev.mision?.corregir && `Misión, qué corregir: ${rev.mision.corregir}`, rev.mision?.priorizar && `Misión, qué no estoy priorizando: ${rev.mision.priorizar}`,
    rev.vision?.cambio && `Visión, qué cambió: ${rev.vision.cambio}`, rev.vision?.acerca && `Visión, qué no me acerca: ${rev.vision.acerca}`,
  ]);
  const objs = (d.planTrim[K]?.objetivos || []).filter(o => o.texto);
  html += h2("OBJETIVOS DEL TRIMESTRE") + (objs.length
    ? lista(objs.map(o => `${nombreRol(o.rol)}: ${o.texto} → ${({ si: "Cumplí", parcial: "A medias", no: "No cumplí" })[rev.objetivos?.[o.id]?.estado] || "sin evaluar"}${rev.objetivos?.[o.id]?.porque ? ` — ${rev.objetivos[o.id].porque}` : ""}`))
    : p(rev.sinPlanNota || "Sin plan cargado en el tracker."));
  if (rev.habitos?.nota) html += h2("HÁBITOS") + p(rev.habitos.nota);
  const anuales = Object.entries(d.objetivos || {}).map(([id, o]) => ({ id, ...o })).filter(o => o.anio === anio && !o.archivado);
  if (anuales.length) html += h2(`OBJETIVOS ${anio} · ¿CÓMO VOY?`) + lista(anuales.map(o => `${nombreRol(o.rol)}: ${o.titulo} → ${({ encamino: "Encaminado", atrasado: "Atrasado", cumplido: "Cumplido", riesgo: "En riesgo" })[rev.anuales?.[o.id]?.estado] || "sin evaluar"}${rev.anuales?.[o.id]?.nota ? ` — ${rev.anuales[o.id].nota}` : ""}`));
  if (rev.impresiones) html += h2("IMPRESIONES") + p(rev.impresiones);
  if (rev.salida?.proximosPasos) html += h2("PRÓXIMOS PASOS PARA LLEGAR A FIN DE AÑO") + p(rev.salida.proximosPasos);
  const S = trimestreSiguiente(K), plan = d.planTrim[S];
  if (plan?.objetivos?.length) {
    const semanas = semanasDelTrimestre(S);
    html += h2(`PLAN ${nombreTrimestre(S).toUpperCase()}`) + lista(plan.objetivos.filter(o => o.texto).map(o =>
      `${nombreRol(o.rol)}: ${o.texto} — acciones: ${(o.acciones || []).filter(a => a.texto).map(a => `${a.texto}${a.semana ? ` (sem ${semanas.indexOf(a.semana) + 1}, ${formatDate(a.semana).slice(0, 5)})` : " (sin semana)"}`).join(" · ") || "—"}`));
    if (plan.prioridad) html += p(`Prioridad: ${plan.prioridad}`);
  }
  return { nombre: `${anio}-T${q} · Revisión trimestral ${nombreTrimestre(K)}`, html: envolver(html) };
}

// ─── 4. Año: las 5 partes ──────────────────────────────────────────────
function docAnual(Yt, d, autor) {
  const rev = d.anualLog[Yt];
  if (!rev || rev.v !== 2) return null;
  const Y = Number(Yt), pt = rev.partes || {}, p1 = pt[1] || {}, p2 = pt[2] || {}, p3 = pt[3] || {}, p4 = pt[4] || {}, p5 = pt[5] || {};
  const estado = (n) => pt[n]?.estado === "completa" ? "completa" : "en curso";
  let html = encabezado(`REVISIÓN ANUAL ${Y}`, autor);
  html += h2(`PARTE 1 · EVALUAR EL AÑO (${estado(1)})`);
  if (p1.titular) html += p(`Titular: "${p1.titular}"`);
  const meses = Object.entries(p1.meses || {}).filter(([, t]) => t && t.trim()).sort((a, b) => b[0].localeCompare(a[0]));
  if (meses.length) html += h3("Acontecimientos") + lista(meses.map(([m, t]) => `${MESES[Number(m) - 1]}: ${t.split("\n").filter(Boolean).join(" · ")}`));
  const imp = Object.entries(p1.impacto || {}).filter(([, v]) => v.marcado);
  if (imp.length) html += h3("Mayor impacto") + lista(imp.map(([k, v]) => `${k.split("|")[1]}${v.tipo ? ` (${v.tipo})` : ""}`));
  [["Logros", p1.logros], ["Lo que podría haber sido mejor", p1.mejorable], ["Personas", p1.personas]].forEach(([t, v]) => {
    const xs = Object.values(v || {}).filter(Boolean); if (xs.length) html += h3(t) + lista(xs);
  });
  const ch = Object.entries(p1.chequeo || {});
  if (ch.length) html += h3("Chequeo vivir · amar · aprender · legado (Superhábitos)") + lista(ch.map(([a, v]) => `${a}: ${Object.values(v.respuestas || {}).map(x => ({ si: "Sí", medias: "A medias", no: "No" })[x]).join(", ")}${v.nota ? ` — ${v.nota}` : ""}`));
  const ev = Object.entries(p1.objetivos || {}).filter(([, v]) => v.categoria);
  if (ev.length) html += h3(`Objetivos ${Y}`) + lista(ev.map(([id, v]) => `${d.objetivos?.[id]?.titulo || id} → ${v.categoria}${v.ayudo ? ` · ayudó: ${v.ayudo}` : ""}${v.impidio ? ` · lo impidió: ${v.impidio}` : ""}${v.distinto ? ` · distinto: ${v.distinto}` : ""}${v.motivo ? ` · motivo: ${v.motivo}` : ""}`));
  const lec = (p1.lecciones || []).filter(Boolean);
  if (lec.length) html += h3("Lecciones") + lista(lec.map((l, k) => `${k + 1}. ${l}`));
  html += h2(`PARTE 2 · RECONECTAR (${estado(2)})`) + lista([
    p2.misionNota && `Misión: ${p2.misionNota}`,
    p2.vision && (p2.vision.donde || p2.vision.queHago) && `Un día dentro de 5 años: ${[p2.vision.donde, p2.vision.conQuien, p2.vision.queHago].filter(Boolean).join(" · ")}`,
    p2.vision?.cambios && `Cambios a la visión: ${p2.vision.cambios}`,
    p2.roles?.nota && `Roles: ${p2.roles.nota}`,
  ]);
  const nuevos = Object.values(d.objetivos || {}).filter(o => o.anio === Y + 1 && !o.archivado);
  html += h2(`PARTE 3 · OBJETIVOS ${Y + 1} (${estado(3)})`) + lista(nuevos.map(o => `${nombreRol(o.rol)}: ${o.central ? "★ " : ""}${o.titulo}${o.estadoActual || o.estadoDeseado ? ` (${o.estadoActual || "…"} → ${o.estadoDeseado || "…"})` : ""}${o.plazo ? ` · plazo ${formatDate(o.plazo)}` : ""}${o.paraQue ? ` · para qué: ${o.paraQue}` : ""}`));
  const habs = Object.values(d.habitos || {}).filter(h => h.anio === Y + 1 && h.prioridad && !h.archivado).sort((a, b) => (a.mes || 13) - (b.mes || 13));
  html += h2(`PARTE 4 · HÁBITOS E INVERSIONES (${estado(4)})`) + lista(habs.map(h => `${h.mes ? MESES[h.mes - 1] : "sin mes"}: ${h.texto}${h.dimension ? ` (${h.dimension})` : ""}`));
  if ((p4.inversiones || []).filter(x => x.que).length) html += h3("Inversiones") + lista(p4.inversiones.filter(x => x.que).map(x => `${x.que}${x.para ? ` · para: ${x.para}` : ""}${x.tipo ? ` · ${x.tipo}` : ""}${x.financia ? ` · se financia: ${x.financia}` : ""}`));
  html += h2(`PARTE 5 · MULTIPLICAR (${estado(5)})`);
  if (p5.relato) html += h3(`Un día a fin de ${Y + 1}`) + p(p5.relato);
  const ag = p5.agenda?.[Y + 1];
  if (ag) html += h3("Agenda") + lista([1, 2, 3].map(q => ag[`t${q}`] && `Trimestral T${q}: ${formatDate(ag[`t${q}`])}`).concat(p5.agenda?.semanal ? [`Semanal: ${p5.agenda.semanal.dia === 0 ? "domingos" : "sábados"} ${p5.agenda.semanal.hora}`] : []));
  if ((p5.companeros || []).filter(x => x.quien).length) html += h3("Compañeros de ruta") + lista(p5.companeros.filter(x => x.quien).map(x => `${x.quien}${x.objetivo ? ` · ${x.objetivo}` : ""}${x.modo ? ` · ${x.modo}` : ""}`));
  if (p3.decisiones?.length) html += p(`Decisiones con la matriz: ${p3.decisiones.map(x => `${x.contexto} → ${x.elegida}`).join(" · ")}`);
  return { nombre: `${Y} · Revisión anual ${Y}`, html: envolver(html) };
}
