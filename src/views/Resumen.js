import { useState } from "react";
import { C, card, scoreColor, dotColor } from "../theme";
import { SLabel } from "../components/ui";
import SemanaResumen from "../components/SemanaResumen";
import CierreMensual from "../components/CierreMensual";
import DiaCard from "../components/DiaCard";
import { ResumenTrimestral, ResumenAnual } from "../components/RevisionesResumen";
import { PREGUNTAS_H1, PREGUNTA_H2, ROLES_TODOS } from "../content/contenido";
import { formatDate, dayOfWeek, addDays, getWeekStart, dateRange } from "../lib/fechas";
import { rangoMes, nombreMes, mesSiguiente, mesAnterior, trimestreDe, partesTrimestre, nombreTrimestre, trimestreSiguiente } from "../lib/periodos";
import { estadisticasRango } from "../lib/estadisticas";
import { tiempoPorRol, hs } from "../lib/semanal";
import { entradasRango } from "../lib/linea";

const PERIODOS = [
  { id:"dia", t:"Día" }, { id:"semana", t:"Semana" }, { id:"mes", t:"Mes" }, { id:"trimestre", t:"Trimestre" }, { id:"anio", t:"Año" },
];

// Rango, etiqueta y desplazamiento de cada tipo de período, a partir de una fecha ancla.
function rango(tipo, a){
  if (tipo==="dia") return { desde:a, hasta:a, etiqueta:`${dayOfWeek(a)} ${formatDate(a)}` };
  if (tipo==="semana") { const d=getWeekStart(a); return { desde:d, hasta:addDays(d,6), etiqueta:`Semana del ${formatDate(d)} al ${formatDate(addDays(d,6))}` }; }
  if (tipo==="mes") { const m=a.slice(0,7), r=rangoMes(m); return { desde:r.inicio, hasta:r.fin, etiqueta:nombreMes(m) }; }
  if (tipo==="trimestre") { const K=trimestreDe(a), p=partesTrimestre(K); return { desde:p.inicio, hasta:p.fin, etiqueta:nombreTrimestre(K) }; }
  const y=a.slice(0,4); return { desde:`${y}-01-01`, hasta:`${y}-12-31`, etiqueta:y };
}
function mover(tipo, a, dir){
  if (tipo==="dia") return addDays(a, dir);
  if (tipo==="semana") return addDays(a, 7*dir);
  if (tipo==="mes") return `${(dir>0?mesSiguiente:mesAnterior)(a.slice(0,7))}-01`;
  if (tipo==="trimestre") { const K=trimestreDe(a); if (dir>0) return partesTrimestre(trimestreSiguiente(K)).inicio; return addDays(partesTrimestre(K).inicio, -1); }
  return `${Number(a.slice(0,4))+dir}-01-01`;
}

