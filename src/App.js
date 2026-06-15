import { useState, useEffect } from "react";

// ─── Storage keys ──────────────────────────────────────────────────────
const KEY_NOCHE    = "habito1_registros";
const KEY_MANANA   = "habito1_manana";
const KEY_SEMANA   = "habito1_semana";

// ─── Racing Club palette ───────────────────────────────────────────────
const C = {
  bg:           "#f0f4f8",
  surface:      "#ffffff",
  surfaceAlt:   "#e8eef5",
  border:       "#c5d5e8",
  navy:         "#001f5b",
  navyLight:    "#0a3080",
  celeste:      "#2176c7",
  celesteLight: "#5ba3e8",
  celestePale:  "#ddeeff",
  white:        "#ffffff",
  textPrimary:  "#0d1f3c",
  textSecond:   "#4a6285",
  textMuted:    "#8aa3c0",
  yes:          "#1a7a3c",
  yesBg:        "#d4f0df",
  no:           "#b91c1c",
  noBg:         "#fde8e8",
  warn:         "#b45309",
  warnBg:       "#fef3c7",
  perfect:      "#2176c7",
  good:         "#1a7a3c",
  mid:          "#b45309",
  bad:          "#b91c1c",
  skip:         "#c5d5e8",
  gold:         "#d97706",
  goldBg:       "#fef9ec",
};

// ─── Contenido fijo: Misión, Visión, Roles ─────────────────────────────
const MISION = `Soy Facundo Iorfida y me comprometo a vivir una vida plena y alineada con lo que soy, lo que creo y lo que quiero lograr.

• Ser un padre presente y amoroso, acompañando a Francesca con el ejemplo, el amor y los valores necesarios para que crezca sana, feliz y libre.
• Ponerle pasión a todo lo que haga, disfrutar el proceso y estar presente de verdad, sin vivir a medias.
• Apostar a mi crecimiento personal, conociéndome más, y cuidar mi cuerpo y mi mente, porque son la base de mi energía, claridad y mejor versión.
• Valorar el esfuerzo y el laburo bien hecho, haciéndome cargo de mis decisiones y entendiendo que cada elección marca mi rumbo.
• Cuidar y nutrir mis relaciones, priorizando el amor, el respeto y el apoyo mutuo con Flo, mi familia y mis amigos.
• Impactar positivamente en quienes me rodean, actuando con honestidad, escuchando con atención y dando siempre lo mejor de mí.
• Construir mi libertad financiera y laboral, como base para vivir con autonomía y poder ayudar a otros con impacto.

Elijo vivir con intención, sabiendo que cada día me da la chance de escribir una historia única.`;

const VISION_ITEMS = [
  { titulo: "Familia y amor", texto: "Una pareja sólida y elegida con Flo, con Francesca creciendo como parte central de mi vida, y la familia agrandándose con uno o dos hijos más. La familia grande unida y presente, y Pepita acompañada por su 'hermanita' coneja." },
  { titulo: "Paternidad", texto: "Un padre activo y presente en todas las dimensiones — física, anímica y espiritualmente — capaz de jugar, acompañar y ser el ejemplo que Francesca necesita en cada etapa." },
  { titulo: "Cuerpo y salud", texto: "Un cuerpo cuidado, con energía sostenida y bienestar físico como base de todo lo demás. Rutina sana: entrenamiento, desayuno nutritivo y orden cotidiano como pilares inamovibles." },
  { titulo: "Trabajo y profesión", texto: "Liderando mi propio comercio o empresa — donde yo sea el dueño y el que toma las decisiones." },
  { titulo: "Libertad financiera y viajes", texto: "Libertad financiera real como meta fundamental. Viajes con Flo y la familia, subiendo a aviones con destinos elegidos, sin restricciones económicas." },
  { titulo: "Hogar propio", texto: "Un hogar moderno, luminoso y minimalista — dormitorio, living y cocina de calidad — que sea el refugio y el centro de mi familia." },
  { titulo: "Amigos y comunidad", texto: "Grupos grandes, celebraciones, pertenencia. La presencia de familia y amigos como algo irremplazable. El fútbol del CCBP como espacio de comunidad y disfrute." },
  { titulo: "Racing", texto: "En la cancha, de local y de visitante, con familia disfrutando lo que amo." },
];

const ROLES = [
  { num: "1", nombre: "Facundo", desc: "Desarrollo personal, hábitos, cuerpo y mente." },
  { num: "2", nombre: "Papá de Francesca", desc: "Padre presente, amoroso, que lidera con el ejemplo." },
  { num: "3", nombre: "Facundito", desc: "Compañero, presente, que elige a Flo todos los días." },
  { num: "4", nombre: "Iorfida", desc: "Hijo, nieto, tío de Josefina. Familia extensa unida." },
  { num: "5", nombre: "Iorfi/a", desc: "Amigo presente que cultiva los vínculos con EPG, EC, Vi y Lu." },
  { num: "6", nombre: "Lead Analyst Tecpetrol", desc: "Referente del área, liderazgo real, camino a Team Leader." },
  { num: "7", nombre: "Emprendedor", desc: "Freelance (IJ, Yungo, Lubich) + proyecto inmobiliario Riglos." },
  { num: "8", nombre: "Referente CCBP", desc: "Comunidad, organización, presencia deportiva y comisión." },
];

