// ─── Exportación a Google Drive (Fase 5, opción A: desde el navegador) ──
// Permiso: Google Identity Services con el scope drive.file (la app solo ve
// lo que ella misma creó). El permiso dura 1 h; si venció, los documentos
// quedan pendientes y "Actualizar Drive" los sube con un toque.
// Cada documento se busca por nombre en la carpeta y se regenera entero.

export const CLIENT_ID = "538081057483-6jfgttr3g8j0kf3a226656hll0a8k6a5.apps.googleusercontent.com";
const SCOPE = "https://www.googleapis.com/auth/drive.file";
export const CARPETA = "Tracker — Registros";
const KEY_TOKEN = "habito1_drive_token"; // sessionStorage: vive mientras la pestaña esté abierta

let tokenClient = null;
let token = leerToken();

function leerToken() {
  try { const t = JSON.parse(sessionStorage.getItem(KEY_TOKEN)); return t && t.expira > Date.now() ? t : null; } catch { return null; }
}
export const tokenVigente = () => !!(token && token.expira > Date.now() + 60000);

// Carga el script de Google una vez, al iniciar la app: así el botón
// "Conectar Drive" puede abrir el popup dentro del mismo toque del usuario.
export function prepararDrive() {
  if (tokenClient || document.getElementById("gis-script")) return;
  const s = document.createElement("script");
  s.id = "gis-script"; s.src = "https://accounts.google.com/gsi/client"; s.async = true;
  s.onload = () => {
    tokenClient = window.google.accounts.oauth2.initTokenClient({ client_id: CLIENT_ID, scope: SCOPE, callback: () => {} });
  };
  document.head.appendChild(s);
}

// Pide (o renueva) el permiso. Llamar directo desde un toque del usuario.
export function conectarDrive() {
  return new Promise((resolve, reject) => {
    if (!tokenClient) { reject(new Error("Google todavía no cargó. Probá de nuevo en unos segundos.")); return; }
    tokenClient.callback = (r) => {
      if (r.error) { reject(new Error(r.error)); return; }
      token = { access_token: r.access_token, expira: Date.now() + (Number(r.expires_in) || 3600) * 1000 };
      try { sessionStorage.setItem(KEY_TOKEN, JSON.stringify(token)); } catch {}
      resolve();
    };
    tokenClient.error_callback = (e) => reject(new Error(e?.type || "popup_cerrado"));
    tokenClient.requestAccessToken({ prompt: "" });
  });
}

export class PermisoVencido extends Error {}

async function api(url, opciones = {}) {
  if (!tokenVigente()) throw new PermisoVencido("Permiso de Drive vencido");
  const r = await fetch(url, { ...opciones, headers: { ...(opciones.headers || {}), Authorization: `Bearer ${token.access_token}` } });
  if (r.status === 401 || r.status === 403) { token = null; try { sessionStorage.removeItem(KEY_TOKEN); } catch {} throw new PermisoVencido(`Drive respondió ${r.status}`); }
  if (!r.ok) throw new Error(`Drive respondió ${r.status}: ${await r.text()}`);
  return r.json();
}
const comillas = (t) => t.replace(/\\/g, "\\\\").replace(/'/g, "\\'");

async function buscar(q) {
  const r = await api(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name)&spaces=drive`);
  return r.files?.[0]?.id || null;
}

let carpetaId = null;
async function carpeta() {
  if (carpetaId) return carpetaId;
  carpetaId = await buscar(`name='${comillas(CARPETA)}' and mimeType='application/vnd.google-apps.folder' and trashed=false`);
  if (!carpetaId) {
    const r = await api("https://www.googleapis.com/drive/v3/files?fields=id", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: CARPETA, mimeType: "application/vnd.google-apps.folder" }),
    });
    carpetaId = r.id;
  }
  return carpetaId;
}

// Crea o reemplaza un Google Doc a partir de HTML (Drive lo convierte).
export async function guardarDocumento(nombre, html) {
  const padre = await carpeta();
  const existente = await buscar(`name='${comillas(nombre)}' and '${padre}' in parents and trashed=false`);
  const limite = "habito1" + Math.random().toString(36).slice(2);
  const meta = existente ? { name: nombre } : { name: nombre, mimeType: "application/vnd.google-apps.document", parents: [padre] };
  const cuerpo = `--${limite}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n` +
    `--${limite}\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n${html}\r\n--${limite}--`;
  const url = existente
    ? `https://www.googleapis.com/upload/drive/v3/files/${existente}?uploadType=multipart&fields=id`
    : "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id";
  return api(url, { method: existente ? "PATCH" : "POST", headers: { "Content-Type": `multipart/related; boundary=${limite}` }, body: cuerpo });
}
