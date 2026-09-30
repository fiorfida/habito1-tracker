import { C, card, inp, btnPrimario } from "../theme";
import { SLabel, EstadoBanner } from "../components/ui";
import { PREGUNTAS_TRIMESTRE, PREGUNTAS_ANUAL } from "../content/contenido";
import { formatDate, addDays } from "../lib/fechas";
import { ChispaResumen, ChispaVista } from "../components/Chispa";
import SemanaResumen from "../components/SemanaResumen";
import RevisionSemanal from "./RevisionSemanal";
import Pendientes from "./Pendientes";

export default function Periodica(props){
  const { sub, setSub, semanaEstado, trimEstado, anualEstado, todos } = props;
  const abiertos = Object.values(todos||{}).filter(t=>t.estado==="abierto").length;
  return (
    <div>
      <div style={{display:"flex",gap:4,marginBottom:20,background:C.surfaceAlt,borderRadius:10,padding:4,overflowX:"auto"}}>
        {[
          {id:"semanal",    label:"Semanal",    pend:semanaEstado==="hoy"||semanaEstado==="encurso"},
          {id:"pendientes", label:`Pendientes${abiertos?` (${abiertos})`:""}`, pend:false},
          {id:"trimestral", label:"Trimestral", pend:trimEstado!=="completada"},
          {id:"anual",      label:"Anual",      pend:anualEstado!=="completada"},
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

      {sub==="trimestral" && (
        <ReflexionSimple estado={trimEstado} nombre="trimestral" icono="⭐"
          subtitulo={`T${props.trimInfo.quarter} ${props.trimInfo.quarterYear}`}
          preguntas={PREGUNTAS_TRIMESTRE} form={props.trimestreForm} setForm={props.setTrimestreForm}
          onGuardar={props.onGuardarTrimestre} saved={props.savedTrimestre}
          log={props.trimestreLog} tituloItem={key=>key.replace("-Q"," · T")}/>
      )}

      {sub==="anual" && (
        <ReflexionSimple estado={anualEstado} nombre="anual" icono="⭐"
          subtitulo={`Año ${props.anualInfo.reviewedYear}`}
          preguntas={PREGUNTAS_ANUAL} form={props.anualForm} setForm={props.setAnualForm}
          onGuardar={props.onGuardarAnual} saved={props.savedAnual}
          log={props.anualLog} tituloItem={year=>`Año ${year}`}/>
      )}
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
        todos={props.todos} pesos={props.chispa.pesos} onGuardar={props.onGuardarRevision} onTodo={props.onTodo}/>

      {anteriores.length>0 && (
        <div style={{marginTop:28}}>
          <SLabel>Revisiones anteriores</SLabel>
          {anteriores.map(k=><SemanaResumen key={k} W={k} doc={semanaLog[k]} plan={planLog[addDays(k,7)]}/>)}
        </div>
      )}
    </div>
  );
}

function Preguntas({preguntas, form, setForm}){
  return preguntas.map((p,i)=>(
    <div key={p.id} style={{marginBottom:i<preguntas.length-1?20:0}}>
      <div style={{fontSize:14,fontWeight:500,color:C.textPrimary,marginBottom:8,lineHeight:1.5}}>{p.pregunta}</div>
      <textarea placeholder={p.placeholder} value={form[p.id]}
        onChange={e=>setForm({...form,[p.id]:e.target.value})}
        rows={3} style={{...inp,resize:"none",lineHeight:1.5,fontSize:13}}/>
    </div>
  ));
}

function Respuestas({preguntas, datos}){
  return preguntas.map(p=>(
    <div key={p.id} style={{marginBottom:10}}>
      <div style={{fontSize:11,color:C.celeste,textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>{p.pregunta.slice(0,45)}…</div>
      <div style={{fontSize:13,color:C.textSecond}}>{datos[p.id]||<em style={{color:C.textMuted}}>Sin respuesta</em>}</div>
    </div>
  ));
}

function ReflexionSimple({estado, nombre, icono, subtitulo, preguntas, form, setForm, onGuardar, saved, log, tituloItem}){
  return (
    <div>
      <EstadoBanner estado={estado}
        tituloPendiente={`${icono} Reflexión ${nombre} pendiente`}
        tituloVencida={`⚠️ Reflexión ${nombre} vencida`}
        tituloCompletada={`✓ Reflexión ${nombre} completada`}
        subtitulo={subtitulo}/>

      <div style={card}>
        <SLabel>Reflexión {nombre}</SLabel>
        <Preguntas preguntas={preguntas} form={form} setForm={setForm}/>
        <button onClick={onGuardar} style={{...btnPrimario,marginTop:16}}>
          {saved?"✓ Reflexión guardada y sincronizada":`Guardar reflexión ${nombre}`}
        </button>
      </div>

      {Object.keys(log).length>0&&(
        <div style={{marginTop:24}}>
          <SLabel>Reflexiones anteriores</SLabel>
          {Object.keys(log).sort((a,b)=>b.localeCompare(a)).map(key=>(
            <div key={key} style={{...card,marginBottom:12}}>
              <div style={{fontSize:13,fontWeight:600,color:C.navy,marginBottom:12}}>{tituloItem(key)}</div>
              <Respuestas preguntas={preguntas} datos={log[key]}/>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
