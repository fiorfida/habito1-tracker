import { C, card, scoreColor, dotColor } from "../theme";
import { useState } from "react";
import { SLabel, Empty } from "../components/ui";
import SemanaResumen from "../components/SemanaResumen";
import { PREGUNTAS_H1, PREGUNTA_H2 } from "../content/contenido";
import { formatDate, dayOfWeek, addDays, NOCHE_DESDE } from "../lib/fechas";

export default function Historial({stats, registros, mananaLog, semanaLog, planLog, today, nocheDisp}){
  const { allDays, tracked, totalNoche, totalManana, mananasHechas, consistency } = stats;
  const [verTodas, setVerTodas] = useState(false);
  const semanas = Object.keys(semanaLog).sort((a,b)=>b.localeCompare(a));
  return (
    <div>
      {allDays.length>1 && (
        <div style={{...card,display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
          <div>
            <div style={{fontSize:11,letterSpacing:2,color:C.textMuted,textTransform:"uppercase"}}>Consistencia</div>
            <div style={{fontSize:13,color:C.textSecond,marginTop:2}}>{tracked.length} de {totalNoche} días registrados</div>
            <div style={{fontSize:13,color:C.textSecond,marginTop:2}}>{mananasHechas} de {totalManana} mañanas completadas</div>
          </div>
          <div style={{fontSize:28,fontWeight:700,color:scoreColor(consistency)}}>{consistency}%</div>
        </div>
      )}
      {semanas.length>0 && (
        <div style={{marginBottom:20}}>
          <SLabel>Revisiones semanales</SLabel>
          {(verTodas?semanas:semanas.slice(0,1)).map(wk=><SemanaResumen key={wk} W={wk} doc={semanaLog[wk]} plan={planLog[addDays(wk,7)]}/>)}
          {semanas.length>1 && <button onClick={()=>setVerTodas(!verTodas)} style={{background:"none",border:"none",color:C.celeste,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",padding:0}}>{verTodas?"Ver solo la última":`Ver las ${semanas.length} revisiones`}</button>}
        </div>
      )}
      {allDays.length===0?<Empty/>:(
        <div className="historial-grid">
        {[...allDays].reverse().map(d=>{
          const r=registros[d];
          const mHecha=!!(mananaLog[d]?.visto);
          const isMissed=!r&&d!==today;
          const h1Score=r?[r.p1,r.p2,r.p3].filter(Boolean).length:0;
          return (
            <div key={d} style={{...card,opacity:isMissed?0.55:1,borderLeft:`4px solid ${r?dotColor(r):C.skip}`,marginBottom:10}}>
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
            </div>
          );
        })}
        </div>
      )}
    </div>
  );
}
