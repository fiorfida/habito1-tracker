// ─── Fechas ────────────────────────────────────────────────────────────
// Almacenamiento: siempre "AAAA-MM-DD" (hora de Buenos Aires).
// Presentación: siempre dd/mm/yyyy vía formatDate.
export const TZ = "America/Argentina/Buenos_Aires";

export function todayBsAs() {
  return new Date().toLocaleDateString("en-CA", { timeZone: TZ });
}
// Hora actual en Buenos Aires (0-23).
export function horaBsAs() {
  return parseInt(new Date().toLocaleString("en-US", { timeZone: TZ, hour: "numeric", hourCycle: "h23" }), 10);
}
// El check-in nocturno de hoy se habilita a esta hora; los días anteriores siempre.
export const NOCHE_DESDE = 19;
export function nocheDisponible(ds) {
  return ds < todayBsAs() || horaBsAs() >= NOCHE_DESDE;
}
export function formatDate(ds) {
  const [y,m,d] = ds.split("-"); return `${d}/${m}/${y}`;
}
export function dayOfWeek(ds) {
  const days = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
  return days[new Date(ds+"T12:00:00").getDay()];
}
export function addDays(ds,n) {
  const d = new Date(ds+"T12:00:00"); d.setDate(d.getDate()+n);
  return d.toISOString().slice(0,10);
}
export function getWeekStart(ds) {
  const d = new Date(ds+"T12:00:00");
  d.setDate(d.getDate()-d.getDay());
  return d.toISOString().slice(0,10);
}
// Domingo de la semana (dom-sáb) que cierra el sábado más reciente.
export function relevantWeekStart(ds) {
  const dow  = new Date(ds+"T12:00:00").getDay();
  const diff = (dow-6+7)%7;
  return getWeekStart(addDays(ds,-diff));
}
export function dateRange(from,to) {
  const dates=[]; let cur=from;
  while(cur<=to){dates.push(cur);cur=addDays(cur,1);}
  return dates;
}
