import { pedidosDe, entradasSinSalida, habito2ParaGuardar, salidasSemana } from "./habito2";
import { SALIDAS_SEMANA } from "../content/contenido";

const W = "2026-11-08"; // domingo
const noche = (habito2) => ({ p1: true, p2: true, p3: true, p4: true, ...(habito2 ? { habito2 } : {}) });
const ped = (pedido, salida) => ({ pedido, salida });

test("pedidosDe tolera días viejos y datos incompletos", () => {
  expect(pedidosDe(undefined)).toEqual([]);
  expect(pedidosDe(noche())).toEqual([]);
  expect(pedidosDe(noche({ pedidos: "x" }))).toEqual([]);
  expect(pedidosDe(noche({ pedidos: [ped(" a ", "si_pero"), ped("", "no_amable"), ped("b", "otra")] }))).toEqual([ped("a", "si_pero")]);
  expect(pedidosDe(noche({ pedidos: [ped("a", "si_pero")], sinPedidos: true }))).toEqual([]);
});

test("entradasSinSalida marca las que tienen texto y no salida", () => {
  expect(entradasSinSalida([ped("a", null), ped("", null), ped("c", "no_amable"), ped("d", "")])).toEqual([0, 3]);
});

test("habito2ParaGuardar", () => {
  expect(habito2ParaGuardar([ped("", null)], false)).toBeNull();
  expect(habito2ParaGuardar([ped("a", "si_elegido"), ped(" ", "no_amable")], false)).toEqual({ pedidos: [ped("a", "si_elegido")], sinPedidos: false });
  expect(habito2ParaGuardar([ped("a", "si_elegido")], true)).toEqual({ pedidos: [], sinPedidos: true });
});

test("salidasSemana: conteos, %, días y predominante", () => {
  const registros = {
    "2026-11-08": noche({ pedidos: [ped("a", "si_elegido"), ped("b", "no_amable")], sinPedidos: false }),
    "2026-11-09": noche({ pedidos: [], sinPedidos: true }),
    "2026-11-10": noche(), // día sin habito2
    "2026-11-11": noche({ pedidos: [ped("c", "no_amable")], sinPedidos: false }),
    "2026-11-15": noche({ pedidos: [ped("fuera", "si_pero")], sinPedidos: false }), // otra semana
  };
  const s = salidasSemana(W, registros);
  expect(s.total).toBe(3);
  expect(s.filas.map(f => [f.v, f.n, f.pct])).toEqual([["si_elegido", 1, 33], ["si_pero", 0, 0], ["no_amable", 2, 67]]);
  expect(s.predominantes).toEqual(["no_amable"]);
  expect([s.diasConPedidos, s.diasSinPedidos, s.diasSinRegistro]).toEqual([2, 1, 1]);
  expect(s.lista.map(x => x.pedido)).toEqual(["c", "a", "b"]); // días recientes primero, orden de carga dentro del día
  expect(s.mensaje).toBeNull();
});

test("salidasSemana: mensajes de reflexión", () => {
  expect(salidasSemana(W, {}).mensaje).toBe(SALIDAS_SEMANA.sinRegistros);
  const casiTodoSi = { "2026-11-08": noche({ pedidos: [ped("a", "si_elegido"), ped("b", "si_elegido"), ped("c", "si_elegido"), ped("d", "si_elegido"), ped("e", "si_pero")] }) };
  expect(salidasSemana(W, casiTodoSi).mensaje).toBe(SALIDAS_SEMANA.reflejoDisfrazado); // 4/5 = 80%
  const pocos = { "2026-11-08": noche({ pedidos: [ped("a", "si_elegido"), ped("b", "si_elegido")] }) };
  expect(salidasSemana(W, pocos).mensaje).toBeNull(); // menos de 3 pedidos
  const empate = { "2026-11-08": noche({ pedidos: [ped("a", "si_elegido"), ped("b", "no_amable")] }) };
  expect(salidasSemana(W, empate).predominantes).toEqual(["si_elegido", "no_amable"]);
});
