import { useState } from "react";
import { C, card } from "../theme";
import { SLabel } from "../components/ui";
import { formatDate, addDays, todayBsAs } from "../lib/fechas";
import { trimestreDe, nombreTrimestre, nombreMes } from "../lib/periodos";
import { ChispaResumen, ChispaVista } from "../components/Chispa";
import SemanaResumen from "../components/SemanaResumen";
import RevisionSemanal from "./RevisionSemanal";
import RevisionTrimestral from "./RevisionTrimestral";
import PlanTrimestral from "./PlanTrimestral";
import ObjetivosAnio from "./ObjetivosAnio";
import Pendientes from "./Pendientes";
import RevisionMensual from "./RevisionMensual";
import CierreMensual from "../components/CierreMensual";

export default function Periodica(props){
  const { sub, setSub, semanaEstado, mensualEstado, trimEstado, todos } = props;
  const abiertos = Object.values(todos||{}).filter(t=>t.estado==="abierto").length;
  return (
    <div>
      <div style={{display:"flex",gap:4,marginBottom:20,background:C.surfaceAlt,borderRadius:10,padding:4,overflowX:"auto"}}>
        {[
          {id:"semanal",    label:"Semanal",    pend:semanaEstado==="hoy"||semanaEstado==="encurso"},
          {id:"mensual",    label:"Mensual",    pend:mensualEstado==="hoy"||mensualEstado==="encurso"},
          {id:"trimestral", label:"Trimestral", pend:trimEstado==="hoy"||trimEstado==="encurso"},
          {id:"anual",      label:"Anual",      pend:false},
          {id:"pendientes", label:`Pendientes${abiertos?` (${abiertos})`:""}`, pend:false},
          {id:"chispa",     label:"🔥 Chispa",  pend:false},
        ].map(s=>(
          <button key={s.id} onClick={()=>setSub(s.id)} style={{
            flex:"1 0 auto",position:"relative",padding:"10px 10px",borderRadius:8,border:"none",cursor:"pointer",whiteSpace:"nowrap",
            background:sub===s.id?C.navy:"transparent",
            color:sub===s.id?C.white:C.textSecond,
            fontSize:13,fontFamily:"inherit",fontWeight:600,transition:"all 0.2s",
          }}>
            {s.label}
            {s.pend && <span style={{position:"absolute",top:4,right:4,width:6,height:6,borderRadius:"50%",background:sub===s.id?C.celesteLight:C.warn}}/>}
          </button>
        ))}
      </div>

      {(sub==="trimestral"||sub==="anual") && <ChispaResumen chispa={props.chispa} onAbrir={()=>setSub("chispa")}/>}

      {sub==="chispa" && <ChispaVista chispa={props.chispa} onGuardar={props.onGuardarChispa}/>}

      {sub==="semanal" && <Semanal {...props}/>}

      {sub==="pendientes" && <Pendientes todos={todos} onAgregar={props.onAgregarTodo} onTodo={props.onTodo}/>}

      {sub==="mensual" && <Mensual {...props}/>}

      {sub==="trimestral" && <Trimestral {...props}/>}

      {sub==="anual" && <Anual {...props}/>}
    </div>
  );
}

function Banner({color, bg, borde, titulo, detalle}){
  return (
    <div style={{...card, background:bg, border:`1px solid ${borde}`, marginBottom:16}}>
      <div style={{fontSize:13,fontWeight:600,color}}>{titulo}</div>
      {detalle && <div style={{fontSize:12,color:C.textMuted,marginTop:2}}>{detalle}</div>}
    </div>
  );
}

function Mensual(props){
  const { ventanaM, mensualEstado, mensualLog } = props;
  const anteriores = Object.keys(mensualLog||{}).filter(k=>!(ventanaM.abierta&&k===ventanaM.key)).sort((a,b)=>b.localeCompare(a));
  return (
    <div>
      {ventanaM.abierta ? (<>
        {mensualEstado==="completada"
          ? <Banner color={C.yes} bg={C.yesBg} borde={C.yes} titulo={`✓ Cierre de ${nombreMes(ventanaM.key)} completo`} detalle={`Podés editarlo hasta el ${formatDate(ventanaM.hasta)}.`}/>
          : <Banner color={C.warn} bg={C.warnBg} borde={C.warn} titulo={`🗓 Revisión mensual de ${nombreMes(ventanaM.key)} disponible`} detalle={`Hasta el ${formatDate(ventanaM.hasta)}`}/>}
        <RevisionMensual key={ventanaM.key} mesKey={ventanaM.key} doc={mensualLog[ventanaM.key]} frasesExtra={props.frasesExtra}
          registros={props.registros} mananaLog={props.mananaLog} semanaLog={props.semanaLog} planLog={props.planLog}
          onGuardar={props.onGuardarMensual} onGuardarFrases={props.onGuardarFrases}/>
      </>) : (
        <Banner color={C.textSecond} bg={C.surfaceAlt} borde={C.border} titulo={`🗓 Próxima revisión mensual: ${formatDate(ventanaM.proxima)}`}
          detalle="Se hace en los primeros 7 días de cada mes y revisa el mes anterior."/>
      )}
      {anteriores.length>0 && (
        <div style={{marginTop:24}}>
          <SLabel>Cierres anteriores</SLabel>
          {anteriores.map(k=><CierreMensual key={k} mesKey={k} doc={mensualLog[k]}/>)}
        </div>
      )}
    </div>
  );
}

