// Hábito 2 · pedidos del día y las 3 salidas.
// Modelo: manana/{fecha}.habito2 = { ensayo: string }  (descripción opcional del ensayo mental)
//         noche/{fecha}.habito2  = { pedidos: [{pedido, salida}], sinPedidos: boolean }
//         semana/{W}.habito2     = { reflexionSalidas: string }
// Los días y semanas viejos no tienen `habito2`: se leen como "sin registro" y nada se migra.
import { SALIDAS, SALIDAS_SEMANA } from "../content/contenido";
import { diasDe } from "./semanal";

export const salidaDe = (v) => SALIDAS.find(s => s.v === v) || null;

// Pedidos válidos de un registro de noche (texto + salida conocida). Tolera datos viejos o incompletos.
export function pedidosDe(r) {
  const h = r?.habito2;
  if (!h || h.sinPedidos || !Array.isArray(h.pedidos)) return [];
  return h.pedidos
    .filter(p => p && typeof p.pedido === "string" && p.pedido.trim() && salidaDe(p.salida))
    .map(p => ({ pedido: p.pedido.trim(), salida: p.salida }));
}

// Índices de las entradas del formulario con texto pero sin salida.
export function entradasSinSalida(pedidos) {
  return (pedidos || []).map((p, i) => (p.pedido?.trim() && !salidaDe(p.salida) ? i : -1)).filter(i => i >= 0);
}

// Lo que se guarda en noche/{fecha}.habito2 a partir del formulario.
// Devuelve null si no hay nada cargado (para no escribir el campo en días sin uso).
export function habito2ParaGuardar(pedidos, sinPedidos) {
  const limpios = sinPedidos ? [] : (pedidos || [])
    .filter(p => p.pedido?.trim() && salidaDe(p.salida))
    .map(p => ({ pedido: p.pedido.trim(), salida: p.salida }));
  if (!sinPedidos && !limpios.length) return null;
  return { pedidos: limpios, sinPedidos: !!sinPedidos };
}

// Resumen de la semana W (domingo a sábado).
export function salidasSemana(W, registros) {
  const dias = diasDe(W);
  const conteo = Object.fromEntries(SALIDAS.map(s => [s.v, 0]));
  const lista = [];
  let diasConPedidos = 0, diasSinPedidos = 0, diasSinRegistro = 0;
  dias.forEach(d => {
    const r = registros?.[d];
    if (!r) return; // sin check-in a la noche: no cuenta
    const ps = pedidosDe(r);
    if (ps.length) {
      diasConPedidos++;
      ps.forEach(p => { conteo[p.salida]++; lista.push({ fecha: d, ...p }); });
    } else if (r.habito2?.sinPedidos) diasSinPedidos++;
    else diasSinRegistro++;
  });
  const total = lista.length;
  const filas = SALIDAS.map(s => ({ ...s, n: conteo[s.v], pct: total ? Math.round(conteo[s.v] / total * 100) : 0 }));
  const max = Math.max(...filas.map(f => f.n));
  const predominantes = total ? filas.filter(f => f.n === max).map(f => f.v) : [];
  let mensaje = null;
  if (total === 0) mensaje = SALIDAS_SEMANA.sinRegistros;
  else if (total >= 3 && conteo.si_elegido / total >= 0.8) mensaje = SALIDAS_SEMANA.reflejoDisfrazado;
  // Días del más reciente al más viejo; dentro de cada día, en el orden en que se cargaron.
  const porFecha = [...lista].sort((a, b) => b.fecha.localeCompare(a.fecha));
  return { total, filas, predominantes, lista: porFecha, diasConPedidos, diasSinPedidos, diasSinRegistro, mensaje };
}
