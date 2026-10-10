import { useState } from "react";
import { C, card, inp, btnPrimario } from "../theme";
import { SLabel } from "../components/ui";
import { ROLES_TODOS } from "../content/contenido";
import { formatDate, dateRange, addDays, todayBsAs } from "../lib/fechas";
import { rangoMes, nombreMes, mesSiguiente } from "../lib/periodos";
import { estadisticasRango } from "../lib/estadisticas";
import { tiempoPorRol, esV2, hs } from "../lib/semanal";
import { FRASES_REACTIVAS, notasDelRango, auditarLenguaje } from "../lib/lenguaje";

const PASOS = ["Resumen del mes", "Auditoría de lenguaje", "De TENER a SER", "Cualidad a cultivar"];
const sub = { fontSize:12, color:C.textMuted, marginBottom:10 };
const btnLink = { background:"none", border:"none", color:C.celeste, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit", padding:0 };
function Pendiente({children}){
  return <div style={{fontSize:12,color:C.textMuted,fontStyle:"italic",background:C.surfaceAlt,borderRadius:8,padding:"8px 10px"}}>{children}</div>;
}

function inicial(doc){
  return { v:2, estado:"borrador", paso:1, auditoria:{frase:"", contexto:""},
    tenerASer:[{tener:"",ser:""},{tener:"",ser:""},{tener:"",ser:""}], cualidad:"", ...(doc||{}) };
}

// Semanas (domingo) cuyo sábado cae en el mes: sus planes forman el tiempo por rol del mes.
const semanasDelMes = (mesKey, inicio, fin) =>
  dateRange(addDays(inicio, -6), fin).filter(d => new Date(d+"T12:00:00").getDay()===0 && addDays(d,6).slice(0,7)===mesKey);

export function resumenDelMes(mesKey, {registros, mananaLog, semanaLog, planLog}){
  const { inicio, fin } = rangoMes(mesKey);
  const e = estadisticasRango(inicio, fin, todayBsAs(), {registros, mananaLog});
  const semanas = semanasDelMes(mesKey, inicio, fin);
  const min = {};
  semanas.forEach(P => tiempoPorRol(planLog[P]?.items||[], planLog[P]?.agendadoPorRol).forEach(x => { min[x.rol.num] = (min[x.rol.num]||0) + x.min; }));
  const total = Object.values(min).reduce((a,b)=>a+b,0);
  // Reflexiones de las semanas revisadas que terminan en el mes.
  const reflexiones = semanas.filter(W=>esV2(semanaLog[W])).map(W=>({W, r:semanaLog[W].reflexion||{}}));
  const preocupaciones = reflexiones.flatMap(x=>x.r.preocupaciones||[]);
  return { inicio, fin, e, total,
    porRol: ROLES_TODOS.filter(r=>!r.archivado||min[r.num]).map(r=>({rol:r, min:min[r.num]||0, pct: total?Math.round((min[r.num]||0)/total*100):0})),
    reflexiones, enControl: preocupaciones.filter(p=>p.control===true).length, preocupaciones: preocupaciones.length };
}

export default function RevisionMensual(props){
  const { mesKey, doc, frasesExtra, onGuardar, onGuardarFrases } = props;
  const [rev, setRev] = useState(()=>inicial(doc));
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState(null);
  const [error, setError] = useState(null);
  const paso = rev.paso || 1;
  const set = c => setRev(r=>({...r, ...c}));

  const res = resumenDelMes(mesKey, props);
  const { inicio, fin } = res;
  const notas = notasDelRango(dateRange(inicio, fin), props.registros);
  const frases = [...FRASES_REACTIVAS, ...(frasesExtra||[])];
  const auditoria = auditarLenguaje(notas, frases);

  const guardar = async (cambios={}) => {
    setGuardando(true);
    const foto = { consistencia:res.e.consistencia, score:res.e.score, compromisos:res.e.compromisos, tareasClave:res.e.tareasClave,
      habitos:res.e.habitos.map(h=>({id:h.id, nombre:h.nombre, pct:h.pct})), porRol:res.porRol.map(x=>({rol:x.rol.num, min:x.min, pct:x.pct})),
      frases:auditoria.map(a=>({frase:a.frase, cantidad:a.cantidad})) };
    const nuevo = {...rev, ...cambios, resumen:foto, ts:todayBsAs()};
    if (!nuevo.auditoria.frase && auditoria[0]) nuevo.auditoria = {...nuevo.auditoria, frase:auditoria[0].frase};
    setRev(nuevo);
    const ok = await onGuardar(mesKey, nuevo);
    setGuardando(false);
    return ok;
  };
  const irA = async (n) => { setError(null); setAviso(null); await guardar({paso:n}); window.scrollTo(0,0); };
  const finalizar = async () => {
    if (!rev.cualidad.trim()) { setError("Elegí una cualidad para el mes que empieza."); return; }
    if (await guardar({estado:"completa"})) setAviso("✓ Cierre mensual completo.");
  };

  return (
    <div>
      <div style={{...card,padding:"12px 16px",marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:C.textSecond,flexWrap:"wrap",gap:6}}>
          <span>Cierre de {nombreMes(mesKey)} · del {formatDate(inicio)} al {formatDate(fin)}</span>
          {rev.estado==="completa" && <span style={{color:C.yes}}>✓ completo</span>}
        </div>
        <div style={{display:"flex",gap:4,marginTop:10}}>
          {PASOS.map((t,i)=>(
            <button key={i} onClick={()=>irA(i+1)} title={t} style={{flex:1,height:28,borderRadius:6,border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:700,
              background:i+1===paso?C.navy:i+1<paso?C.celestePale:C.surfaceAlt,color:i+1===paso?C.white:i+1<paso?C.navy:C.textMuted}}>{i+1}</button>
          ))}
        </div>
      </div>

      <div style={{fontSize:20,fontFamily:"'Playfair Display',serif",color:C.navy,margin:"4px 0 14px"}}>{paso}. {PASOS[paso-1]}</div>

      {paso===1 && <Resumen res={res}/>}
      {paso===2 && <Auditoria auditoria={auditoria} notas={notas} registros={props.registros} inicio={inicio} fin={fin} rev={rev} set={set} frasesExtra={frasesExtra||[]} onGuardarFrases={onGuardarFrases}/>}
      {paso===3 && (
        <div style={card}>
          <div style={sub}>Tus tres "si tuviera…" más recurrentes del mes, transformados en un "puedo ser…" concreto y accionable.</div>
          {rev.tenerASer.map((x,k)=>(
            <div key={k} style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center",padding:"8px 0",borderBottom:k<2?`1px solid ${C.border}`:"none"}}>
              <input value={x.tener} onChange={e=>set({tenerASer:rev.tenerASer.map((y,j)=>j===k?{...y,tener:e.target.value}:y)})} placeholder="Si tuviera…" style={{...inp,fontSize:13,flex:"1 1 180px"}}/>
              <span style={{color:C.celeste,fontWeight:700}}>→</span>
              <input value={x.ser} onChange={e=>set({tenerASer:rev.tenerASer.map((y,j)=>j===k?{...y,ser:e.target.value}:y)})} placeholder="Puedo ser…" style={{...inp,fontSize:13,flex:"1 1 180px"}}/>
            </div>
          ))}
        </div>
      )}
      {paso===4 && (
        <div style={{...card,borderLeft:`4px solid ${C.celeste}`}}>
          <SLabel>Cualidad a cultivar en {nombreMes(mesSiguiente(mesKey))}</SLabel>
          <div style={sub}>Va a aparecer cada mañana durante el mes.</div>
          <input value={rev.cualidad} onChange={e=>{set({cualidad:e.target.value}); setError(null);}} placeholder="Paciencia" style={{...inp,fontSize:15}}/>
        </div>
      )}

      {error && <div style={{fontSize:13,color:C.no,margin:"8px 0"}}>{error}</div>}
      <div style={{display:"flex",gap:8,marginTop:16,flexWrap:"wrap"}}>
        {paso>1 && <button onClick={()=>irA(paso-1)} style={{...btnPrimario,flex:"1 1 120px",background:C.surfaceAlt,color:C.textSecond}}>← Anterior</button>}
        {paso<4
          ? <button onClick={()=>irA(paso+1)} style={{...btnPrimario,flex:"2 1 160px"}}>{guardando?"Guardando…":"Siguiente →"}</button>
          : <button onClick={finalizar} style={{...btnPrimario,flex:"2 1 160px",background:rev.estado==="completa"?C.yes:C.navy}}>{guardando?"Guardando…":rev.estado==="completa"?"✓ Guardar cambios":"Finalizar cierre mensual"}</button>}
      </div>
      {aviso && <div style={{fontSize:12,color:C.yes,marginTop:8}}>{aviso}</div>}
    </div>
  );
}

function Resumen({res}){
  const { e } = res;
  const p = x => x===null?"—":`${x}%`;
  const cumpl = c => c.cargados ? `${c.si} sí · ${c.parcial} parcial de ${c.cargados}` : "Sin cargar";
  const Metrica = ({t,v,d}) => (
    <div style={{flex:"1 1 110px",background:C.surfaceAlt,borderRadius:8,padding:"10px 12px"}}>
      <div style={{fontSize:11,color:C.textMuted}}>{t}</div>
      <div style={{fontSize:20,fontWeight:700,color:C.navy}}>{v}</div>
      {d && <div style={{fontSize:11,color:C.textMuted}}>{d}</div>}
    </div>
  );
  return (
    <>
      <div style={card}>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <Metrica t="Consistencia Noche" v={p(e.consistencia)} d={`${e.noches} de ${e.diasNoche} días`}/>
          <Metrica t="Score (H1 + H2)" v={p(e.score)}/>
          {e.habitos.map(h=><Metrica key={h.id} t={h.nombre} v={p(h.pct)} d={`${h.si} de ${h.dias} días`}/>)}
        </div>
        <div style={{display:"flex",gap:16,flexWrap:"wrap",fontSize:12,color:C.textSecond,marginTop:10}}>
          <span>Compromisos: <strong>{cumpl(e.compromisos)}</strong></span>
          <span>Tareas clave: <strong>{cumpl(e.tareasClave)}</strong></span>
        </div>
      </div>
      <div className="grid-2">
        <div style={card}>
          <SLabel>% de tiempo por rol</SLabel>
          {res.total===0 ? <Pendiente>Sin planes semanales en el mes.</Pendiente> : res.porRol.map(x=>(
            <div key={x.rol.num} style={{marginBottom:6}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:C.textSecond,marginBottom:2}}><span>{x.rol.num} · {x.rol.nombre}</span><span>{hs(x.min)} h · {x.pct}%</span></div>
              <div style={{height:6,background:C.surfaceAlt,borderRadius:3}}><div style={{height:"100%",width:x.pct+"%",background:C.celeste,borderRadius:3}}/></div>
            </div>
          ))}
        </div>
        <div style={card}>
          <SLabel>Semanales del mes</SLabel>
          {res.reflexiones.length===0 ? <Pendiente>Sin revisiones semanales en el formato nuevo para este mes.</Pendiente> : <>
            {res.preocupaciones>0 && <div style={{fontSize:12,color:C.textSecond,marginBottom:6}}>Preocupaciones: {res.preocupaciones}, de las cuales {res.enControl} en mi control.</div>}
            {res.reflexiones.map(({W,r})=>(
              <div key={W} style={{fontSize:12,color:C.textSecond,padding:"4px 0",borderTop:`1px solid ${C.border}`}}>
                <strong>Semana del {formatDate(W)}</strong>{r.intencion&&` · Intención: ${r.intencion}`}
              </div>
            ))}
          </>}
        </div>
      </div>
    </>
  );
}

