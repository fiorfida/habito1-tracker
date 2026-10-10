import { C, card, dotColor } from "../theme";
import { PREGUNTAS_H1, PREGUNTA_H2 } from "../content/contenido";
import { formatDate, dayOfWeek, NOCHE_DESDE } from "../lib/fechas";

// Un día: Noche (4 preguntas) y Mañana (tarea clave, compromiso, anticipación) con sus resultados.
export default function DiaCard({d, r, m, today, nocheDisp}){
  const mHecha=!!(m?.visto);
  const isMissed=!r&&d!==today;
  const h1Score=r?[r.p1,r.p2,r.p3].filter(Boolean).length:0;
  return (
            <div style={{...card,opacity:isMissed?0.55:1,borderLeft:`4px solid ${r?dotColor(r):C.skip}`,marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:isMissed?0:10}}>
                <div>
                  <span style={{fontSize:14,fontWeight:600,color:C.textPrimary}}>{formatDate(d)}</span>
                  <span style={{fontSize:12,color:C.textMuted,marginLeft:8}}>{dayOfWeek(d)}</span>
                </div>
                <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap",justifyContent:"flex-end"}}>
                  {mHecha&&<span style={{fontSize:12,fontWeight:700,padding:"3px 10px",borderRadius:20,background:C.yesBg,color:C.yes}}>☀ Mañana</span>}
                  {r?(
                    <>
                      <span style={{fontSize:12,fontWeight:700,padding:"3px 10px",borderRadius:20,background:C.celestePale,color:C.celeste}}>H1: {h1Score}/3</span>
                      {r.p4!==undefined&&<span style={{fontSize:12,fontWeight:700,padding:"3px 10px",borderRadius:20,background:r.p4?C.yesBg:C.noBg,color:r.p4?C.yes:C.no}}>H2: {r.p4?"SÍ":"NO"}</span>}
                    </>
                  ):<span style={{fontSize:12,color:C.textMuted,fontStyle:"italic"}}>{d!==today?"sin registro noche":nocheDisp?"Noche pendiente":`Noche disponible desde las ${NOCHE_DESDE}:00`}</span>}
                </div>
              </div>
              {r&&(
                <>
                  {PREGUNTAS_H1.map(p=>(
                    <div key={p.id} style={{display:"flex",gap:10,marginBottom:6,alignItems:"flex-start"}}>
                      <span style={{fontSize:11,fontWeight:700,minWidth:28,paddingTop:1,color:r[p.id]?C.yes:C.no}}>{r[p.id]?"SÍ":"NO"}</span>
                      <div>
                        <div style={{fontSize:11,color:C.textMuted,marginBottom:1}}>{p.label}</div>
                        <div style={{fontSize:13,color:C.textSecond}}>{r[`${p.id}_nota`]||<em style={{color:C.textMuted}}>Sin nota</em>}</div>
                      </div>
                    </div>
                  ))}
                  {r.p4!==undefined&&(
                    <div style={{display:"flex",gap:10,alignItems:"flex-start",marginTop:4,paddingTop:8,borderTop:`1px solid ${C.border}`}}>
                      <span style={{fontSize:11,fontWeight:700,minWidth:28,paddingTop:1,color:r.p4?C.yes:C.no}}>{r.p4?"SÍ":"NO"}</span>
                      <div>
                        <div style={{fontSize:11,color:C.celeste,marginBottom:1}}>{PREGUNTA_H2.label}</div>
                        <div style={{fontSize:13,color:C.textSecond}}>{r.p4_nota||<em style={{color:C.textMuted}}>Sin nota</em>}</div>
                      </div>
                    </div>
                  )}
                </>
              )}
              <DiaExtra m={m} r={r}/>
            </div>
  );
}
// Fase 3: compromiso y tarea clave de la mañana con su resultado de la noche, y conflicto.
const RESULTADO = { si:{t:"Sí",c:C.yes}, parcial:{t:"Parcial",c:C.warn}, no:{t:"No",c:C.no} };
function DiaExtra({m, r}){
  const situaciones = (m?.situaciones||[]).filter(s=>s.situacion);
  const filas = [
    m?.misionOk!=null && {k:"Mañana · misión y visión", v:`Misión: ${m.misionOk?"Sí":"No"}${m.misionAjuste?` (${m.misionAjuste})`:""} · Visión: ${m.visionOk==null?"—":m.visionOk?"Sí":"No"}${m.visionAjuste?` (${m.visionAjuste})`:""}`},
    m?.tareaClave?.texto && {k:"★ Tarea clave", v:m.tareaClave.texto, res:r?.tareaClaveHecha},
    m?.compromiso && {k:"Compromiso", v:m.compromiso, res:r?.compromisoCumplido},
    situaciones.length>0 && {k:"Anticipación", v:situaciones.map(s=>`${s.situacion} → ${s.respuesta||"…"}`).join(" · ")},
    r?.conflicto && r.conflicto_nota && {k:"Conflicto · qué pude hacer diferente", v:r.conflicto_nota},
  ].filter(Boolean);
  if (!filas.length) return null;
  return (
    <div style={{marginTop:8,paddingTop:8,borderTop:`1px solid ${C.border}`}}>
      {filas.map(f=>(
        <div key={f.k} style={{display:"flex",justifyContent:"space-between",gap:10,marginBottom:6}}>
          <div>
            <div style={{fontSize:11,color:C.textMuted,marginBottom:1}}>{f.k}</div>
            <div style={{fontSize:13,color:C.textSecond}}>{f.v}</div>
          </div>
          {f.res && <span style={{fontSize:11,fontWeight:700,color:RESULTADO[f.res].c,flexShrink:0}}>{RESULTADO[f.res].t}</span>}
        </div>
      ))}
    </div>
  );
}