export default function Resumen(props){
  const { registros, mananaLog, semanaLog, planLog, planTrim, mensualLog, trimestreLog, anualLog, today, nocheDisp, onExportar, driveEstado } = props;
  const [exportando, setExportando] = useState(null); // null | "subiendo" | "fin" | "error"
  const [tipo, setTipo] = useState("mes");
  const [ancla, setAncla] = useState(today);
  const { desde, hasta, etiqueta } = rango(tipo, ancla);
  const siguiente = mover(tipo, ancla, 1);
  const haySiguiente = rango(tipo, siguiente).desde <= today;

  // Los porcentajes cuentan desde el primer registro: los días previos no son "incumplidos".
  const primerRegistro = [...Object.keys(registros), ...Object.keys(mananaLog)].sort()[0] || today;
  const desdeCalculo = desde < primerRegistro ? primerRegistro : desde;
  const e = estadisticasRango(desdeCalculo, hasta, today, {registros, mananaLog});
  const revisiones = entradasRango(desde, hasta, props).filter(x=>x.tipo!=="dia");
  const p = x => x===null?"—":`${x}%`;
  const cumpl = c => c.cargados ? `${c.si} sí · ${c.parcial} parcial de ${c.cargados}` : "Sin cargar";

  // % de tiempo por rol: planes semanales cuyo sábado cae en el período.
  const min = {};
  Object.entries(planLog||{}).filter(([P])=>{ const s=addDays(P,6); return s>=desde && s<=hasta; })
    .forEach(([,pl])=>tiempoPorRol(pl.items||[], pl.agendadoPorRol).forEach(x=>{ min[x.rol.num]=(min[x.rol.num]||0)+x.min; }));
  const total = Object.values(min).reduce((a,b)=>a+b,0);
  const fin = hasta<today?hasta:today;
  const dias = desdeCalculo>fin ? [] : dateRange(desdeCalculo, fin).reverse();

  const Metrica = ({t,v,d}) => (
    <div style={{flex:"1 1 110px",background:C.surfaceAlt,borderRadius:8,padding:"10px 12px"}}>
      <div style={{fontSize:11,color:C.textMuted}}>{t}</div>
      <div style={{fontSize:20,fontWeight:700,color:C.navy}}>{v}</div>
      {d && <div style={{fontSize:11,color:C.textMuted}}>{d}</div>}
    </div>
  );
  const flecha = (activo) => ({ width:40,height:40,borderRadius:8,border:`1px solid ${C.border}`,background:activo?C.surface:C.surfaceAlt,color:activo?C.navy:C.textMuted,fontSize:16,cursor:activo?"pointer":"default",fontFamily:"inherit",flexShrink:0 });

  return (
    <div>
      <div style={{display:"flex",gap:4,marginBottom:12,background:C.surfaceAlt,borderRadius:10,padding:4}}>
        {PERIODOS.map(x=>(
          <button key={x.id} onClick={()=>{setTipo(x.id); setAncla(today);}} style={{flex:1,padding:"8px 2px",borderRadius:8,border:"none",cursor:"pointer",
            background:tipo===x.id?C.navy:"transparent",color:tipo===x.id?C.white:C.textSecond,fontSize:13,fontWeight:600,fontFamily:"inherit"}}>{x.t}</button>
        ))}
      </div>
      <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:16}}>
        <button onClick={()=>setAncla(mover(tipo,ancla,-1))} style={flecha(true)} aria-label="Período anterior">◀</button>
        <div style={{flex:1,textAlign:"center",fontSize:15,fontWeight:700,color:C.navy,textTransform:tipo==="mes"?"capitalize":"none"}}>{etiqueta}</div>
        <button onClick={()=>haySiguiente&&setAncla(siguiente)} disabled={!haySiguiente} style={flecha(haySiguiente)} aria-label="Período siguiente">▶</button>
      </div>

      <div style={{display:"flex",justifyContent:"flex-end",alignItems:"center",gap:10,marginTop:-6,marginBottom:12}}>
        {exportando==="fin" && driveEstado==="ok" && <span style={{fontSize:12,color:C.yes}}>✓ Período exportado a Drive</span>}
        {(exportando==="error" || (exportando==="fin" && driveEstado!=="ok")) && <span style={{fontSize:12,color:C.no}}>No se completó: mirá el aviso de arriba</span>}
        <button onClick={async()=>{ setExportando("subiendo"); const ok = await onExportar(desde, hasta<today?hasta:today); setExportando(ok===false?"error":"fin"); }}
          disabled={exportando==="subiendo"||driveEstado==="subiendo"}
          style={{padding:"6px 12px",borderRadius:8,border:`1px solid ${C.celeste}`,background:C.surface,color:C.celeste,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
          {exportando==="subiendo"||driveEstado==="subiendo" ? "Exportando…" : "📄 Exportar período a Drive"}
        </button>
      </div>

      {tipo==="dia" ? (
        <DiaCard d={ancla} r={registros[ancla]} m={mananaLog[ancla]} today={today} nocheDisp={nocheDisp}/>
      ) : (<>
        <div style={card}>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <Metrica t="Consistencia Noche" v={p(e.consistencia)} d={`${e.noches} de ${e.diasNoche} días`}/>
            <Metrica t="Score (H1 + H2)" v={p(e.score)}/>
            <Metrica t="Mañanas" v={`${e.mananas}`} d={`de ${e.diasManana} días`}/>
            {e.habitos.map(h=><Metrica key={h.id} t={h.nombre} v={p(h.pct)} d={`${h.si} de ${h.dias} días`}/>)}
          </div>
          <div style={{display:"flex",gap:16,flexWrap:"wrap",fontSize:12,color:C.textSecond,marginTop:10}}>
            <span>Compromisos: <strong>{cumpl(e.compromisos)}</strong></span>
            <span>Tareas clave: <strong>{cumpl(e.tareasClave)}</strong></span>
          </div>
        </div>

        <div className="grid-2">
          <div style={card}>
            <SLabel>Por pregunta</SLabel>
            {[...PREGUNTAS_H1, PREGUNTA_H2].map((q,i)=>{ const v=e.porPregunta[i]; return (
              <div key={q.id} style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:4}}>
                  <span style={{color:i===3?C.celeste:C.textSecond}}>{q.label}</span><strong style={{color:v===null?C.textMuted:scoreColor(v)}}>{p(v)}</strong>
                </div>
                <div style={{height:8,background:C.surfaceAlt,borderRadius:4}}><div style={{height:"100%",width:(v||0)+"%",background:i===3?C.celeste:scoreColor(v||0),borderRadius:4}}/></div>
              </div>
            ); })}
          </div>
          <div style={card}>
            <SLabel>% de tiempo por rol</SLabel>
            {total===0 ? <div style={{fontSize:12,color:C.textMuted,fontStyle:"italic"}}>Sin planes semanales en el período.</div> :
              ROLES_TODOS.filter(r=>min[r.num]).map(r=>{ const pct=Math.round(min[r.num]/total*100); return (
                <div key={r.num} style={{marginBottom:6}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:C.textSecond,marginBottom:2}}><span>{r.num} · {r.nombre}</span><span>{hs(min[r.num])} h · {pct}%</span></div>
                  <div style={{height:6,background:C.surfaceAlt,borderRadius:3}}><div style={{height:"100%",width:pct+"%",background:C.celeste,borderRadius:3}}/></div>
                </div>
              ); })}
          </div>
        </div>

        {(tipo==="semana"||tipo==="mes") && dias.length>0 && (
          <div style={card}>
            <SLabel>Días · más reciente primero</SLabel>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {dias.map(d=>{ const r=registros[d], pendiente=d===today&&!r; return (
                <button key={d} onClick={()=>{setTipo("dia"); setAncla(d);}} title={`${dayOfWeek(d)} ${formatDate(d)}`}
                  style={{width:38,padding:"4px 0",borderRadius:8,border:`1px ${pendiente?"dashed":"solid"} ${dotColor(r)}`,background:pendiente?"transparent":r?dotColor(r):C.surfaceAlt,
                    color:r?C.white:C.textMuted,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{d.slice(8)}</button>
              ); })}
            </div>
            <div style={{fontSize:11,color:C.textMuted,marginTop:8}}>Tocá un día para ver su detalle.</div>
          </div>
        )}

        {revisiones.length>0 && (
          <div style={{marginTop:8}}>
            <SLabel>Revisiones del período</SLabel>
            {revisiones.map(x=>(
              <div key={`${x.tipo}-${x.key}`}>
                {x.tipo==="semanal" && <SemanaResumen W={x.key} doc={semanaLog[x.key]} plan={planLog[addDays(x.key,7)]}/>}
                {x.tipo==="mensual" && <CierreMensual mesKey={x.key} doc={mensualLog[x.key]}/>}
                {x.tipo==="trimestral" && <ResumenTrimestral K={x.key} doc={trimestreLog[x.key]} plan={planTrim?.[x.key]} planSiguiente={planTrim?.[trimestreSiguiente(x.key)]}/>}
                {x.tipo==="anual" && <ResumenAnual Y={Number(x.key)} doc={anualLog[x.key]}/>}
              </div>
            ))}
          </div>
        )}
      </>)}
    </div>
  );
}
