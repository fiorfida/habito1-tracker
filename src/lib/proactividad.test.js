import { clasificarDia, analizarPeriodo, rangoPeriodo, exportarMarkdown } from "./proactividad";
import { HABITOS_SEGUIDOS } from "./habitos";
import { todayBsAs } from "./fechas";

const reg = (p1, p2, p3, compromisoCumplido) => ({ p1, p2, p3, compromisoCumplido });

describe("clasificarDia", () => {
  test("sin registro → sin_registro", () => {
    expect(clasificarDia(undefined)).toBe("sin_registro");
    expect(clasificarDia(null)).toBe("sin_registro");
  });
  test("hoy sin registro → pendiente", () => {
    expect(clasificarDia(undefined, { esHoy: true })).toBe("pendiente");
  });
  test("hoy con registro se clasifica normal", () => {
    expect(clasificarDia(reg(true, true, true, "si"), { esHoy: true })).toBe("bueno");
  });
  test("4 señales en Sí → bueno", () => {
    expect(clasificarDia(reg(true, true, true, "si"))).toBe("bueno");
  });
  test("compromiso Parcial nunca es bueno, puede ser medio", () => {
    expect(clasificarDia(reg(true, true, true, "parcial"))).toBe("medio");
  });
  test("Respuesta + Lenguaje en Sí con Foco o Compromiso en No/vacío → medio", () => {
    expect(clasificarDia(reg(false, true, true, "si"))).toBe("medio");
    expect(clasificarDia(reg(true, true, true, "no"))).toBe("medio");
    expect(clasificarDia(reg(true, true, true, null))).toBe("medio");
    expect(clasificarDia(reg(false, true, true, "no"))).toBe("medio");
  });
  test("resto → malo", () => {
    expect(clasificarDia(reg(true, false, true, "si"))).toBe("malo");
    expect(clasificarDia(reg(true, true, false, "si"))).toBe("malo");
    expect(clasificarDia(reg(false, false, false, "no"))).toBe("malo");
  });
  test("registro incompleto nunca es bueno", () => {
    expect(clasificarDia({ p1: true, p2: true, p3: true })).toBe("medio");     // sin compromiso (registro viejo)
    expect(clasificarDia({ p2: true, p3: true, compromisoCumplido: "si" })).toBe("medio"); // sin foco
    expect(clasificarDia({ p1: true, p3: true, compromisoCumplido: "si" })).toBe("malo");  // sin lenguaje
    expect(clasificarDia({ p1: true })).toBe("malo");
    expect(clasificarDia({})).toBe("malo");
  });
});

describe("hábito Ser proactivo", () => {
  const h = HABITOS_SEGUIDOS.find(x => x.id === "proactivo");
  test("se cumple solo con día bueno", () => {
    const registros = { a: reg(true, true, true, "si"), b: reg(true, true, true, "parcial"), c: reg(true, true, true, null) };
    expect(h.cumple("a", { registros })).toBe(true);
    expect(h.cumple("b", { registros })).toBe(false);
    expect(h.cumple("c", { registros })).toBe(false);
    expect(h.cumple("z", { registros })).toBe(false);
  });
});

describe("zona horaria", () => {
  afterEach(() => jest.useRealTimers());
  test("el día se calcula en Buenos Aires (UTC-3)", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-11-15T01:30:00Z")); // 14/11 22:30 en BsAs
    expect(todayBsAs()).toBe("2026-11-14");
    jest.setSystemTime(new Date("2026-11-15T03:30:00Z")); // 15/11 00:30 en BsAs
    expect(todayBsAs()).toBe("2026-11-15");
  });
});

describe("rangoPeriodo", () => {
  test("últimos 30 días incluye hoy", () => {
    expect(rangoPeriodo("30", "2026-11-14")).toEqual({ desde: "2026-10-16", hasta: "2026-11-14" });
  });
  test("trimestre actual calendario", () => {
    expect(rangoPeriodo("trimestre", "2026-11-14")).toEqual({ desde: "2026-10-01", hasta: "2026-11-14" });
  });
  test("personalizado: ordena y recorta a hoy", () => {
    expect(rangoPeriodo("custom", "2026-11-14", "2026-12-01", "2026-11-01")).toEqual({ desde: "2026-11-01", hasta: "2026-11-14" });
  });
});

