import { C, card } from "../theme";
import { nombreMes } from "../lib/periodos";

// Resumen de un cierre mensual: frase reactiva, de TENER a SER y cualidad.
export default function CierreMensual({mesKey, doc}){
  const ts = (doc.tenerASer||[]).filter(x=>x.tener||x.ser);
  return (
    <div style={{...card,marginBottom:10}}>
      <div style={{fontSize:13,fontWeight:600,color:C.navy,marginBottom:6,textTransform:"capitalize"}}>{nombreMes(mesKey)} {doc.estado==="completa"?"":<span style={{fontSize:11,color:C.warn,textTransform:"none"}}>· en curso</span>}</div>
      {doc.auditoria?.frase && <div style={{fontSize:13,color:C.textSecond}}>Frase reactiva: <strong>"{doc.auditoria.frase}"</strong>{doc.auditoria.contexto?` — ${doc.auditoria.contexto}`:""}</div>}
      {ts.map((x,k)=><div key={k} style={{fontSize:13,color:C.textSecond}}>{x.tener||"…"} → <strong>{x.ser||"…"}</strong></div>)}
      {doc.cualidad && <div style={{fontSize:13,color:C.celeste,marginTop:4}}>Cualidad para el mes siguiente: <strong>{doc.cualidad}</strong></div>}
    </div>
  );
}