function Trimestral(props){
  const { ventanaT, trimEstado, trimestreLog, planTrim, objetivos, chispa } = props;
  const actual = trimestreDe(todayBsAs());
  if (ventanaT.abierta) {
    const K = ventanaT.key;
    return (
      <div>
        {trimEstado==="completada"
          ? <Banner color={C.yes} bg={C.yesBg} borde={C.yes} titulo={`✓ Revisión ${nombreTrimestre(K)} completa`} detalle={`Podés editarla hasta el ${formatDate(ventanaT.hasta)}.`}/>
          : <Banner color={C.warn} bg={C.warnBg} borde={C.warn} titulo={`⭐ Revisión trimestral ${nombreTrimestre(K)} disponible`} detalle={`Hasta el ${formatDate(ventanaT.hasta)} · guía trimestral de Superhábitos`}/>}
        <RevisionTrimestral key={K} K={K} doc={trimestreLog[K]} planTrim={planTrim} objetivos={objetivos} pesos={chispa.pesos}
          registros={props.registros} mananaLog={props.mananaLog} semanaLog={props.semanaLog} mensualLog={props.mensualLog}
          onGuardar={props.onGuardarTrimestral} onGuardarPlan={props.onGuardarPlanTrim}/>
      </div>
    );
  }
  return (
    <div>
      <Banner color={C.textSecond} bg={C.surfaceAlt} borde={C.border} titulo={`⭐ Próxima revisión trimestral: ${formatDate(ventanaT.proxima)}`}
        detalle="El cierre del T4 se hace junto con la revisión anual (desde el 15/12)."/>
      <SLabel>Plan del trimestre en curso · {nombreTrimestre(actual)}</SLabel>
      <PlanTrimestral K={actual} doc={planTrim[actual]} objetivos={objetivos} pesos={chispa.pesos} onGuardar={props.onGuardarPlanTrim}/>
    </div>
  );
}

function Anual(props){
  const { ventanaA, objetivos } = props;
  const y = Number(todayBsAs().slice(0,4));
  const [anio, setAnio] = useState(y);
  return (
    <div>
      <Banner color={C.textSecond} bg={C.surfaceAlt} borde={C.border}
        titulo={ventanaA.abierta ? `⭐ Revisión anual ${ventanaA.key}: llega con la entrega 4c` : `⭐ Próxima revisión anual: ${formatDate(ventanaA.proxima)}`}
        detalle="Mientras tanto, acá cargás y ajustás los objetivos del año."/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <SLabel>Objetivos del año</SLabel>
        <div style={{display:"flex",gap:4,marginTop:-14}}>
          {[y, y+1].map(a=>(
            <button key={a} onClick={()=>setAnio(a)} style={{padding:"4px 12px",borderRadius:6,border:`1px solid ${anio===a?C.navy:C.border}`,background:anio===a?C.navy:C.surface,color:anio===a?C.white:C.textSecond,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{a}</button>
          ))}
        </div>
      </div>
      <ObjetivosAnio key={anio} anio={anio} objetivos={objetivos} onGuardar={props.onGuardarObjetivo}/>
    </div>
  );
}

const BANNER_SEMANA = {
  hoy:        { bg:C.warnBg,      borde:C.warn,    color:C.warn,      t:"📋 Hoy es día de revisión semanal" },
  encurso:    { bg:C.celestePale, borde:C.celeste, color:C.celeste,   t:"📋 Revisión en curso — continuá donde quedaste" },
  espera:     { bg:C.surfaceAlt,  borde:C.border,  color:C.textSecond,t:"📋 Revisión semanal pendiente" },
  completada: { bg:C.yesBg,       borde:C.yes,     color:C.yes,       t:"✓ Revisión semanal completa" },
};

function Semanal(props){
  const { semanaEstado, W, P, semanaLog, planLog } = props;
  const b = BANNER_SEMANA[semanaEstado] || BANNER_SEMANA.espera;
  const anteriores = Object.keys(semanaLog).filter(k=>k!==W).sort((a,c)=>c.localeCompare(a));
  return (
    <div>
      <div style={{...card, background:b.bg, border:`1px solid ${b.borde}`, marginBottom:16}}>
        <div style={{fontSize:13,fontWeight:600,color:b.color}}>{b.t}</div>
        <div style={{fontSize:12,color:C.textMuted,marginTop:2}}>Sábados 9:30 · objetivo con el hábito consolidado: 30 a 60 min</div>
      </div>

      <RevisionSemanal key={W} W={W} P={P} revDoc={semanaLog[W]} planDoc={planLog[P]}
        planLog={planLog} semanaLog={semanaLog} registros={props.registros} mananaLog={props.mananaLog}
        todos={props.todos} pesos={props.chispa.pesos} onGuardar={props.onGuardarRevision} onTodo={props.onTodo}
        planTrim={props.planTrim} objetivos={props.objetivos}/>

      {anteriores.length>0 && (
        <div style={{marginTop:28}}>
          <SLabel>Revisiones anteriores</SLabel>
          {anteriores.map(k=><SemanaResumen key={k} W={k} doc={semanaLog[k]} plan={planLog[addDays(k,7)]}/>)}
        </div>
      )}
    </div>
  );
}
