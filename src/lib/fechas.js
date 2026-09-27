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
export function trimestralStatus(ds){
  const [yStr,mStr,dStr] = ds.split("-");
  const y=parseInt(yStr,10), m=parseInt(mStr,10), day=parseInt(dStr,10);
  const candidatos = [{quarter:1,y,m:4},{quarter:2,y,m:7},{quarter:3,y,m:10}];
  let relevante = null;
  candidatos.forEach(c=>{
    const inicio = `${c.y}-${String(c.m).padStart(2,"0")}-01`;
    if (ds>=inicio) relevante = c;
  });
  if (!relevante) relevante = {quarter:3,y:y-1,m:10};
  const ventanaAbierta = (m===relevante.m && y===relevante.y && day<=7);
  return { key:`${relevante.y}-Q${relevante.quarter}`, quarter:relevante.quarter, quarterYear:relevante.y, ventanaAbierta };
}
export function anualStatus(ds){
  const [yStr,mStr,dStr] = ds.split("-");
  const y=parseInt(yStr,10), m=parseInt(mStr,10), day=parseInt(dStr,10);
  const reviewedYear = y-1;
  const ventanaAbierta = (m===1 && day<=7);
  return { key:String(reviewedYear), reviewedYear, ventanaAbierta };
}
