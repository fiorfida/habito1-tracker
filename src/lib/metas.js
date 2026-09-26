import { ROLES } from "../content/contenido";

export function emptyMetas() {
  const m = {};
  ROLES.forEach(r => { m[r.num] = ["", "", ""]; });
  return m;
}
export function mergeMetas(saved) {
  const base = emptyMetas();
  if (!saved) return base;
  ROLES.forEach(r => {
    const arr = saved[r.num];
    if (Array.isArray(arr)) base[r.num] = [arr[0]??"", arr[1]??"", arr[2]??""];
  });
  return base;
}
export function metasActivas(metas) {
  if (!metas) return [];
  return ROLES.filter(r => (metas[r.num]||[]).some(v => v && v.trim()));
}
