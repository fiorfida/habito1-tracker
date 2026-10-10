import { useState } from "react";
import { C, card, inp, btnPrimario } from "../theme";
import { SLabel } from "../components/ui";
import { MISION, VISION_ALT, ROLES, PREGUNTAS_H1, PREGUNTA_H2 } from "../content/contenido";
import { formatDate, todayBsAs } from "../lib/fechas";
import { partesTrimestre, nombreTrimestre, trimestreSiguiente, semanasDelTrimestre } from "../lib/periodos";
import { estadisticasRango, ajustesRango } from "../lib/estadisticas";
import { esV2, revisionCompleta } from "../lib/semanal";
import { objetivosDelAnio } from "./ObjetivosAnio";
import PlanTrimestral from "./PlanTrimestral";
import CierreMensual from "../components/CierreMensual";

const PASOS = ["Recolección", "Misión y visión", "Objetivos del trimestre", "Hábitos y objetivos anuales", "Planificación", "Salida"];
const nombreRol = (num) => ROLES.find(r=>r.num===num)?.nombre || `Rol ${num}`;
const sub = { fontSize:12, color:C.textMuted, marginBottom:10 };
const pregunta = { fontSize:14, fontWeight:500, color:C.textPrimary, margin:"12px 0 6px", lineHeight:1.5 };
const area = { ...inp, resize:"vertical", fontSize:13, lineHeight:1.5 };
function Pendiente({children}){
  return <div style={{fontSize:12,color:C.textMuted,fontStyle:"italic",background:C.surfaceAlt,borderRadius:8,padding:"8px 10px"}}>{children}</div>;
}
function Opciones({valor, opciones, onChange}){
  return (
    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
      {opciones.map(o=>(
        <button key={o.v} onClick={()=>onChange(valor===o.v?null:o.v)} style={{padding:"6px 12px",borderRadius:8,border:`1px solid ${valor===o.v?o.c:C.border}`,cursor:"pointer",
          background:valor===o.v?o.bg:C.surfaceAlt,color:valor===o.v?o.c:C.textMuted,fontSize:12,fontWeight:600,fontFamily:"inherit"}}>{o.t}</button>
      ))}
    </div>
  );
}
const CUMPLI = [{v:"si",t:"Cumplí",c:C.yes,bg:C.yesBg},{v:"parcial",t:"A medias",c:C.warn,bg:C.warnBg},{v:"no",t:"No cumplí",c:C.no,bg:C.noBg}];
const COMO_VOY = [{v:"encamino",t:"Encaminado",c:C.yes,bg:C.yesBg},{v:"atrasado",t:"Atrasado",c:C.warn,bg:C.warnBg},{v:"cumplido",t:"Cumplido",c:C.celeste,bg:C.celestePale},{v:"riesgo",t:"En riesgo",c:C.no,bg:C.noBg}];

function inicial(doc){
  return { v:2, estado:"borrador", paso:1, impresiones:"", mision:{corregir:"",priorizar:""}, vision:{cambio:"",acerca:""},
    objetivos:{}, sinPlanNota:"", habitos:{nota:""}, anuales:{}, salida:{proximosPasos:""}, ...(doc?.v===2?doc:{}) };
}