// ─── Preguntas Hábito 1 (noche) ────────────────────────────────────────
const PREGUNTAS_H1 = [
  { id: "p1", label: "H1 — Energía",   pregunta: "¿Puse mi energía en lo que puedo controlar?",              ayuda: "SÍ = me enfoqué en mi Círculo de Influencia. NO = gasté energía en preocupaciones fuera de mi control." },
  { id: "p2", label: "H1 — Lenguaje",  pregunta: "¿Usé lenguaje proactivo durante el día?",                  ayuda: "SÍ = evité 'tengo que', 'no puedo', 'me hizo'. NO = caí en lenguaje reactivo." },
  { id: "p3", label: "H1 — Respuesta", pregunta: "¿Respondí desde mis valores en lugar de reaccionar?",      ayuda: "SÍ = actué desde mis valores ante situaciones difíciles. NO = reaccioné automáticamente." },
];

const PREGUNTA_H2 = {
  id: "p4", label: "H2 — Alineación",
  pregunta: "¿Lo que hice hoy estuvo alineado con la persona que quiero ser?",
  ayuda: "SÍ = mis acciones de hoy reflejan mi misión y roles. NO = el día fue tomado por urgencias ajenas a lo que importa.",
};

// ─── Preguntas revisión semanal ────────────────────────────────────────
const PREGUNTAS_SEMANA = [
  { id: "s1", pregunta: "¿Cuál fue el rol más descuidado esta semana?",                      placeholder: "Ej: Facundito — no generé momentos de conexión con Flo." },
  { id: "s2", pregunta: "¿Qué decisión tomé esta semana que estuvo alineada con mi misión?", placeholder: "Ej: Prioricé el entreno aunque estaba cansado." },
  { id: "s3", pregunta: "¿Qué quiero hacer diferente la semana que viene?",                  placeholder: "Ej: Bloquear el miércoles para avanzar con Riglos." },
];

// ─── Helpers ──────────────────────────────────────────────────────────
function today() { return new Date().toISOString().slice(0, 10); }

function formatDate(ds) {
  const [y, m, d] = ds.split("-");
  return `${d}/${m}/${y}`;
}

function dayOfWeek(ds) {
  const days = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
  return days[new Date(ds + "T12:00:00").getDay()];
}

function getWeekStart(ds) {
  const d = new Date(ds + "T12:00:00");
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - day + 1);
  return d.toISOString().slice(0, 10);
}

