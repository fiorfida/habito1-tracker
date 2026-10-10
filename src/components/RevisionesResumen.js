import { C, card } from "../theme";
import { nombreRol } from "../content/contenido";
import { nombreTrimestre, trimestreSiguiente } from "../lib/periodos";

const etiqueta = { fontSize:11, color:C.celeste, textTransform:"uppercase", letterSpacing:1, margin:"8px 0 3px" };
const texto = { fontSize:13, color:C.textSecond, lineHeight:1.5, whiteSpace:"pre-line" };
const RES = { si:"Cumplí", parcial:"A medias", no:"No cumplí" };

// Resumen de una revisión trimestral: objetivos con su resultado, impresiones y próximos pasos.
export function ResumenTrimestral({K, doc, plan, planSiguiente}){
  const objs = (plan?.objetivos||[]).filter(o=>o.texto && doc.objetivos?.[o.id]?.estado);
  const sig = (planSiguiente?.objetivos||[]).filter(o=>o.texto);
  return (
    <div style={{...card,marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",gap:8,flexWrap:"wrap"}}>
        <span style={{fontSize:13,fontWeight:600,color:C.navy}}>Revisión {nombreTrimestre(K)}</span>
        <span style={{fontSize:11,color:doc.estado==="completa"?C.yes:C.warn}}>{doc.estado==="completa"?"✓ Completa":"En curso"}</span>
      </div>
      {objs.length>0 && <><div style={etiqueta}>Objetivos del trimestre</div>
        {objs.map(o=><div key={o.id} style={texto}>{RES[doc.objetivos[o.id].estado]} · {o.texto} <span style={{color:C.textMuted}}>({nombreRol(o.rol)})</span>{doc.objetivos[o.id].porque?` — ${doc.objetivos[o.id].porque}`:""}</div>)}</>}
      {doc.sinPlanNota && <><div style={etiqueta}>Objetivos del trimestre</div><div style={texto}>{doc.sinPlanNota}</div></>}
      {doc.impresiones && <><div style={etiqueta}>Impresiones</div><div style={texto}>{doc.impresiones}</div></>}
      {doc.salida?.proximosPasos && <><div style={etiqueta}>Próximos pasos</div><div style={texto}>{doc.salida.proximosPasos}</div></>}
      {sig.length>0 && <><div style={etiqueta}>Plan {nombreTrimestre(trimestreSiguiente(K))}</div>
        <div style={texto}>{sig.map(o=>`${o.texto} (${nombreRol(o.rol)})`).join(" · ")}</div></>}
    </div>
  );
}

// Resumen de una revisión anual: titular, lecciones y avance por partes.
export function ResumenAnual({Y, doc}){
  const p = doc.partes || {};
  const completas = [1,2,3,4,5].filter(n=>p[n]?.estado==="completa").length;
  const lecciones = (p[1]?.lecciones||[]).filter(Boolean);
  return (
    <div style={{...card,marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",gap:8,flexWrap:"wrap"}}>
        <span style={{fontSize:13,fontWeight:600,color:C.navy}}>Revisión anual {Y}</span>
        <span style={{fontSize:11,color:completas===5?C.yes:C.warn}}>{completas} de 5 partes</span>
      </div>
      {p[1]?.titular && <div style={{fontSize:15,fontFamily:"'Playfair Display',serif",color:C.navy,marginTop:6}}>"{p[1].titular}"</div>}
      {lecciones.length>0 && <><div style={etiqueta}>Lecciones</div>{lecciones.map((l,k)=><div key={k} style={texto}>{k+1}. {l}</div>)}</>}
      {p[5]?.relato && <><div style={etiqueta}>Un día a fin de {Y+1}</div><div style={texto}>{p[5].relato}</div></>}
    </div>
  );
}