export default function RevisionTrimestral(props){
  const { K, doc, onGuardar } = props;
  const [rev, setRev] = useState(()=>inicial(doc));
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState(null);
  const paso = rev.paso || 1;
  const set = (c) => setRev(r=>({...r, ...c}));
  const setEn = (campo, c) => setRev(r=>({...r, [campo]:{...r[campo], ...c}}));

  const guardar = async (cambios={}) => {
    setGuardando(true);
    const nuevo = {...rev, ...cambios, ts:todayBsAs()};
    setRev(nuevo);
    const ok = await onGuardar(K, nuevo);
    setGuardando(false);
    return ok;
  };
  const irA = async (n) => { setAviso(null); await guardar({paso:n}); window.scrollTo(0,0); };
  const ctx = {...props, rev, set, setEn};

  return (
    <div>
      <div style={{...card,padding:"12px 16px",marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:C.textSecond,flexWrap:"wrap",gap:6}}>
          <span>Revisión {nombreTrimestre(K)} · planificación {nombreTrimestre(trimestreSiguiente(K))}</span>
          {rev.estado==="completa" && <span style={{color:C.yes}}>✓ completa</span>}
        </div>
        <div style={{display:"flex",gap:4,marginTop:10}}>
          {PASOS.map((t,i)=>(
            <button key={i} onClick={()=>irA(i+1)} title={t} style={{flex:1,height:28,borderRadius:6,border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:700,
              background:i+1===paso?C.navy:i+1<paso?C.celestePale:C.surfaceAlt,color:i+1===paso?C.white:i+1<paso?C.navy:C.textMuted}}>{i+1}</button>
          ))}
        </div>
        <details style={{marginTop:10}}>
          <summary style={{fontSize:12,color:C.celeste,cursor:"pointer",fontWeight:600}}>Impresiones durante la revisión{rev.impresiones?" ✎":""}</summary>
          <textarea value={rev.impresiones} onChange={e=>set({impresiones:e.target.value})} rows={3} placeholder="Lo que se te ocurra mientras revisás" style={{...area,marginTop:8}}/>
        </details>
      </div>

      <div style={{fontSize:20,fontFamily:"'Playfair Display',serif",color:C.navy,margin:"4px 0 14px"}}>{paso}. {PASOS[paso-1]}</div>

      {paso===1 && <Recoleccion {...ctx}/>}
      {paso===2 && <MisionVision {...ctx}/>}
      {paso===3 && <ObjetivosTrimestre {...ctx}/>}
      {paso===4 && <HabitosAnuales {...ctx}/>}
      {paso===5 && <PlanTrimestral K={trimestreSiguiente(K)} doc={props.planTrim[trimestreSiguiente(K)]} objetivos={props.objetivos} pesos={props.pesos} onGuardar={props.onGuardarPlan}/>}
      {paso===6 && <Salida {...ctx}/>}

      <div style={{display:"flex",gap:8,marginTop:16,flexWrap:"wrap"}}>
        {paso>1 && <button onClick={()=>irA(paso-1)} style={{...btnPrimario,flex:"1 1 120px",background:C.surfaceAlt,color:C.textSecond}}>← Anterior</button>}
        {paso<6
          ? <button onClick={()=>irA(paso+1)} style={{...btnPrimario,flex:"2 1 160px"}}>{guardando?"Guardando…":"Siguiente →"}</button>
          : <button onClick={async()=>{ if(await guardar({estado:"completa"})) setAviso("✓ Revisión trimestral completa."); }} style={{...btnPrimario,flex:"2 1 160px",background:rev.estado==="completa"?C.yes:C.navy}}>
              {guardando?"Guardando…":rev.estado==="completa"?"✓ Guardar cambios":"Finalizar revisión trimestral"}</button>}
      </div>
      {aviso && <div style={{fontSize:12,color:C.yes,marginTop:8}}>{aviso}</div>}
    </div>
  );
}

