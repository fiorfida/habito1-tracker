import { C, card, scoreColor, dotColor } from "../theme";
import { SLabel, Empty } from "../components/ui";
import { PREGUNTAS_H1, PREGUNTA_H2 } from "../content/contenido";
import { formatDate, dayOfWeek, getWeekStart } from "../lib/fechas";

export default function Resumen({stats, registros, semanaLog, trimestreLog, anualLog, today}){
  const { allDays, tracked, missed, mananasHechas, consistency } = stats;

  const weekGroups = {};
  allDays.forEach(d => {
    const wk = getWeekStart(d);
    if(!weekGroups[wk]) weekGroups[wk]=[];
    weekGroups[wk].push(d);
  });
  const weekKeys = Object.keys(weekGroups).sort((a,b)=>b.localeCompare(a));

  const weekScore = (days) => {
    const regs = days.map(d=>registros[d]).filter(Boolean);
    if(!regs.length) return null;
    const yes = regs.reduce((a,r)=>a+(r.p1?1:0)+(r.p2?1:0)+(r.p3?1:0)+(r.p4?1:0),0);
    return Math.round((yes/(regs.length*4))*100);
  };

  const pctByQ = [...PREGUNTAS_H1, PREGUNTA_H2].map(p => {
    if(!tracked.length) return 0;
    const yes = tracked.filter(d=>registros[d][p.id]).length;
    return Math.round((yes/tracked.length)*100);
  });

  if (tracked.length===0&&mananasHechas===0) return <div><Empty/></div>;

  return (
    <div>
      <div className="grid-2">
        <div style={card}>
          <SLabel>Global</SLabel>
          <div style={{display:"flex",gap:0,flexWrap:"wrap"}}>
            {[
              {label:"Días registrados",val:tracked.length},
              {label:"Mañanas completadas",val:mananasHechas},
              {label:"Consistencia",    val:consistency+"%"},
              {label:"Días perfectos",  val:tracked.filter(d=>registros[d].p1&&registros[d].p2&&registros[d].p3&&registros[d].p4).length},
              {label:"Días perdidos",   val:missed.length},
            ].map((s,i,arr)=>(
              <div key={s.label} style={{flex:1,textAlign:"center",padding:"0 4px",borderRight:i<arr.length-1?`1px solid ${C.border}`:"none"}}>
                <div style={{fontSize:24,fontWeight:700,color:C.navy}}>{s.val}</div>
                <div style={{fontSize:11,color:C.textMuted,marginTop:3,lineHeight:1.3}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={card}>
          <SLabel>Por pregunta</SLabel>
          {[...PREGUNTAS_H1,PREGUNTA_H2].map((p,i)=>(
            <div key={p.id} style={{marginBottom:i<3?16:0}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontSize:13,color:i===3?C.celeste:C.textSecond,fontWeight:500}}>{p.label}</span>
                <span style={{fontSize:13,fontWeight:700,color:scoreColor(pctByQ[i])}}>{pctByQ[i]}%</span>
              </div>
              <div style={{height:8,background:C.surfaceAlt,borderRadius:4,overflow:"hidden"}}>
                <div style={{height:"100%",width:pctByQ[i]+"%",background:i===3?C.celeste:scoreColor(pctByQ[i]),borderRadius:4,transition:"width 0.6s ease"}}/>
              </div>
            </div>
          ))}
        </div>

        <div style={card}>
          <SLabel>Por semana</SLabel>
          {weekKeys.map(wk=>{
            const days=weekGroups[wk];
            const pct=weekScore(days);
            const [,m,d]=wk.split("-");
            return (
              <div key={wk} style={{marginBottom:18}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <span style={{fontSize:13,color:C.textSecond,fontWeight:500}}>Semana del {d}/{m}</span>
                  <span style={{fontSize:13,color:C.textMuted}}>
                    {days.filter(d=>registros[d]).length}/{days.length} días
                    {pct!==null&&<span style={{marginLeft:6,fontWeight:700,color:scoreColor(pct)}}>{pct}%</span>}
                  </span>
                </div>
                {pct!==null&&<div style={{height:6,background:C.surfaceAlt,borderRadius:3,overflow:"hidden",marginBottom:8}}><div style={{height:"100%",width:pct+"%",background:scoreColor(pct),borderRadius:3}}/></div>}
                <div style={{display:"flex",gap:5}}>
                  {days.map(d=>(
                    <div key={d} title={`${dayOfWeek(d)} ${formatDate(d)}`} style={{width:10,height:10,borderRadius:"50%",background:d>today?"transparent":dotColor(registros[d]),border:d>today?"none":`1px solid ${dotColor(registros[d])}`,flexShrink:0}}/>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div style={card}>
          <SLabel>Reflexiones periódicas</SLabel>
          {[
            {label:"Semanales",   val:Object.keys(semanaLog).length},
            {label:"Trimestrales",val:Object.keys(trimestreLog).length},
            {label:"Anuales",     val:Object.keys(anualLog).length},
          ].map((s,i,arr)=>(
            <div key={s.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingBottom:i<arr.length-1?10:0,marginBottom:i<arr.length-1?10:0,borderBottom:i<arr.length-1?`1px solid ${C.border}`:"none"}}>
              <div style={{fontSize:13,color:C.textSecond}}>{s.label}</div>
              <div style={{fontSize:20,fontWeight:700,color:C.navy}}>{s.val}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap",marginTop:8}}>
        {[{color:C.perfect,label:"4/4 perfecto"},{color:C.good,label:"3/4"},{color:C.mid,label:"1-2/4"},{color:C.bad,label:"0/4"},{color:C.skip,label:"Sin registro"}].map(l=>(
          <div key={l.label} style={{display:"flex",alignItems:"center",gap:5}}>
            <div style={{width:9,height:9,borderRadius:"50%",background:l.color}}/>
            <span style={{fontSize:11,color:C.textMuted}}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
