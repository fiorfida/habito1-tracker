// "Mi fin para hoy" (Hábito 2: empezar con un fin en mente).
// Modelo: manana/{fecha}.fin = {rol, principio} (rol = num, como en el resto de los registros)
//         manana/{fecha}.tareaClave = {id, texto}  → la tarea del fin (se mantiene el campo de siempre)
//         noche/{fecha}.fin = {cumplido: "si" | "parcial" | "no"}
// Los días viejos no tienen `fin`: se leen como "no definido" y nada se migra.
import { nombreRol, ROLES_TODOS } from "../content/contenido";
import { addDays } from "./fechas";

export const FIN_CUMPLIDO = [
  { v: "si", t: "Sí" }, { v: "parcial", t: "A medias" }, { v: "no", t: "No" },
];
export const textoCumplido = (v) => FIN_CUMPLIDO.find(o => o.v === v)?.t || "—";

// El fin está definido solo si están los tres: rol, principio y tarea.
export function finDefinido(m) {
  return !!(m?.fin?.rol && m?.fin?.principio && m?.tareaClave?.texto);
}

// Partes de la frase; lo que falte se muestra como "—".
export function partesFin(m) {
  return {
    rol: m?.fin?.rol ? nombreRol(m.fin.rol) : "—",
    principio: m?.fin?.principio || "—",
    tarea: m?.tareaClave?.texto || "—",
  };
}
export function fraseFin(m) {
  const p = partesFin(m);
  return `Hoy priorizo ${p.rol}, guiado por ${p.principio}: ${p.tarea}.`;
}

// Roles priorizados en los últimos `n` días (hasta hoy inclusive):
// días con el rol elegido y % de esos días con fin cumplido = "si".
export function rolesPriorizados(mananaLog, registros, today, n = 30) {
  const desde = addDays(today, -(n - 1));
  const por = {};
  Object.entries(mananaLog || {}).forEach(([f, m]) => {
    if (f < desde || f > today || !finDefinido(m)) return;
    const x = por[m.fin.rol] || (por[m.fin.rol] = { dias: 0, si: 0 });
    x.dias++;
    if (registros?.[f]?.fin?.cumplido === "si") x.si++;
  });
  const total = Object.values(por).reduce((a, x) => a + x.dias, 0);
  const orden = (num) => { const i = ROLES_TODOS.findIndex(r => r.num === num); return i < 0 ? 99 : i; };
  return {
    total,
    filas: Object.entries(por)
      .map(([num, x]) => ({ num, nombre: nombreRol(num), dias: x.dias, si: x.si, pctSi: Math.round(x.si / x.dias * 100) }))
      .sort((a, b) => b.dias - a.dias || orden(a.num) - orden(b.num)),
  };
}