// ─── Fase 0: recolección (precargada) ──────────────────────────────────
function Recoleccion({K, registros, mananaLog, semanaLog, mensualLog}){
  const { inicio, fin } = partesTrimestre(K);
  const hoy = todayBsAs();
  const e = estadisticasRango(inicio, fin, hoy, {registros, mananaLog});
  const semanas = semanasDelTrimestre(K);
  const hechas = semanas.filter(w=>revisionCompleta(semanaLog[w])).length;
  const reflexiones = semanas.filter(w=>esV2(semanaLog[w])).map(w=>({w, r:semanaLog[w].reflexion||{}}));
  const ajustes = ajustesRango(inicio, fin, mananaLog);
  const Metrica = ({t,v,d}) => (
    <div style={{flex:"1 1 110px",background:C.surfaceAlt,borderRadius:8,padding:"10px 12px"}}>
      <div style={{fontSize:11,color:C.textMuted}}>{t}</div>
      <div style={{fontSize:20,fontWeight:700,color:C.navy}}>{v}</div>
      {d && <div style={{fontSize:11,color:C.textMuted}}>{d}</div>}
    </div>
  );
  const p = (x) => x===null?"—":`${x}%`;
  const cumpl = (c) => c.cargados ? `${c.si} sí · ${c.parcial} parcial de ${c.cargados}` : "Sin cargar";
  return (
    <>
      <div style={sub}>Del {formatDate(inicio)} al {formatDate(fin)}. Todo precargado del tracker.</div>
      <div style={card}>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <Metrica t="Consistencia Noche" v={p(e.consistencia)} d={`${e.noches} de ${e.diasNoche} días`}/>
          <Metrica t="Score (H1 + H2)" v={p(e.score)}/>
          <Metrica t="Mañanas" v={`${e.mananas}`} d={`de ${e.diasManana} días`}/>
          <Metrica t="Semanales completas" v={`${hechas}/${semanas.length}`}/>
        </div>
        <div style={{display:"flex",gap:16,flexWrap:"wrap",fontSize:12,color:C.textSecond,marginTop:12}}>
          {[...PREGUNTAS_H1, PREGUNTA_H2].map((q,i)=><span key={q.id}>{q.label}: <strong>{p(e.porPregunta[i])}</strong></span>)}
        </div>
        <div style={{display:"flex",gap:16,flexWrap:"wrap",fontSize:12,color:C.textSecond,marginTop:8}}>
          <span>Compromisos: <strong>{cumpl(e.compromisos)}</strong></span>
          <span>Tareas clave: <strong>{cumpl(e.tareasClave)}</strong></span>
        </div>
      </div>
      <div style={card}>
        <SLabel>Hábitos</SLabel>
        {e.habitos.map(h=>(
          <div key={h.id} style={{display:"flex",justifyContent:"space-between",gap:8,fontSize:13,padding:"4px 0"}}>
            <span style={{color:C.textPrimary}}>{h.nombre} <span style={{fontSize:11,color:C.textMuted}}>· {h.regla}</span></span>
            <strong style={{color:C.navy,flexShrink:0}}>{h.pct===null?"—":`${h.pct}%`} <span style={{fontSize:11,color:C.textMuted,fontWeight:400}}>({h.si}/{h.dias})</span></strong>
          </div>
        ))}
      </div>
      <div className="grid-2">
        <div style={card}>
          <SLabel>Ajustes de misión y visión (mañanas)</SLabel>
          {ajustes.length===0 ? <Pendiente>Sin ajustes anotados en el trimestre.</Pendiente> : ajustes.map(a=>(
            <div key={a.fecha} style={{fontSize:12,color:C.textSecond,padding:"4px 0"}}><strong>{formatDate(a.fecha)}</strong>{a.misionAjuste&&` · Misión: ${a.misionAjuste}`}{a.visionAjuste&&` · Visión: ${a.visionAjuste}`}</div>
          ))}
        </div>
        <div style={card}>
          <SLabel>Reflexiones semanales</SLabel>
          {reflexiones.length===0 ? <Pendiente>Sin revisiones semanales en el formato nuevo en este trimestre.</Pendiente> : reflexiones.map(({w,r})=>(
            <div key={w} style={{fontSize:12,color:C.textSecond,padding:"4px 0",borderBottom:`1px solid ${C.border}`}}>
              <strong>{formatDate(w)}</strong>{r.intencion&&` · Intención: ${r.intencion}`}
              {(r.preocupaciones||[]).length>0 && <div style={{color:C.textMuted}}>Preocupaciones: {r.preocupaciones.map(x=>x.texto).join(" · ")}</div>}
            </div>
          ))}
        </div>
      </div>
      <div style={card}>
        <SLabel>Cierres mensuales</SLabel>
        {partesTrimestre(K).meses.filter(m=>mensualLog?.[m]).length===0
          ? <Pendiente>Sin cierres mensuales cargados para este trimestre.</Pendiente>
          : partesTrimestre(K).meses.filter(m=>mensualLog?.[m]).map(m=><CierreMensual key={m} mesKey={m} doc={mensualLog[m]}/>)}
      </div>
    </>
  );
}

