import { FRASES } from "../content/contenido";
import { todayBsAs } from "./fechas";

export function fraseDelDia(){
  const epoca = new Date("2026-01-01T12:00:00");
  const hoy   = new Date(todayBsAs()+"T12:00:00");
  const dias  = Math.round((hoy-epoca)/86400000);
  const idx   = ((dias%FRASES.length)+FRASES.length)%FRASES.length;
  return FRASES[idx];
}
