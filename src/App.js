import { useState, useEffect } from "react";

const STORAGE_KEY = "habito1_registros";

// ─── Racing Club palette ───────────────────────────────────────────────
const C = {
  bg:        "#f0f4f8",
  surface:   "#ffffff",
  surfaceAlt:"#e8eef5",
  border:    "#c5d5e8",
  navy:      "#001f5b",
  navyLight: "#0a3080",
  celeste:   "#2176c7",
  celesteLight: "#5ba3e8",
  celestePale: "#ddeeff",
  white:     "#ffffff",
  textPrimary: "#0d1f3c",
  textSecond: "#4a6285",
  textMuted:  "#8aa3c0",
  yes:       "#1a7a3c",
  yesBg:     "#d4f0df",
  no:        "#b91c1c",
  noBg:      "#fde8e8",
  warn:      "#b45309",
  warnBg:    "#fef3c7",
  perfect:   "#2176c7",
  good:      "#1a7a3c",
  mid:       "#b45309",
  bad:       "#b91c1c",
  skip:      "#c5d5e8",
};

const PREGUNTAS = [
  {
    id: "p1",
    label: "P1 — Energía",
    pregunta: "¿Puse mi energía en lo que puedo controlar?",
    ayuda: "SÍ = me enfoqué en mi Círculo de Influencia. NO = gasté energía en preocupaciones fuera de mi control.",
  },
  {
    id: "p2",
    label: "P2 — Lenguaje",
    pregunta: "¿Usé lenguaje proactivo durante el día?",
    ayuda: "SÍ = evité 'tengo que', 'no puedo', 'me hizo'. NO = caí en lenguaje reactivo.",
  },
  {
    id: "p3",
    label: "P3 — Respuesta",
    pregunta: "¿Respondí desde mis valores en lugar de reaccionar?",
    ayuda: "SÍ = actué desde mis valores ante situaciones difíciles. NO = reaccioné automáticamente.",
  },
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

// ─── App ──────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView]       = useState("registro");
  const [registros, setRegistros] = useState({});
  const [form, setForm]       = useState({
    fecha: today(), p1: null, p1_nota: "", p2: null, p2_nota: "", p3: null, p3_nota: "",
  });
  const [saved, setSaved]     = useState(false);

  // Load
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setRegistros(JSON.parse(raw));
    } catch {}
  }, []);

  // Persist
  const persist = (data) => {
    setRegistros(data);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
  };

  // Pre-fill form if date already has data
  useEffect(() => {
    const r = registros[form.fecha];
    if (r) {
      setForm(f => ({ ...f, p1: r.p1, p1_nota: r.p1_nota, p2: r.p2, p2_nota: r.p2_nota, p3: r.p3, p3_nota: r.p3_nota }));
    } else {
      setForm(f => ({ ...f, p1: null, p1_nota: "", p2: null, p2_nota: "", p3: null, p3_nota: "" }));
    }
  }, [form.fecha]);

  const handleGuardar = () => {
    if (form.p1 === null || form.p2 === null || form.p3 === null) return;
    const updated = {
      ...registros,
      [form.fecha]: { fecha: form.fecha, p1: form.p1, p1_nota: form.p1_nota, p2: form.p2, p2_nota: form.p2_nota, p3: form.p3, p3_nota: form.p3_nota }
    };
    persist(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // Computed
  const allDates   = Object.keys(registros).sort();
  const firstDate  = allDates[0] || today();
  const allDays    = dateRange(firstDate, today());
  const tracked    = allDays.filter(d => registros[d]);
  const missed     = allDays.filter(d => !registros[d] && d !== today());
  const totalDays  = allDays.length;
  const consistency = totalDays > 0 ? Math.round((tracked.length / totalDays) * 100) : 0;

  // Weekly groups (fill gaps)
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
    const yes = regs.reduce((a,r) => a + (r.p1?1:0) + (r.p2?1:0) + (r.p3?1:0), 0);
    return Math.round((yes / (regs.length * 3)) * 100);
  };

  const pctByQ = PREGUNTAS.map(p => {
    if (!tracked.length) return 0;
    const yes = tracked.filter(d => registros[d][p.id]).length;
    return Math.round((yes / tracked.length) * 100);
  });

  // ── Render ──
  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans', sans-serif", color: C.textPrimary }}>

      {/* Header */}
      <div style={{ background: C.navy, padding: "0", position: "sticky", top: 0, zIndex: 20, boxShadow: "0 2px 12px rgba(0,31,91,0.3)" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
          {/* Racing shield */}
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
              Hábito 1 — <em>Sea Proactivo</em>
            </div>
          </div>
        </div>

        {/* Nav tabs */}
        <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          {[
            { id: "registro", label: "Registro" },
            { id: "historial", label: "Historial" },
            { id: "resumen",  label: "Resumen" },
          ].map(tab => (
            <button key={tab.id} onClick={() => setView(tab.id)} style={{
              flex: 1, padding: "11px 0", border: "none", cursor: "pointer",
              background: "transparent",
              color: view === tab.id ? C.white : "rgba(255,255,255,0.4)",
              fontSize: 13, fontFamily: "inherit", fontWeight: view === tab.id ? 600 : 400,
              borderBottom: view === tab.id ? `3px solid ${C.celeste}` : "3px solid transparent",
              transition: "all 0.2s",
            }}>{tab.label}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "20px 16px 60px" }}>

        {/* ── REGISTRO ─────────────────────────────────── */}
        {view === "registro" && (
          <div>
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Fecha del registro</label>
              <input type="date" value={form.fecha} max={today()}
                onChange={e => setForm({ ...form, fecha: e.target.value })}
                style={inputStyle} />
              {registros[form.fecha] && (
                <div style={{ marginTop: 6, fontSize: 12, color: C.celeste }}>
                  ✏️ Ya tenés un registro para este día — podés editarlo.
                </div>
              )}
            </div>

            {PREGUNTAS.map((p) => (
              <div key={p.id} style={cardStyle}>
                <div style={{ fontSize: 11, letterSpacing: 2, color: C.textMuted, textTransform: "uppercase", marginBottom: 6 }}>{p.label}</div>
                <div style={{ fontSize: 15, color: C.textPrimary, marginBottom: 6, lineHeight: 1.5, fontWeight: 500 }}>{p.pregunta}</div>
                <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 14, fontStyle: "italic" }}>{p.ayuda}</div>

                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  {[true, false].map(val => (
                    <button key={String(val)} onClick={() => setForm({ ...form, [p.id]: val })}
                      style={{
                        padding: "8px 32px", borderRadius: 8, border: "2px solid",
                        cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 700,
                        background: form[p.id] === val ? (val ? C.yesBg : C.noBg) : C.surfaceAlt,
                        color: form[p.id] === val ? (val ? C.yes : C.no) : C.textMuted,
                        borderColor: form[p.id] === val ? (val ? C.yes : C.no) : C.border,
                        transition: "all 0.15s",
                      }}>{val ? "SÍ" : "NO"}</button>
                  ))}
                </div>

                <textarea placeholder="Una línea explicando..." value={form[`${p.id}_nota`]}
                  onChange={e => setForm({ ...form, [`${p.id}_nota`]: e.target.value })}
                  rows={2}
                  style={{ ...inputStyle, resize: "none", lineHeight: 1.5, fontSize: 13 }} />
              </div>
            ))}

            <button onClick={handleGuardar}
              disabled={form.p1 === null || form.p2 === null || form.p3 === null}
              style={{
                width: "100%", padding: "14px", borderRadius: 10, border: "none",
                background: (form.p1 !== null && form.p2 !== null && form.p3 !== null) ? C.navy : C.surfaceAlt,
                color: (form.p1 !== null && form.p2 !== null && form.p3 !== null) ? C.white : C.textMuted,
                fontSize: 15, fontFamily: "inherit", fontWeight: 600, cursor: "pointer",
                transition: "all 0.2s", letterSpacing: 0.3,
              }}>
              {saved ? "✓ Guardado correctamente" : "Guardar registro del día"}
            </button>
          </div>
        )}

        {/* ── HISTORIAL ────────────────────────────────── */}
        {view === "historial" && (
          <div>
            {/* Consistency pill */}
            {allDays.length > 1 && (
              <div style={{ ...cardStyle, display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 11, letterSpacing: 2, color: C.textMuted, textTransform: "uppercase" }}>Consistencia</div>
                  <div style={{ fontSize: 13, color: C.textSecond, marginTop: 2 }}>{tracked.length} de {totalDays} días registrados</div>
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, color: scoreColor(consistency) }}>{consistency}%</div>
              </div>
            )}

            {allDays.length === 0 ? (
              <Empty />
            ) : (
              [...allDays].reverse().map(d => {
                const r = registros[d];
                const isMissed = !r && d !== today();
                return (
                  <div key={d} style={{
                    ...cardStyle,
                    opacity: isMissed ? 0.55 : 1,
                    borderLeft: `4px solid ${r ? dotColor(r) : C.skip}`,
                    marginBottom: 10,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: isMissed ? 0 : 10 }}>
                      <div>
                        <span style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary }}>{formatDate(d)}</span>
                        <span style={{ fontSize: 12, color: C.textMuted, marginLeft: 8 }}>{dayOfWeek(d)}</span>
                      </div>
                      {r ? (
                        <span style={{
                          fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                          background: C.celestePale, color: C.celeste
                        }}>{[r.p1,r.p2,r.p3].filter(Boolean).length}/3</span>
                      ) : (
                        <span style={{ fontSize: 12, color: C.textMuted, fontStyle: "italic" }}>sin registro</span>
                      )}
                    </div>
                    {r && PREGUNTAS.map(p => (
                      <div key={p.id} style={{ display: "flex", gap: 10, marginBottom: 6, alignItems: "flex-start" }}>
                        <span style={{
                          fontSize: 11, fontWeight: 700, minWidth: 28, paddingTop: 1,
                          color: r[p.id] ? C.yes : C.no,
                        }}>{r[p.id] ? "SÍ" : "NO"}</span>
                        <div>
                          <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 1 }}>{p.label}</div>
                          <div style={{ fontSize: 13, color: C.textSecond }}>{r[`${p.id}_nota`] || <em style={{ color: C.textMuted }}>Sin nota</em>}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── RESUMEN ──────────────────────────────────── */}
        {view === "resumen" && (
          <div>
            {tracked.length === 0 ? <Empty /> : (
              <>
                {/* Global */}
                <div style={cardStyle}>
                  <SectionLabel>Global</SectionLabel>
                  <div style={{ display: "flex", gap: 0 }}>
                    {[
                      { label: "Días registrados", val: tracked.length },
                      { label: "Consistencia",     val: consistency + "%" },
                      { label: "Días perfectos",   val: tracked.filter(d => registros[d].p1 && registros[d].p2 && registros[d].p3).length },
                      { label: "Días perdidos",    val: missed.length },
                    ].map((s, i) => (
                      <div key={s.label} style={{
                        flex: 1, textAlign: "center", padding: "0 4px",
                        borderRight: i < 3 ? `1px solid ${C.border}` : "none"
                      }}>
                        <div style={{ fontSize: 24, fontWeight: 700, color: C.navy }}>{s.val}</div>
                        <div style={{ fontSize: 11, color: C.textMuted, marginTop: 3, lineHeight: 1.3 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Por pregunta */}
                <div style={cardStyle}>
                  <SectionLabel>Por pregunta</SectionLabel>
                  {PREGUNTAS.map((p, i) => (
                    <div key={p.id} style={{ marginBottom: i < 2 ? 16 : 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 13, color: C.textSecond, fontWeight: 500 }}>{p.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: scoreColor(pctByQ[i]) }}>{pctByQ[i]}%</span>
                      </div>
                      <div style={{ height: 8, background: C.surfaceAlt, borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: pctByQ[i] + "%", background: scoreColor(pctByQ[i]), borderRadius: 4, transition: "width 0.6s ease" }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Por semana */}
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
                        {/* Day dots */}
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

                {/* Legend */}
                <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginTop: 8 }}>
                  {[
                    { color: C.perfect, label: "3/3 perfecto" },
                    { color: C.good,    label: "2/3" },
                    { color: C.mid,     label: "1/3" },
                    { color: C.bad,     label: "0/3" },
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
  background: "#ffffff",
  border: `1px solid #c5d5e8`,
  borderRadius: 12,
  padding: "18px 16px",
  marginBottom: 14,
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