function Auditoria({auditoria, notas, registros, inicio, fin, rev, set, frasesExtra, onGuardarFrases}){
  const [nueva, setNueva] = useState("");
  const [abierta, setAbierta] = useState(null);
  const diasNo = dateRange(inicio, fin).filter(d=>registros[d] && registros[d].p2===false);
  const top = auditoria[0];
  const frase = rev.auditoria.frase || top?.frase || "";
  const agregar = async () => { const f = nueva.trim().toLowerCase(); if (!f || frasesExtra.includes(f) || FRASES_REACTIVAS.includes(f)) return; await onGuardarFrases([...frasesExtra, f]); setNueva(""); };
  return (
    <>
      <div style={card}>
        <SLabel>Frases reactivas en tus notas del mes</SLabel>
        <div style={sub}>{notas.length} notas revisadas. Cuenta sin distinguir mayúsculas ni tildes.</div>
        {auditoria.length===0 ? <Pendiente>No aparece ninguna frase de la lista este mes.</Pendiente> : auditoria.map(a=>(
          <div key={a.frase} style={{padding:"6px 0",borderTop:`1px solid ${C.border}`}}>
            <div style={{display:"flex",justifyContent:"space-between",gap:8}}>
              <button onClick={()=>setAbierta(abierta===a.frase?null:a.frase)} style={{...btnLink,color:C.textPrimary}}>"{a.frase}" {abierta===a.frase?"▲":"▼"}</button>
              <strong style={{color:C.warn}}>{a.cantidad}</strong>
            </div>
            {abierta===a.frase && a.ocurrencias.map((o,k)=><div key={k} style={{fontSize:12,color:C.textSecond,padding:"3px 0 3px 10px"}}><strong>{formatDate(o.fecha)}</strong> · …{o.fragmento}…</div>)}
          </div>
        ))}
        <div style={{fontSize:12,color:C.textMuted,marginTop:10}}>Lista: {[...FRASES_REACTIVAS, ...frasesExtra].map(f=>`"${f}"`).join(", ")}</div>
        <div style={{display:"flex",gap:8,marginTop:8}}>
          <input value={nueva} onChange={e=>setNueva(e.target.value)} onKeyDown={e=>e.key==="Enter"&&agregar()} placeholder="Sumar una frase propia" style={{...inp,fontSize:13}}/>
          <button onClick={agregar} style={{...btnPrimario,width:"auto",padding:"10px 16px",fontSize:13}}>Sumar</button>
        </div>
      </div>
      <div style={card}>
        <SLabel>Días con No en Lenguaje ({diasNo.length})</SLabel>
        {diasNo.length===0 ? <Pendiente>Ningún día con No este mes.</Pendiente> : diasNo.map(d=>(
          <div key={d} style={{fontSize:12,color:C.textSecond,padding:"3px 0"}}><strong>{formatDate(d)}</strong>{registros[d].p2_nota?` · ${registros[d].p2_nota}`:""}</div>
        ))}
      </div>
      <div style={{...card,borderLeft:`4px solid ${C.warn}`}}>
        <SLabel>La frase reactiva más frecuente</SLabel>
        <input value={frase} onChange={e=>set({auditoria:{...rev.auditoria, frase:e.target.value}})} placeholder="tengo que" style={{...inp,fontSize:14,marginBottom:8}}/>
        <textarea value={rev.auditoria.contexto} onChange={e=>set({auditoria:{...rev.auditoria, frase, contexto:e.target.value}})} placeholder="¿En qué contexto aparece?" rows={3} style={{...inp,resize:"vertical",fontSize:13}}/>
      </div>
    </>
  );
}
