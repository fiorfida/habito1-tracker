import { useState } from "react";
import { C, card, scoreColor } from "../theme";
import { Empty } from "../components/ui";
import SemanaResumen from "../components/SemanaResumen";
import CierreMensual from "../components/CierreMensual";
import DiaCard from "../components/DiaCard";
import { ResumenTrimestral, ResumenAnual } from "../components/RevisionesResumen";
import { addDays } from "../lib/fechas";
import { trimestreSiguiente } from "../lib/periodos";
import { TIPOS, entradasRango } from "../lib/linea";
import Proactividad from "./Proactividad";

const VENTANA_DIAS = 30; // cuánto muestra de entrada; "Ver más" suma otro tanto

// Historial: subvistas "Línea de tiempo" y "Proactividad" (Hábito 1).
export default function Historial(props){
  const [sub, setSub] = useState("linea");
  const opciones = [{id:"linea",t:"Línea de tiempo"},{id:"proactividad",t:"Proactividad"}];
  return (
    <div>
      <div role="tablist" style={{display:"flex",background:C.surfaceAlt,borderRadius:10,padding:3,marginBottom:16}}>
        {opciones.map(o=>(
          <button key={o.id} role="tab" aria-selected={sub===o.id} onClick={()=>setSub(o.id)} style={{flex:1,padding:"8px 0",borderRadius:8,border:"none",
            background:sub===o.id?C.surface:"transparent",color:sub===o.id?C.navy:C.textSecond,fontSize:13,fontWeight:sub===o.id?700:500,cursor:"pointer",fontFamily:"inherit",
            boxShadow:sub===o.id?"0 1px 3px rgba(0,31,91,0.12)":"none"}}>{o.t}</button>
        ))}
      </div>
      {sub==="linea" ? <LineaDeTiempo {...props}/> : <Proactividad registros={props.registros} mananaLog={props.mananaLog} today={props.today}/>}
    </div>
  );
}

// Una sola línea de tiempo (días y revisiones), más reciente primero.
function LineaDeTiempo(props){
  const { stats, registros, mananaLog, semanaLog, planLog, planTrim, mensualLog, trimestreLog, anualLog, today, nocheDisp } = props;
  const { allDays, tracked, totalNoche, totalManana, mananasHechas, consistency } = stats;
  const [tipo, setTipo] = useState("todo");
  const [bloques, setBloques] = useState(1);
  const primerDia = allDays[0];
  const desde = addDays(today, -VENTANA_DIAS*bloques + 1);
  const todas = entradasRango("2000-01-01", today, props, primerDia);
  // Todo y Días se muestran por bloques de 30 días; los filtros de revisiones, completos (son pocas).
  const porBloques = tipo==="todo" || tipo==="dia";
  const delTipo = todas.filter(e => tipo==="todo" || e.tipo===tipo);
  const visibles = delTipo.filter(e => !porBloques || e.fecha>=desde);
  const hayMas = porBloques && delTipo.some(e => e.fecha<desde);

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

      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
        {TIPOS.map(t=>(
          <button key={t.id} onClick={()=>{setTipo(t.id); setBloques(1);}} style={{padding:"6px 12px",borderRadius:16,border:`1px solid ${tipo===t.id?C.navy:C.border}`,
            background:tipo===t.id?C.navy:C.surface,color:tipo===t.id?C.white:C.textSecond,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{t.t}</button>
        ))}
      </div>

      {visibles.length===0 ? (tipo==="todo"||tipo==="dia" ? <Empty/> : <div style={{...card,textAlign:"center",color:C.textMuted,fontSize:13}}>Todavía no hay revisiones de este tipo.</div>) : (
        <div className="historial-grid">
          {visibles.map(e=>(
            <div key={`${e.tipo}-${e.key}`}>
              {e.tipo==="dia" && <DiaCard d={e.fecha} r={registros[e.fecha]} m={mananaLog[e.fecha]} today={today} nocheDisp={nocheDisp}/>}
              {e.tipo==="semanal" && <SemanaResumen W={e.key} doc={semanaLog[e.key]} plan={planLog[addDays(e.key,7)]}/>}
              {e.tipo==="mensual" && <CierreMensual mesKey={e.key} doc={mensualLog[e.key]}/>}
              {e.tipo==="trimestral" && <ResumenTrimestral K={e.key} doc={trimestreLog[e.key]} plan={planTrim?.[e.key]} planSiguiente={planTrim?.[trimestreSiguiente(e.key)]}/>}
              {e.tipo==="anual" && <ResumenAnual Y={Number(e.key)} doc={anualLog[e.key]}/>}
            </div>
          ))}
        </div>
      )}
      {hayMas && (
        <button onClick={()=>setBloques(b=>b+1)} style={{width:"100%",padding:12,marginTop:8,borderRadius:10,border:`1px solid ${C.border}`,background:C.surface,color:C.celeste,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
          Ver más
        </button>
      )}
    </div>
  );
}