describe("analizarPeriodo", () => {
  // Semana dom 01/11 – sáb 07/11 + dom 08/11; hoy = 08/11 sin registro (pendiente).
  const registros = {
    "2026-11-01": reg(true, true, true, "si"),     // bueno
    "2026-11-02": reg(true, true, true, "si"),     // bueno
    "2026-11-03": reg(false, true, true, "si"),    // medio
    // 04/11 sin registro
    "2026-11-05": reg(true, true, true, "si"),     // bueno
    "2026-11-06": reg(true, true, true, "si"),     // bueno
    "2026-11-07": reg(false, false, true, "parcial"), // malo
  };
  const a = analizarPeriodo("2026-11-01", "2026-11-08", "2026-11-08", registros);

  test("hoy pendiente no cuenta", () => {
    expect(a.pendiente).toBe(true);
    expect(a.totalDias).toBe(7);
    expect(a.dist).toEqual({ bueno: 4, medio: 1, malo: 1, sin_registro: 1 });
  });
  test("porcentajes", () => {
    expect(a.conRegistro).toBe(6);
    expect(a.pctRegistro).toBe(86);
    expect(a.pctBuenos).toBe(67);
  });
  test("rachas", () => {
    expect(a.rachaBuenos).toBe(0);       // último día contable (07/11) es malo
    expect(a.mejorRachaBuenos).toBe(2);
    expect(a.rachaRegistro).toBe(3);     // 05, 06, 07
  });
  test("señales ordenadas de menor a mayor, con Parcial aparte", () => {
    const comp = a.senales.find(s => s.id === "compromiso");
    expect(comp).toMatchObject({ respondidas: 6, si: 5, parcial: 1, pct: 83 });
    expect(a.senalesOrdenadas.map(s => s.id)).toEqual(["p1", "p2", "compromiso", "p3"]);
  });
  test("semanas dom-sáb", () => {
    expect(a.semanas[0]).toMatchObject({ semana: "2026-11-01", dias: 7, registrados: 6, buenos: 4, pctBuenos: 67, pctRegistro: 86 });
    expect(a.semanas).toHaveLength(1); // 08/11 está pendiente y no forma semana
  });
  test("por día de la semana", () => {
    expect(a.porDiaSemana[0]).toMatchObject({ dow: 0, pct: 100 }); // domingo 01/11
    expect(a.porDiaSemana[3]).toMatchObject({ dow: 3, pct: null }); // miércoles sin registro
  });

  test("export Markdown", () => {
    const md = exportarMarkdown(a, registros, { "2026-11-01": { compromiso: "Llamar a mamá" } });
    expect(md).toContain("Período: 01/11/2026 – 08/11/2026");
    expect(md).toContain("- Días del período: 7 | Con registro: 6 (86%)");
    expect(md).toContain("- Bueno: 4 | Medio: 1 | Malo: 1 | Sin registro: 1");
    expect(md).toContain("Compromiso 83% (Parcial: 1)");
    expect(md).toContain("- Por día de la semana (% días buenos): Dom 100% | Lun 100% | Mar 0% | Mié — |");
    expect(md).toContain("### 01/11/2026 (Domingo) — BUENO");
    expect(md).toContain('- Compromiso: "Llamar a mamá" → Sí');
    expect(md).toContain("- Compromiso: (sin compromiso cargado) → Parcial");
    expect(md).toContain("Sin registro: 04/11");
    expect(md).toContain("Pendiente (hoy): 08/11");
    expect(md.indexOf("01/11/2026 (Domingo)")).toBeLessThan(md.indexOf("07/11/2026 (Sábado)"));
  });
});