// ─── Fase 1: revisión ──────────────────────────────────────────────────
function MisionVision({rev, setEn}){
  return (
    <>
      <div style={card}>
        <SLabel>✦ Misión</SLabel>
        <div style={{fontSize:13,color:C.textSecond,lineHeight:1.6,whiteSpace:"pre-line"}}>{MISION}</div>
        <div style={pregunta}>¿Hay algo que quiera corregir?</div>
        <textarea value={rev.mision.corregir} onChange={e=>setEn("mision",{corregir:e.target.value})} rows={2} style={area}/>
        <div style={pregunta}>¿Hay algo del día a día que no esté priorizando bien?</div>
        <textarea value={rev.mision.priorizar} onChange={e=>setEn("mision",{priorizar:e.target.value})} rows={2} style={area}/>
      </div>
      <div style={card}>
        <SLabel>✦ Visión</SLabel>
        <img src={`${process.env.PUBLIC_URL}/vision.webp`} alt={VISION_ALT} style={{width:"100%",height:"auto",display:"block",borderRadius:8}}/>
        <div style={pregunta}>¿Cambió algo que quiera corregir?</div>
        <textarea value={rev.vision.cambio} onChange={e=>setEn("vision",{cambio:e.target.value})} rows={2} style={area}/>
        <div style={pregunta}>¿Hay algo del día a día que no me acerque a mi visión?</div>
        <textarea value={rev.vision.acerca} onChange={e=>setEn("vision",{acerca:e.target.value})} rows={2} style={area}/>
      </div>
    </>
  );
}

