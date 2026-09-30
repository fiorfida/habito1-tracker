import { db } from "../firebase";
import { doc, setDoc, collection, getDocs } from "firebase/firestore";
import { todayBsAs } from "./fechas";

// ─── Storage keys (copia local) ────────────────────────────────────────
export const KEY_NOCHE      = "habito1_registros";
export const KEY_MANANA     = "habito1_manana";
export const KEY_SEMANA     = "habito1_semana";
export const KEY_TRIMESTRE  = "habito1_trimestre";
export const KEY_ANUAL      = "habito1_anual";
export const KEY_PENDIENTES = "habito1_pendientes_sync";

export const COLECCIONES = ["noche", "manana", "semana", "trimestre", "anual", "config", "plan", "pendientes"];

// ─── Firestore ─────────────────────────────────────────────────────────
// Devuelve null si falla (el llamador decide cómo avisar).
export async function fbGet(uid, colName) {
  try {
    const snap = await getDocs(collection(db, "users", uid, colName));
    const result = {};
    snap.forEach(d => { result[d.id] = d.data(); });
    return result;
  } catch(e) { console.error("fbGet error:", colName, e); return null; }
}
// Lanza si falla. merge:true evita que una versión vieja de la app borre campos nuevos.
// Sin conexión Firestore no rechaza: queda esperando. Pasados TIMEOUT_MS se
// informa como pendiente (reintentar es seguro: la escritura es idempotente).
const TIMEOUT_MS = 10000;
export async function fbSet(uid, colName, docId, data) {
  let timer;
  const limite = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error("Sin confirmación del servidor")), TIMEOUT_MS);
  });
  try {
    await Promise.race([setDoc(doc(db, "users", uid, colName, docId), data, { merge: true }), limite]);
  } finally { clearTimeout(timer); }
}
// ─── Cola de guardados pendientes (sobrevive recargas) ─────────────────
export function leerPendientes() {
  try { return JSON.parse(localStorage.getItem(KEY_PENDIENTES)) || []; } catch { return []; }
}
export function escribirPendientes(lista) {
  try { localStorage.setItem(KEY_PENDIENTES, JSON.stringify(lista)); } catch {}
}

// ─── Ids para documentos nuevos (pendientes, ítems del plan) ──────────
export function nuevoId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ─── Backup completo en JSON, leído directo de Firestore ───────────────
export async function descargarBackup(uid) {
  const datos = {};
  for (const col of COLECCIONES) {
    const r = await fbGet(uid, col);
    if (r === null) throw new Error(`No se pudo leer la colección "${col}"`);
    datos[col] = r;
  }
  const backup = { app:"habito1-tracker", exportado:new Date().toISOString(), colecciones:datos };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type:"application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `habito1-backup-${todayBsAs()}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}