function addDays(ds, n) {
  const d = new Date(ds + "T12:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function dateRange(from, to) {
  const dates = [];
  let cur = from;
  while (cur <= to) { dates.push(cur); cur = addDays(cur, 1); }
  return dates;
}

function scoreColor(pct) {
  if (pct >= 80) return C.good;
  if (pct >= 50) return C.mid;
  return C.bad;
}

function dotColor(reg) {
  if (!reg) return C.skip;
  const s = [reg.p1, reg.p2, reg.p3].filter(Boolean).length;
  if (s === 3) return C.perfect;
  if (s === 2) return C.good;
  if (s === 1) return C.mid;
  return C.bad;
}

function getQuarter(ds) {
  const m = parseInt(ds.split("-")[1]);
  return Math.ceil(m / 3);
}

function isTrimestralDue() {
  const t = today();
  const m = parseInt(t.split("-")[1]);
  // Due in months 3, 6, 9, 12 (last month of each quarter)
  return m % 3 === 0;
}

// ─── App ──────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("manana");

  // Storage
  const [registros, setRegistros] = useState({});   // noche: { fecha: {p1,p1_nota,...,p4,p4_nota} }
  const [mananaLog, setMananaLog] = useState({});   // { "2026-06-15": true }
  const [semanaLog, setSemanaLog] = useState({});   // { "2026-06-09": {s1,s2,s3,ts} }

  // Noche form
  const [form, setForm] = useState({
    fecha: today(), p1: null, p1_nota: "", p2: null, p2_nota: "",
    p3: null, p3_nota: "", p4: null, p4_nota: "",
  });
  const [savedNoche, setSavedNoche] = useState(false);

  // Semana form
  const [semanaForm, setSemanaForm] = useState({ s1: "", s2: "", s3: "" });
  const [savedSemana, setSavedSemana] = useState(false);

  // Load all storage
  useEffect(() => {
    try {
      const r = localStorage.getItem(KEY_NOCHE);   if (r) setRegistros(JSON.parse(r));
      const m = localStorage.getItem(KEY_MANANA);  if (m) setMananaLog(JSON.parse(m));
      const s = localStorage.getItem(KEY_SEMANA);  if (s) setSemanaLog(JSON.parse(s));
    } catch {}
  }, []);

  // Pre-fill noche form when date changes
  useEffect(() => {
    const r = registros[form.fecha];
    if (r) {
      setForm(f => ({
        ...f, p1: r.p1, p1_nota: r.p1_nota ?? "", p2: r.p2, p2_nota: r.p2_nota ?? "",
        p3: r.p3, p3_nota: r.p3_nota ?? "", p4: r.p4 ?? null, p4_nota: r.p4_nota ?? "",
      }));
    } else {
      setForm(f => ({ ...f, p1: null, p1_nota: "", p2: null, p2_nota: "", p3: null, p3_nota: "", p4: null, p4_nota: "" }));
    }
  }, [form.fecha, registros]);

  // Pre-fill semana form for current week
  useEffect(() => {
    const wk = getWeekStart(today());
    const s = semanaLog[wk];
    if (s) setSemanaForm({ s1: s.s1 ?? "", s2: s.s2 ?? "", s3: s.s3 ?? "" });
    else setSemanaForm({ s1: "", s2: "", s3: "" });
  }, [semanaLog]);

  const persistNoche = (data) => {
    setRegistros(data);
    try { localStorage.setItem(KEY_NOCHE, JSON.stringify(data)); } catch {}
  };
  const persistManana = (data) => {
    setMananaLog(data);
    try { localStorage.setItem(KEY_MANANA, JSON.stringify(data)); } catch {}
  };
  const persistSemana = (data) => {
    setSemanaLog(data);
    try { localStorage.setItem(KEY_SEMANA, JSON.stringify(data)); } catch {}
  };

  // Handlers
  const handleGuardarNoche = () => {
    if (form.p1 === null || form.p2 === null || form.p3 === null || form.p4 === null) return;
    const updated = {
      ...registros,
      [form.fecha]: {
        fecha: form.fecha, p1: form.p1, p1_nota: form.p1_nota,
        p2: form.p2, p2_nota: form.p2_nota, p3: form.p3, p3_nota: form.p3_nota,
        p4: form.p4, p4_nota: form.p4_nota,
      }
    };
    persistNoche(updated);
    setSavedNoche(true);
    setTimeout(() => setSavedNoche(false), 2500);
  };

  const handleMarcarManana = () => {
    const t = today();
    const updated = { ...mananaLog, [t]: true };
    persistManana(updated);
  };

  const handleGuardarSemana = () => {
    const wk = getWeekStart(today());
    const updated = { ...semanaLog, [wk]: { ...semanaForm, ts: today() } };
    persistSemana(updated);
    setSavedSemana(true);
    setTimeout(() => setSavedSemana(false), 2500);
  };

  // Computed
  const allDates    = Object.keys(registros).sort();
  const firstDate   = allDates[0] || today();
  const allDays     = dateRange(firstDate, today());
  const tracked     = allDays.filter(d => registros[d]);
  const missed      = allDays.filter(d => !registros[d] && d !== today());
  const totalDays   = allDays.length;
  const consistency = totalDays > 0 ? Math.round((tracked.length / totalDays) * 100) : 0;

  const mananHoy    = !!mananaLog[today()];
  const nocheHoy    = !!registros[today()];
  const wkStart     = getWeekStart(today());
  const semanaHecha = !!semanaLog[wkStart];
  const trimDue     = isTrimestralDue();

  const weekGroups = {};
  allDays.forEach(d => {
    const wk = getWeekStart(d);
    if (!weekGroups[wk]) weekGroups[wk] = [];
    weekGroups[wk].push(d);
  });
  const weekKeys = Object.keys(weekGroups).sort((a,b) => b.localeCompare(a));

  const weekScore = (days) => {
    const regs = days.map(d => registros[d]).filter(Boolean);
    if (!regs.length) return null;
    const yes = regs.reduce((a,r) => a + (r.p1?1:0) + (r.p2?1:0) + (r.p3?1:0) + (r.p4?1:0), 0);
    return Math.round((yes / (regs.length * 4)) * 100);
  };

  const pctByQ = [...PREGUNTAS_H1, PREGUNTA_H2].map(p => {
    if (!tracked.length) return 0;
    const yes = tracked.filter(d => registros[d][p.id]).length;
    return Math.round((yes / tracked.length) * 100);
  });

  // Badge counts for nav
  const badges = {
    manana: mananHoy ? 0 : 1,
    noche:  nocheHoy ? 0 : 1,
    semana: semanaHecha ? 0 : 1,
  };

  // ── Render ──
  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans', sans-serif", color: C.textPrimary }}>

      {/* Header */}
      <div style={{ background: C.navy, position: "sticky", top: 0, zIndex: 20, boxShadow: "0 2px 12px rgba(0,31,91,0.3)" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 38, height: 38, flexShrink: 0 }}>
            <svg viewBox="0 0 38 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 2L36 9V24C36 33 28 40 19 42C10 40 2 33 2 24V9L19 2Z" fill={C.celeste} stroke={C.white} strokeWidth="1.5"/>
              <path d="M19 2L36 9V24C36 33 28 40 19 42V2Z" fill={C.navy}/>
              <path d="M19 2L2 9V24C2 33 10 40 19 42V2Z" fill={C.white}/>
              <path d="M10 20H28M19 11V31" stroke={C.celeste} strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 3, color: C.celesteLight, textTransform: "uppercase", marginBottom: 2 }}>Los 7 Hábitos · Covey</div>
            <div style={{ fontSize: 18, fontFamily: "'Playfair Display', serif", color: C.white, letterSpacing: 0.3 }}>
              Centro de Mando <em style={{ color: C.celesteLight }}>Personal</em>
            </div>
          </div>
        </div>

        {/* Nav tabs */}
        <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", borderTop: "1px solid rgba(255,255,255,0.1)", overflowX: "auto" }}>
          {[
            { id: "manana",   label: "Mañana",   badge: badges.manana },
            { id: "noche",    label: "Noche",     badge: badges.noche },
            { id: "historial",label: "Historial", badge: 0 },
            { id: "semana",   label: "Semana",    badge: badges.semana },
            { id: "resumen",  label: "Resumen",   badge: 0 },
          ].map(tab => (
            <button key={tab.id} onClick={() => setView(tab.id)} style={{
              flex: "1 0 auto", padding: "11px 8px", border: "none", cursor: "pointer",
              background: "transparent",
              color: view === tab.id ? C.white : "rgba(255,255,255,0.4)",
              fontSize: 12, fontFamily: "inherit", fontWeight: view === tab.id ? 600 : 400,
              borderBottom: view === tab.id ? `3px solid ${C.celeste}` : "3px solid transparent",
              transition: "all 0.2s", position: "relative", whiteSpace: "nowrap",
            }}>
              {tab.label}
              {tab.badge > 0 && (
                <span style={{
                  position: "absolute", top: 6, right: 4,
                  width: 7, height: 7, borderRadius: "50%",
                  background: C.warn, border: `1px solid ${C.navy}`,
                }} />
              )}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "20px 16px 80px" }}>

        {/* ── MAÑANA ─────────────────────────────────────── */}
        {view === "manana" && (
          <div>
            {/* Status pill */}
            <div style={{
              ...cardStyle,
              background: mananHoy ? C.yesBg : C.warnBg,
              border: `1px solid ${mananHoy ? C.yes : C.warn}`,
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: 20,
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: mananHoy ? C.yes : C.warn }}>
                  {mananHoy ? "✓ Revisión matutina completada" : "⏰ Revisión matutina pendiente"}
                </div>
                <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>
                  {mananHoy ? "Ya leíste tu misión, visión y roles hoy." : "Leé tu misión, visión y roles antes de arrancar el día."}
                </div>
              </div>
              {!mananHoy && (
                <button onClick={handleMarcarManana} style={{
                  flexShrink: 0, marginLeft: 12,
                  padding: "8px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                  background: C.navy, color: C.white, fontSize: 12, fontFamily: "inherit", fontWeight: 600,
                }}>Marcar ✓</button>
              )}
            </div>

            {/* Pregunta ancla */}
            <div style={{ ...cardStyle, background: C.celestePale, border: `1px solid ${C.celeste}`, marginBottom: 20 }}>
              <div style={{ fontSize: 11, letterSpacing: 2, color: C.celeste, textTransform: "uppercase", marginBottom: 8 }}>Pregunta del día — Hábito 2</div>
              <div style={{ fontSize: 15, fontStyle: "italic", color: C.navy, lineHeight: 1.6 }}>
                "¿Qué puede pasar hoy que, si no lo elijo yo, lo va a elegir el entorno por mí?"
              </div>
            </div>

            {/* Misión */}
            <div style={cardStyle}>
              <SectionLabel>✦ Misión Personal</SectionLabel>
              <div style={{ fontSize: 14, color: C.textSecond, lineHeight: 1.7, whiteSpace: "pre-line" }}>{MISION}</div>
            </div>

            {/* Visión */}
            <div style={cardStyle}>
              <SectionLabel>✦ Visión Personal — 5 años</SectionLabel>
              {VISION_ITEMS.map((v, i) => (
                <div key={i} style={{ marginBottom: i < VISION_ITEMS.length - 1 ? 16 : 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.celeste, marginBottom: 3, textTransform: "uppercase", letterSpacing: 1 }}>{v.titulo}</div>
                  <div style={{ fontSize: 13, color: C.textSecond, lineHeight: 1.6 }}>{v.texto}</div>
                </div>
              ))}
            </div>

            {/* Roles */}
            <div style={cardStyle}>
              <SectionLabel>✦ Mis 8 Roles</SectionLabel>
              {ROLES.map((r, i) => (
                <div key={i} style={{
                  display: "flex", gap: 12, alignItems: "flex-start",
                  paddingBottom: i < ROLES.length - 1 ? 14 : 0,
                  marginBottom: i < ROLES.length - 1 ? 14 : 0,
                  borderBottom: i < ROLES.length - 1 ? `1px solid ${C.border}` : "none",
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%", background: C.navy,
                    color: C.white, fontSize: 12, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>{r.num}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary }}>{r.nombre}</div>
                    <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{r.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mark done button at bottom */}
            {!mananHoy && (
              <button onClick={handleMarcarManana} style={{
                width: "100%", padding: 14, borderRadius: 10, border: "none", cursor: "pointer",
                background: C.navy, color: C.white, fontSize: 15, fontFamily: "inherit", fontWeight: 600,
              }}>✓ Marcar revisión matutina como completada</button>
            )}
          </div>
        )}

        {/* ── NOCHE ──────────────────────────────────────── */}
        {view === "noche" && (
          <div>
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Fecha del registro</label>
              <input type="date" value={form.fecha} max={today()}
                onChange={e => setForm({ ...form, fecha: e.target.value })}
                style={inputStyle} />
              {registros[form.fecha] && (
                <div style={{ marginTop: 6, fontSize: 12, color: C.celeste }}>✏️ Ya tenés un registro para este día — podés editarlo.</div>
              )}
            </div>

            {/* H1 Questions */}
            <div style={{ fontSize: 11, letterSpacing: 2, color: C.textMuted, textTransform: "uppercase", marginBottom: 10 }}>Hábito 1 — Sea Proactivo</div>
            {PREGUNTAS_H1.map((p) => (
              <div key={p.id} style={cardStyle}>
                <div style={{ fontSize: 11, letterSpacing: 2, color: C.textMuted, textTransform: "uppercase", marginBottom: 6 }}>{p.label}</div>
                <div style={{ fontSize: 15, color: C.textPrimary, marginBottom: 6, lineHeight: 1.5, fontWeight: 500 }}>{p.pregunta}</div>
                <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 14, fontStyle: "italic" }}>{p.ayuda}</div>
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  {[true, false].map(val => (
                    <button key={String(val)} onClick={() => setForm({ ...form, [p.id]: val })} style={{
                      padding: "8px 32px", borderRadius: 8, border: "2px solid", cursor: "pointer",
                      fontFamily: "inherit", fontSize: 14, fontWeight: 700,
                      background: form[p.id] === val ? (val ? C.yesBg : C.noBg) : C.surfaceAlt,
                      color: form[p.id] === val ? (val ? C.yes : C.no) : C.textMuted,
                      borderColor: form[p.id] === val ? (val ? C.yes : C.no) : C.border,
                      transition: "all 0.15s",
                    }}>{val ? "SÍ" : "NO"}</button>
                  ))}
                </div>
                <textarea placeholder="Una línea explicando..." value={form[`${p.id}_nota`]}
                  onChange={e => setForm({ ...form, [`${p.id}_nota`]: e.target.value })}
                  rows={2} style={{ ...inputStyle, resize: "none", lineHeight: 1.5, fontSize: 13 }} />
              </div>
            ))}

            {/* H2 Question */}
            <div style={{ fontSize: 11, letterSpacing: 2, color: C.textMuted, textTransform: "uppercase", marginBottom: 10, marginTop: 6 }}>Hábito 2 — Empiece con un fin en mente</div>
            <div key={PREGUNTA_H2.id} style={{ ...cardStyle, borderLeft: `4px solid ${C.celeste}` }}>
              <div style={{ fontSize: 11, letterSpacing: 2, color: C.celeste, textTransform: "uppercase", marginBottom: 6 }}>{PREGUNTA_H2.label}</div>
              <div style={{ fontSize: 15, color: C.textPrimary, marginBottom: 6, lineHeight: 1.5, fontWeight: 500 }}>{PREGUNTA_H2.pregunta}</div>
              <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 14, fontStyle: "italic" }}>{PREGUNTA_H2.ayuda}</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                {[true, false].map(val => (
                  <button key={String(val)} onClick={() => setForm({ ...form, [PREGUNTA_H2.id]: val })} style={{
                    padding: "8px 32px", borderRadius: 8, border: "2px solid", cursor: "pointer",
                    fontFamily: "inherit", fontSize: 14, fontWeight: 700,
                    background: form[PREGUNTA_H2.id] === val ? (val ? C.yesBg : C.noBg) : C.surfaceAlt,
                    color: form[PREGUNTA_H2.id] === val ? (val ? C.yes : C.no) : C.textMuted,
                    borderColor: form[PREGUNTA_H2.id] === val ? (val ? C.yes : C.no) : C.border,
                    transition: "all 0.15s",
                  }}>{val ? "SÍ" : "NO"}</button>
                ))}
              </div>
              <textarea placeholder="¿Qué rol quedó más alineado hoy? ¿Cuál quedó en deuda?" value={form[`${PREGUNTA_H2.id}_nota`]}
                onChange={e => setForm({ ...form, [`${PREGUNTA_H2.id}_nota`]: e.target.value })}
                rows={2} style={{ ...inputStyle, resize: "none", lineHeight: 1.5, fontSize: 13 }} />
            </div>

            <button onClick={handleGuardarNoche}
              disabled={form.p1 === null || form.p2 === null || form.p3 === null || form.p4 === null}
              style={{
                width: "100%", padding: 14, borderRadius: 10, border: "none",
                background: (form.p1 !== null && form.p2 !== null && form.p3 !== null && form.p4 !== null) ? C.navy : C.surfaceAlt,
                color: (form.p1 !== null && form.p2 !== null && form.p3 !== null && form.p4 !== null) ? C.white : C.textMuted,
                fontSize: 15, fontFamily: "inherit", fontWeight: 600, cursor: "pointer",
                transition: "all 0.2s", letterSpacing: 0.3,
              }}>
              {savedNoche ? "✓ Guardado correctamente" : "Guardar registro del día"}
            </button>
          </div>
        )}

        {/* ── HISTORIAL ──────────────────────────────────── */}
        {view === "historial" && (
          <div>
            {allDays.length > 1 && (
              <div style={{ ...cardStyle, display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 11, letterSpacing: 2, color: C.textMuted, textTransform: "uppercase" }}>Consistencia</div>
                  <div style={{ fontSize: 13, color: C.textSecond, marginTop: 2 }}>{tracked.length} de {totalDays} días registrados</div>
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, color: scoreColor(consistency) }}>{consistency}%</div>
              </div>
            )}
            {allDays.length === 0 ? <Empty /> : (
              [...allDays].reverse().map(d => {
                const r = registros[d];
                const isMissed = !r && d !== today();
                const h1Score = r ? [r.p1, r.p2, r.p3].filter(Boolean).length : 0;
                return (
                  <div key={d} style={{ ...cardStyle, opacity: isMissed ? 0.55 : 1, borderLeft: `4px solid ${r ? dotColor(r) : C.skip}`, marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: isMissed ? 0 : 10 }}>
                      <div>
                        <span style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary }}>{formatDate(d)}</span>
                        <span style={{ fontSize: 12, color: C.textMuted, marginLeft: 8 }}>{dayOfWeek(d)}</span>
                      </div>
                      {r ? (
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: C.celestePale, color: C.celeste }}>H1: {h1Score}/3</span>
                          {r.p4 !== undefined && (
                            <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: r.p4 ? C.yesBg : C.noBg, color: r.p4 ? C.yes : C.no }}>H2: {r.p4 ? "SÍ" : "NO"}</span>
                          )}
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, color: C.textMuted, fontStyle: "italic" }}>sin registro</span>
                      )}
                    </div>
                    {r && (
                      <>
                        {PREGUNTAS_H1.map(p => (
                          <div key={p.id} style={{ display: "flex", gap: 10, marginBottom: 6, alignItems: "flex-start" }}>
                            <span style={{ fontSize: 11, fontWeight: 700, minWidth: 28, paddingTop: 1, color: r[p.id] ? C.yes : C.no }}>{r[p.id] ? "SÍ" : "NO"}</span>
                            <div>
                              <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 1 }}>{p.label}</div>
                              <div style={{ fontSize: 13, color: C.textSecond }}>{r[`${p.id}_nota`] || <em style={{ color: C.textMuted }}>Sin nota</em>}</div>
                            </div>
                          </div>
                        ))}
                        {r.p4 !== undefined && (
                          <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginTop: 4, paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
                            <span style={{ fontSize: 11, fontWeight: 700, minWidth: 28, paddingTop: 1, color: r.p4 ? C.yes : C.no }}>{r.p4 ? "SÍ" : "NO"}</span>
                            <div>
                              <div style={{ fontSize: 11, color: C.celeste, marginBottom: 1 }}>{PREGUNTA_H2.label}</div>
                              <div style={{ fontSize: 13, color: C.textSecond }}>{r.p4_nota || <em style={{ color: C.textMuted }}>Sin nota</em>}</div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── SEMANA ─────────────────────────────────────── */}
        {view === "semana" && (
          <div>
            {/* Alert trimestral */}
            {trimDue && (
              <div style={{ ...cardStyle, background: C.goldBg, border: `1px solid ${C.gold}`, marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.gold, marginBottom: 4 }}>⭐ Revisión trimestral pendiente</div>
                <div style={{ fontSize: 13, color: C.textSecond, lineHeight: 1.6 }}>
                  Estamos en el último mes del trimestre. Es momento de revisar tu misión, visión, roles y objetivos, y actualizar el documento en Drive.
                </div>
                <div style={{ fontSize: 12, color: C.textMuted, marginTop: 8 }}>
                  Preguntas clave: ¿Mis objetivos siguen siendo los correctos? ¿Qué roles descuidé este trimestre? ¿Qué ajusto para el próximo?
                </div>
              </div>
            )}

            {/* Estado semana actual */}
            <div style={{
              ...cardStyle,
              background: semanaHecha ? C.yesBg : C.warnBg,
              border: `1px solid ${semanaHecha ? C.yes : C.warn}`,
              marginBottom: 20,
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: semanaHecha ? C.yes : C.warn }}>
                {semanaHecha ? "✓ Revisión semanal completada" : "📋 Revisión semanal pendiente"}
              </div>
              <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>
                Semana del {formatDate(wkStart)}
              </div>
            </div>

            {/* Recordatorio roles */}
            <div style={{ ...cardStyle, marginBottom: 20 }}>
              <SectionLabel>Antes de planificar — ¿qué necesita cada rol esta semana?</SectionLabel>
              {ROLES.map((r, i) => (
                <div key={i} style={{
                  display: "flex", gap: 10, alignItems: "center",
                  paddingBottom: i < ROLES.length - 1 ? 10 : 0,
                  marginBottom: i < ROLES.length - 1 ? 10 : 0,
                  borderBottom: i < ROLES.length - 1 ? `1px solid ${C.border}` : "none",
                }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%", background: C.navy,
                    color: C.white, fontSize: 11, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>{r.num}</div>
                  <div style={{ fontSize: 13, color: C.textPrimary, fontWeight: 500 }}>{r.nombre}</div>
                </div>
              ))}
            </div>

            {/* Formulario reflexión */}
            <div style={cardStyle}>
              <SectionLabel>Reflexión semanal</SectionLabel>
              {PREGUNTAS_SEMANA.map((p, i) => (
                <div key={p.id} style={{ marginBottom: i < PREGUNTAS_SEMANA.length - 1 ? 20 : 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: C.textPrimary, marginBottom: 8, lineHeight: 1.5 }}>{p.pregunta}</div>
                  <textarea
                    placeholder={p.placeholder}
                    value={semanaForm[p.id]}
                    onChange={e => setSemanaForm({ ...semanaForm, [p.id]: e.target.value })}
                    rows={3}
                    style={{ ...inputStyle, resize: "none", lineHeight: 1.5, fontSize: 13 }}
                  />
                </div>
              ))}
              <button onClick={handleGuardarSemana} style={{
                width: "100%", padding: 14, borderRadius: 10, border: "none", cursor: "pointer",
                background: C.navy, color: C.white, fontSize: 15, fontFamily: "inherit", fontWeight: 600,
                marginTop: 16, transition: "all 0.2s",
              }}>
                {savedSemana ? "✓ Reflexión guardada" : "Guardar reflexión semanal"}
              </button>
            </div>

            {/* Historial semanal */}
            {Object.keys(semanaLog).length > 0 && (
              <div style={{ marginTop: 24 }}>
                <SectionLabel>Reflexiones anteriores</SectionLabel>
                {Object.keys(semanaLog).sort((a,b) => b.localeCompare(a)).map(wk => {
                  const s = semanaLog[wk];
                  const [,m,d] = wk.split("-");
                  return (
                    <div key={wk} style={{ ...cardStyle, marginBottom: 12 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Semana del {d}/{m}</div>
                      {PREGUNTAS_SEMANA.map(p => (
                        <div key={p.id} style={{ marginBottom: 10 }}>
                          <div style={{ fontSize: 11, color: C.celeste, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>{p.pregunta.slice(0, 40)}…</div>
                          <div style={{ fontSize: 13, color: C.textSecond }}>{s[p.id] || <em style={{ color: C.textMuted }}>Sin respuesta</em>}</div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── RESUMEN ────────────────────────────────────── */}
        {view === "resumen" && (
          <div>
            {tracked.length === 0 ? <Empty /> : (
              <>
                <div style={cardStyle}>
                  <SectionLabel>Global</SectionLabel>
                  <div style={{ display: "flex", gap: 0 }}>
                    {[
                      { label: "Días registrados", val: tracked.length },
                      { label: "Consistencia",     val: consistency + "%" },
                      { label: "Días perfectos",   val: tracked.filter(d => registros[d].p1 && registros[d].p2 && registros[d].p3 && registros[d].p4).length },
                      { label: "Días perdidos",    val: missed.length },
                    ].map((s, i) => (
                      <div key={s.label} style={{ flex: 1, textAlign: "center", padding: "0 4px", borderRight: i < 3 ? `1px solid ${C.border}` : "none" }}>
                        <div style={{ fontSize: 24, fontWeight: 700, color: C.navy }}>{s.val}</div>
                        <div style={{ fontSize: 11, color: C.textMuted, marginTop: 3, lineHeight: 1.3 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={cardStyle}>
                  <SectionLabel>Por pregunta</SectionLabel>
                  {[...PREGUNTAS_H1, PREGUNTA_H2].map((p, i) => (
                    <div key={p.id} style={{ marginBottom: i < 3 ? 16 : 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 13, color: i === 3 ? C.celeste : C.textSecond, fontWeight: 500 }}>{p.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: scoreColor(pctByQ[i]) }}>{pctByQ[i]}%</span>
                      </div>
                      <div style={{ height: 8, background: C.surfaceAlt, borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: pctByQ[i] + "%", background: i === 3 ? C.celeste : scoreColor(pctByQ[i]), borderRadius: 4, transition: "width 0.6s ease" }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div style={cardStyle}>
                  <SectionLabel>Por semana</SectionLabel>
                  {weekKeys.map(wk => {
                    const days = weekGroups[wk];
                    const pct  = weekScore(days);
                    const [,m,d] = wk.split("-");
                    return (
                      <div key={wk} style={{ marginBottom: 18 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                          <span style={{ fontSize: 13, color: C.textSecond, fontWeight: 500 }}>Semana del {d}/{m}</span>
                          <span style={{ fontSize: 13, color: C.textMuted }}>
                            {days.filter(d => registros[d]).length}/{days.length} días
                            {pct !== null && <span style={{ marginLeft: 6, fontWeight: 700, color: scoreColor(pct) }}>{pct}%</span>}
                          </span>
                        </div>
                        {pct !== null && (
                          <div style={{ height: 6, background: C.surfaceAlt, borderRadius: 3, overflow: "hidden", marginBottom: 8 }}>
                            <div style={{ height: "100%", width: pct + "%", background: scoreColor(pct), borderRadius: 3 }} />
                          </div>
                        )}
                        <div style={{ display: "flex", gap: 5 }}>
                          {days.map(d => (
                            <div key={d} title={`${dayOfWeek(d)} ${formatDate(d)}`} style={{
                              width: 10, height: 10, borderRadius: "50%",
                              background: d > today() ? "transparent" : dotColor(registros[d]),
                              border: d > today() ? "none" : `1px solid ${dotColor(registros[d])}`,
                              flexShrink: 0,
                            }} />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Revisiones semanales stats */}
                <div style={cardStyle}>
                  <SectionLabel>Revisiones semanales</SectionLabel>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 13, color: C.textSecond }}>Reflexiones completadas</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: C.navy }}>{Object.keys(semanaLog).length}</div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginTop: 8 }}>
                  {[
                    { color: C.perfect, label: "4/4 perfecto" },
                    { color: C.good,    label: "3/4" },
                    { color: C.mid,     label: "1-2/4" },
                    { color: C.bad,     label: "0/4" },
                    { color: C.skip,    label: "Sin registro" },
                  ].map(l => (
                    <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{ width: 9, height: 9, borderRadius: "50%", background: l.color }} />
                      <span style={{ fontSize: 11, color: C.textMuted }}>{l.label}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

// ── Small components ──────────────────────────────────────────────────
const cardStyle = {
  background: "#ffffff", border: `1px solid #c5d5e8`,
  borderRadius: 12, padding: "18px 16px", marginBottom: 14,
  boxShadow: "0 1px 4px rgba(0,31,91,0.06)",
};

const inputStyle = {
  width: "100%", boxSizing: "border-box",
  background: "#f0f4f8", border: `1px solid #c5d5e8`,
  borderRadius: 8, color: "#0d1f3c", padding: "10px 12px",
  fontSize: 14, fontFamily: "inherit",
};

const labelStyle = {
  fontSize: 11, letterSpacing: 2, color: "#8aa3c0",
  textTransform: "uppercase", display: "block", marginBottom: 6,
};

function SectionLabel({ children }) {
  return <div style={{ fontSize: 11, letterSpacing: 2, color: "#8aa3c0", textTransform: "uppercase", marginBottom: 14 }}>{children}</div>;
}

function Empty() {
  return (
    <div style={{ textAlign: "center", color: "#8aa3c0", padding: "56px 0", fontSize: 15 }}>
      Aún no hay registros.<br />
      <span style={{ fontSize: 13 }}>Completá tu primer chequeo nocturno.</span>
    </div>
  );
}