function ObjetivosTrimestre({K, rev, set, setEn, planTrim}){
  const plan = planTrim[K];
  const objs = (plan?.objetivos||[]).filter(o=>o.texto);
  if (!objs.length) return (
    <div style={card}>
      <Pendiente>No hay plan cargado para el {nombreTrimestre(K)} en el tracker.</Pendiente>
      <div style={pregunta}>¿Qué objetivos tenía este trimestre y cómo me fue? ¿Por qué?</div>
      <textarea value={rev.sinPlanNota} onChange={e=>set({sinPlanNota:e.target.value})} rows={5} style={area}/>
    </div>
  );
  return (
    <div className="roles-grid">
      {ROLES.filter(r=>objs.some(o=>o.rol===r.num)).map(r=>(
        <div key={r.num} style={card}>
          <div style={{fontSize:14,fontWeight:600,color:C.textPrimary,marginBottom:6}}>{r.num} · {r.nombre}</div>
          {objs.filter(o=>o.rol===r.num).map(o=>{
            const ev = rev.objetivos[o.id]||{};
            return (
              <div key={o.id} style={{padding:"8px 0",borderTop:`1px solid ${C.border}`}}>
                <div style={{fontSize:13,fontWeight:600,color:C.navy,marginBottom:6}}>{o.texto}</div>
                <Opciones valor={ev.estado} opciones={CUMPLI} onChange={v=>setEn("objetivos",{[o.id]:{...ev,estado:v}})}/>
                <input value={ev.porque||""} onChange={e=>setEn("objetivos",{[o.id]:{...ev,porque:e.target.value}})} placeholder="¿Por qué?" style={{...inp,fontSize:12,marginTop:6}}/>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function HabitosAnuales({K, rev, setEn, registros, mananaLog, objetivos}){
  const { inicio, fin, anio } = partesTrimestre(K);
  const e = estadisticasRango(inicio, fin, todayBsAs(), {registros, mananaLog});
  const anuales = objetivosDelAnio(objetivos, anio);
  return (
    <>
      <div style={card}>
        <SLabel>Hábitos — constancia del trimestre</SLabel>
        {e.habitos.map(h=>(
          <div key={h.id} style={{display:"flex",justifyContent:"space-between",fontSize:13,padding:"4px 0"}}>
            <span>{h.nombre}</span><strong style={{color:C.navy}}>{h.pct===null?"—":`${h.pct}%`}</strong>
          </div>
        ))}
        <div style={pregunta}>¿Cambió algo que requiera modificar un hábito u objetivo?</div>
        <textarea value={rev.habitos.nota} onChange={e=>setEn("habitos",{nota:e.target.value})} rows={2} style={area}/>
      </div>
      <div style={card}>
        <SLabel>Objetivos {anio} — ¿cómo voy?</SLabel>
        {anuales.length===0 ? <Pendiente>Sin objetivos {anio} cargados. Se cargan en Periódica → Anual → Objetivos del año.</Pendiente> :
          ROLES.filter(r=>anuales.some(o=>o.rol===r.num)).map(r=>(
            <div key={r.num} style={{marginBottom:10}}>
              <div style={{fontSize:12,fontWeight:700,color:C.textSecond,marginBottom:4}}>{r.num} · {r.nombre}</div>
              {anuales.filter(o=>o.rol===r.num).map(o=>{
                const ev = rev.anuales[o.id]||{};
                return (
                  <div key={o.id} style={{padding:"6px 0",borderTop:`1px solid ${C.border}`}}>
                    <div style={{fontSize:13,color:C.navy,fontWeight:600}}>{o.central?"★ ":""}{o.titulo}{o.plazo&&<span style={{fontSize:11,color:C.textMuted,fontWeight:400}}> · plazo {formatDate(o.plazo)}</span>}</div>
                    <div style={{marginTop:6}}><Opciones valor={ev.estado} opciones={COMO_VOY} onChange={v=>setEn("anuales",{[o.id]:{...ev,estado:v}})}/></div>
                    <input value={ev.nota||""} onChange={e=>setEn("anuales",{[o.id]:{...ev,nota:e.target.value}})} placeholder="Nota (opcional)" style={{...inp,fontSize:12,marginTop:6}}/>
                  </div>
                );
              })}
            </div>
          ))}
      </div>
    </>
  );
}

// ─── Salida ────────────────────────────────────────────────────────────
function Salida({K, rev, setEn, planTrim, objetivos}){
  const objs = (planTrim[K]?.objetivos||[]).filter(o=>o.texto);
  const anuales = objetivosDelAnio(objetivos, partesTrimestre(K).anio);
  const cumpliendo = [
    ...objs.filter(o=>rev.objetivos[o.id]?.estado==="si").map(o=>`${o.texto} (${nombreRol(o.rol)})`),
    ...anuales.filter(o=>["encamino","cumplido"].includes(rev.anuales[o.id]?.estado)).map(o=>`${o.titulo} — anual`),
  ];
  const noCumpliendo = [
    ...objs.filter(o=>["parcial","no"].includes(rev.objetivos[o.id]?.estado)).map(o=>`${o.texto}${rev.objetivos[o.id]?.porque?`: ${rev.objetivos[o.id].porque}`:""}`),
    ...anuales.filter(o=>["atrasado","riesgo"].includes(rev.anuales[o.id]?.estado)).map(o=>`${o.titulo} — anual${rev.anuales[o.id]?.nota?`: ${rev.anuales[o.id].nota}`:""}`),
  ];
  const Lista = ({titulo, items, color}) => (
    <div style={card}>
      <SLabel>{titulo}</SLabel>
      {items.length===0 ? <div style={{fontSize:12,color:C.textMuted,fontStyle:"italic"}}>—</div> :
        items.map((t,k)=><div key={k} style={{fontSize:13,color,padding:"3px 0"}}>• {t}</div>)}
    </div>
  );
  return (
    <>
      <div className="grid-2">
        <Lista titulo="Qué estoy cumpliendo" items={cumpliendo} color={C.yes}/>
        <Lista titulo="Qué no (y por qué)" items={noCumpliendo} color={C.no}/>
      </div>
      {rev.sinPlanNota && <div style={card}><SLabel>Objetivos del trimestre (sin plan cargado)</SLabel><div style={{fontSize:13,color:C.textSecond,whiteSpace:"pre-line"}}>{rev.sinPlanNota}</div></div>}
      <div style={card}>
        <SLabel>Próximos pasos exactos para llegar a fin de año</SLabel>
        <textarea value={rev.salida.proximosPasos} onChange={e=>setEn("salida",{proximosPasos:e.target.value})} rows={5} style={area}/>
      </div>
    </>
  );
}
