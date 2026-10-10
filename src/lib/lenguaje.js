// ─── Auditoría de lenguaje (Hábito 1): frases reactivas en las notas ──
// Lista base del lenguaje reactivo de Covey + las que sume el usuario (config/lenguaje).
export const FRASES_REACTIVAS = [
  "no puedo", "tengo que", "debo", "yo soy así", "me vuelve loco",
  "si tan solo", "no lo permitirán", "me hizo", "no tengo tiempo",
];

const ESPECIALES = new Set([..."\\^$.*+?()[]{}|"]);
const escaparRegex = (t) => [...t].map(c => ESPECIALES.has(c) ? "\\" + c : c).join("");
const normalizar = (t) => (t || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

// Notas de la Noche (y del conflicto) de un rango, con su fecha.
export function notasDelRango(dias, registros) {
  return dias.flatMap(d => {
    const r = registros[d]; if (!r) return [];
    return ["p1_nota", "p2_nota", "p3_nota", "p4_nota", "conflicto_nota"].map(c => ({ fecha: d, texto: r[c] || "" })).filter(n => n.texto.trim());
  });
}

// Cuenta cada frase (sin distinguir mayúsculas ni tildes) y guarda dónde aparece.
export function auditarLenguaje(notas, frases) {
  return frases.map(frase => {
    const f = normalizar(frase);
    const re = new RegExp(`(^|[^a-z])${escaparRegex(f)}(?=[^a-z]|$)`, "g");
    const ocurrencias = [];
    notas.forEach(n => {
      const t = normalizar(n.texto); let m;
      while ((m = re.exec(t))) {
        const i = m.index + m[1].length;
        ocurrencias.push({ fecha: n.fecha, fragmento: n.texto.slice(Math.max(0, i - 40), i + f.length + 40).trim() });
      }
    });
    ocurrencias.sort((a, b) => b.fecha.localeCompare(a.fecha)); // más reciente primero
    return { frase, cantidad: ocurrencias.length, ocurrencias };
  }).filter(x => x.cantidad > 0).sort((a, b) => b.cantidad - a.cantidad);
}
