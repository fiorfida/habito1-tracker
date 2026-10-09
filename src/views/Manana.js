import { useState } from "react";
import { C, card, inp, btnPrimario } from "../theme";
import { SLabel, MetasRolLista } from "../components/ui";
import { MISION, VISION_ALT, ROLES } from "../content/contenido";
import { formatDate } from "../lib/fechas";
import { itemsActivos, hs } from "../lib/semanal";

const PASOS = ["Misión", "Visión", "Adaptación diaria", "Anticipación proactiva"];
const PREG_MISION = "¿Me siento tranquilo y contento de usar estas ideas como guía para mis decisiones hoy? ¿Sería feliz si lograra todo lo enunciado?";
const PREG_VISION = "¿Refleja lo que realmente quiero y sueño alcanzar?";
const btnLink = { background:"none", border:"none", color:C.celeste, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit", padding:0 };

function inicial(doc){
  return {
    misionOk:null, misionAjuste:"", visionOk:null, visionAjuste:"", incompatibles:false,
    visionAlternativas:[], visionElegida:null, cambio:null, quitados:[], agregados:[], distinto:"",
    tareaClave:null, situaciones:[], compromiso:"", paso:1, ...(doc||{}),
  };
}

// Sí / No de un toque, botones grandes para el celular.
function SiNo({valor, onChange}){
  return (
    <div style={{display:"flex",gap:10}}>
      {[true,false].map(v=>(
        <button key={String(v)} onClick={()=>onChange(v)} style={{flex:1,padding:"14px 0",borderRadius:10,border:"2px solid",cursor:"pointer",fontFamily:"inherit",fontSize:16,fontWeight:700,
          background:valor===v?(v?C.yesBg:C.noBg):C.surfaceAlt,color:valor===v?(v?C.yes:C.no):C.textMuted,borderColor:valor===v?(v?C.yes:C.no):C.border}}>{v?"Sí":"No"}</button>
      ))}
    </div>
  );
}
const pregunta = { fontSize:15, fontWeight:500, color:C.textPrimary, lineHeight:1.5, marginBottom:12 };

export default function Manana({today, doc, plan, mananaLog, frase, onGuardar}){
  const [m, setM] = useState(()=>inicial(doc));
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const set = (c) => setM(prev=>({...prev, ...c}));
  const completada = !!doc?.visto;
  const paso = m.paso || 1;

  const guardar = async (cambios, completar) => {
    setGuardando(true);
    const nuevo = {...m, ...cambios};
    // Si no elegí otra, queda guardada la tarea clave del plan (la Noche la necesita).
    if (!nuevo.tareaClave && tarea) nuevo.tareaClave = {id:tarea.id, texto:tarea.texto};
    setM(nuevo);
    const ok = await onGuardar(nuevo, completar);
    setGuardando(false);
    return ok;
  };
  const irA = async (n) => { setError(null); await guardar({paso:n}, false); window.scrollTo(0,0); };
  const completar = async () => {
    if (m.misionOk===null || m.visionOk===null) { setError("Respondé Sí o No en Misión y en Visión para completar la mañana."); return; }
    setError(null);
    await guardar({}, true);
  };

  // Lo previsto para hoy según el plan semanal, con la adaptación del día.
  const delPlan = plan ? itemsActivos(plan.items||[]).filter(i=>i.dia===today).sort((a,b)=>(a.hora||"99").localeCompare(b.hora||"99")) : [];
  const vigentes = delPlan.filter(i=>!m.quitados.includes(i.id));
  const candidatas = [...vigentes.map(i=>({id:i.id, texto:i.titulo})), ...m.agregados.map((t,k)=>({id:`a${k}`, texto:t}))];
  const clavePlan = plan?.tareaClave?.[today];
  const tarea = m.tareaClave || (clavePlan && candidatas.find(c=>c.id===clavePlan)) || null;
  const faltan = [!tarea?.texto && "tarea más importante", !m.compromiso.trim() && "compromiso del día"].filter(Boolean);

  const ajustes = Object.values(mananaLog||{}).filter(x=>x.misionAjuste||x.visionAjuste).sort((a,b)=>b.fecha.localeCompare(a.fecha));

  return (
    <div>
      <div style={{...card, background:completada?C.yesBg:C.warnBg, border:`1px solid ${completada?C.yes:C.warn}`, marginBottom:16}}>
        <div style={{fontSize:13,fontWeight:600,color:completada?C.yes:C.warn}}>{completada?"✓ Mañana completada":"☀️ Mañana pendiente"}</div>
        <div style={{fontSize:12,color:C.textMuted,marginTop:2}}>
          {completada ? <>Tarea clave: {tarea?.texto||"—"} · Compromiso: {m.compromiso||"—"}</> : "5 a 10 minutos: reconectar con lo decidido en la semana y ajustar el día."}
        </div>
      </div>

      <div style={{...card,background:C.celestePale,border:`1px solid ${C.celeste}`,marginBottom:16}}>
        <div style={{fontSize:15,fontStyle:"italic",color:C.navy,lineHeight:1.6}}>"{frase.texto}"</div>
        <div style={{fontSize:13,color:C.celeste,fontWeight:600,marginTop:8,textAlign:"right"}}>— {frase.autor}</div>
      </div>

      <div style={{display:"flex",gap:4,marginBottom:14}}>
        {PASOS.map((t,i)=>(
          <button key={i} onClick={()=>irA(i+1)} style={{flex:1,padding:"8px 2px",borderRadius:6,border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:700,
            background:i+1===paso?C.navy:C.surfaceAlt,color:i+1===paso?C.white:C.textMuted}}>{t.split(" ")[0]}</button>
        ))}
      </div>

      {paso===1 && (
        <div style={card}>
          <SLabel>✦ Misión personal</SLabel>
          <div style={{fontSize:14,color:C.textSecond,lineHeight:1.7,whiteSpace:"pre-line",marginBottom:18}}>{MISION}</div>
          <div style={pregunta}>{PREG_MISION}</div>
          <SiNo valor={m.misionOk} onChange={v=>set({misionOk:v})}/>
          {m.misionOk===false && (
            <textarea value={m.misionAjuste} onChange={e=>set({misionAjuste:e.target.value})} placeholder="¿Qué ajustes le haría al enunciado?"
              rows={3} style={{...inp,resize:"vertical",fontSize:13,marginTop:12}}/>
          )}
        </div>
      )}

      {paso===2 && (
        <div style={card}>
          <SLabel>✦ Visión personal — 5 años</SLabel>
          <img src={`${process.env.PUBLIC_URL}/vision.webp`} alt={VISION_ALT} style={{width:"100%",height:"auto",display:"block",borderRadius:8,marginBottom:18}}/>
          <div style={pregunta}>{PREG_VISION}</div>
          <SiNo valor={m.visionOk} onChange={v=>set({visionOk:v})}/>
          {m.visionOk===false && (
            <div style={{marginTop:12}}>
              <textarea value={m.visionAjuste} onChange={e=>set({visionAjuste:e.target.value})} placeholder="¿Qué cambiaría?"
                rows={3} style={{...inp,resize:"vertical",fontSize:13}}/>
              <label style={{display:"flex",gap:8,alignItems:"center",fontSize:13,color:C.textSecond,marginTop:10}}>
                <input type="checkbox" checked={m.incompatibles} onChange={e=>set({incompatibles:e.target.checked})}/>
                Hay ideas incompatibles entre sí
              </label>
              {m.incompatibles && (
                <div style={{marginTop:10}}>
                  <div style={{fontSize:12,color:C.textMuted,marginBottom:8}}>Imaginá cómo sería vivir cada alternativa y elegí una.</div>
                  {m.visionAlternativas.map((a,k)=>(
                    <div key={k} style={{border:`2px solid ${m.visionElegida===k?C.yes:C.border}`,borderRadius:10,padding:10,marginBottom:8}}>
                      <input value={a.texto} onChange={e=>set({visionAlternativas:m.visionAlternativas.map((x,j)=>j===k?{...x,texto:e.target.value}:x)})}
                        placeholder={`Alternativa ${k+1}`} style={{...inp,fontSize:13,fontWeight:600,marginBottom:6}}/>
                      <textarea value={a.vivirla} onChange={e=>set({visionAlternativas:m.visionAlternativas.map((x,j)=>j===k?{...x,vivirla:e.target.value}:x)})}
                        placeholder="¿Cómo sería vivirla?" rows={2} style={{...inp,resize:"vertical",fontSize:13}}/>
                      <button onClick={()=>set({visionElegida:m.visionElegida===k?null:k})} style={{...btnLink,marginTop:6,color:m.visionElegida===k?C.yes:C.celeste}}>
                        {m.visionElegida===k?"✓ Elegida":"Elegir esta"}
                      </button>
                    </div>
                  ))}
                  <button onClick={()=>set({visionAlternativas:[...m.visionAlternativas,{texto:"",vivirla:""}]})} style={btnLink}>+ Agregar alternativa</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {paso===2 && <MisRoles/>}

      {paso===3 && <Adaptacion today={today} plan={plan} m={m} set={set} delPlan={delPlan} candidatas={candidatas} tarea={tarea}/>}

      {paso===4 && (
        <>
          <div style={card}>
            <SLabel>Anticipación proactiva — Hábito 1</SLabel>
            <div style={{fontSize:13,color:C.textSecond,marginBottom:12}}>¿Qué situaciones de hoy podrían generarme una reacción automática? ¿Cómo decido responder de antemano?</div>
            {m.situaciones.map((s,k)=>(
              <div key={k} style={{paddingBottom:10,marginBottom:10,borderBottom:`1px solid ${C.border}`}}>
                <input value={s.situacion} onChange={e=>set({situaciones:m.situaciones.map((x,j)=>j===k?{...x,situacion:e.target.value}:x)})}
                  placeholder="Situación" style={{...inp,fontSize:13,marginBottom:6}}/>
                <div style={{display:"flex",gap:8}}>
                  <input value={s.respuesta} onChange={e=>set({situaciones:m.situaciones.map((x,j)=>j===k?{...x,respuesta:e.target.value}:x)})}
                    placeholder="→ Cómo decido responder" style={{...inp,fontSize:13}}/>
                  <button onClick={()=>set({situaciones:m.situaciones.filter((_,j)=>j!==k)})} style={{...btnLink,color:C.textMuted}} aria-label="Quitar">✕</button>
                </div>
              </div>
            ))}
            <button onClick={()=>set({situaciones:[...m.situaciones,{situacion:"",respuesta:""}]})} style={btnLink}>+ Agregar situación</button>
          </div>
          <div style={{...card,borderLeft:`4px solid ${C.celeste}`}}>
            <SLabel>Mi compromiso de hoy</SLabel>
            <div style={{fontSize:13,color:C.textSecond,marginBottom:10}}>Uno solo, concreto y pequeño, conmigo mismo.</div>
            <input value={m.compromiso} onChange={e=>set({compromiso:e.target.value})} placeholder="Hoy me comprometo a…" style={{...inp,fontSize:14}}/>
          </div>
          {faltan.length>0 && <div style={{fontSize:12,color:C.textMuted,marginBottom:10}}>Sin cargar: {faltan.join(" y ")}. Podés completar igual.</div>}
        </>
      )}

      {error && <div style={{fontSize:13,color:C.no,margin:"8px 0"}}>{error}</div>}
      <div style={{display:"flex",gap:8,marginTop:6}}>
        {paso>1 && <button onClick={()=>irA(paso-1)} style={{...btnPrimario,flex:1,background:C.surfaceAlt,color:C.textSecond}}>← Anterior</button>}
        {paso<4
          ? <button onClick={()=>irA(paso+1)} style={{...btnPrimario,flex:2}}>{guardando?"Guardando…":"Siguiente →"}</button>
          : <button onClick={completar} style={{...btnPrimario,flex:2,background:completada?C.yes:C.navy}}>{guardando?"Guardando…":completada?"✓ Guardar cambios":"✓ Completar mañana"}</button>}
      </div>

      {ajustes.length>0 && <Ajustes ajustes={ajustes}/>}
    </div>
  );
}

function Adaptacion({today, plan, m, set, delPlan, candidatas, tarea}){
  const [nuevo, setNuevo] = useState("");
  const [libre, setLibre] = useState("");
  const [marcadas, setMarcadas] = useState([]);
  const [duelo, setDuelo] = useState(null); // {campeon, cola}
  const agregar = () => { if(!nuevo.trim()) return; set({agregados:[...m.agregados, nuevo.trim()]}); setNuevo(""); };
  const elegir = (c) => { set({tareaClave:{id:c.id, texto:c.texto}}); setDuelo(null); setMarcadas([]); };
  const empezarDuelo = () => { const l = candidatas.filter(c=>marcadas.includes(c.id)); setDuelo({campeon:l[0], cola:l.slice(1)}); };
  const gana = (c) => { const cola = duelo.cola.slice(1); if (!cola.length) elegir(c); else setDuelo({campeon:c, cola}); };

  return (
    <>
      <div style={card}>
        <SLabel>Lo previsto para hoy · {formatDate(today)}</SLabel>
        {!plan ? (
          <div style={{fontSize:13,color:C.textMuted,fontStyle:"italic"}}>No hay plan semanal para esta semana. Podés agregar lo de hoy acá abajo.</div>
        ) : delPlan.length===0 ? (
          <div style={{fontSize:13,color:C.textMuted,fontStyle:"italic"}}>El plan semanal no tiene bloques para hoy.</div>
        ) : delPlan.map(i=>{
          const quitado = m.quitados.includes(i.id);
          return (
            <div key={i.id} style={{display:"flex",justifyContent:"space-between",gap:8,alignItems:"center",padding:"6px 0",borderBottom:`1px solid ${C.border}`,opacity:quitado?0.5:1}}>
              <span style={{fontSize:13,color:C.textPrimary,textDecoration:quitado?"line-through":"none"}}>{i.hora?`${i.hora} · `:""}{i.titulo} · {hs(i.minutos)} h</span>
              {m.cambio && <button onClick={()=>set({quitados:quitado?m.quitados.filter(x=>x!==i.id):[...m.quitados,i.id]})} style={{...btnLink,fontSize:12,color:quitado?C.celeste:C.textMuted}}>{quitado?"Recuperar":"Quitar hoy"}</button>}
            </div>
          );
        })}
        {m.agregados.map((t,k)=>(
          <div key={k} style={{display:"flex",justifyContent:"space-between",gap:8,padding:"6px 0",borderBottom:`1px solid ${C.border}`}}>
            <span style={{fontSize:13,color:C.textPrimary}}>+ {t}</span>
            <button onClick={()=>set({agregados:m.agregados.filter((_,j)=>j!==k)})} style={{...btnLink,fontSize:12,color:C.textMuted}}>Quitar</button>
          </div>
        ))}
        {plan?.metas && (
          <details style={{marginTop:10}}>
            <summary style={{fontSize:12,color:C.celeste,cursor:"pointer",fontWeight:600}}>Metas de la semana por rol</summary>
            <div style={{marginTop:8}}><MetasRolLista metas={plan.metas}/></div>
          </details>
        )}
      </div>

      <div style={card}>
        <div style={pregunta}>¿Cambió algo respecto de lo planificado en la semana?</div>
        <SiNo valor={m.cambio} onChange={v=>set({cambio:v})}/>
        {m.cambio && (
          <div style={{marginTop:12}}>
            <div style={{fontSize:12,color:C.textMuted,marginBottom:6}}>Quitá bloques de la lista de arriba o agregá lo nuevo de hoy. El plan semanal no se modifica.</div>
            <div style={{display:"flex",gap:8}}>
              <input value={nuevo} onChange={e=>setNuevo(e.target.value)} onKeyDown={e=>e.key==="Enter"&&agregar()} placeholder="Agregar algo para hoy" style={{...inp,fontSize:13}}/>
              <button onClick={agregar} style={{...btnPrimario,width:"auto",padding:"10px 16px",fontSize:13}}>Agregar</button>
            </div>
          </div>
        )}
      </div>

      <div style={card}>
        <div style={pregunta}>Pensando en ayer y en lo que planeo hoy, ¿qué podría hacer distinto para que mi misión sea más real hoy?</div>
        <textarea value={m.distinto} onChange={e=>set({distinto:e.target.value})} placeholder="Opcional" rows={2} style={{...inp,resize:"vertical",fontSize:13}}/>
      </div>

      <div style={{...card,borderLeft:`4px solid ${C.gold}`}}>
        <SLabel>★ Tarea más importante del día</SLabel>
        <div style={{fontSize:13,color:C.textSecond,marginBottom:12}}>En función de mi misión, visión y objetivos, ¿cuál es la tarea más importante que tengo hoy?</div>
        {tarea?.texto && <div style={{fontSize:15,fontWeight:600,color:C.navy,background:C.goldBg,borderRadius:8,padding:"10px 12px",marginBottom:12}}>★ {tarea.texto}</div>}
        {duelo ? (
          <div>
            <div style={{fontSize:12,color:C.textMuted,marginBottom:8}}>¿Cuál es más importante hoy?</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {[duelo.campeon, duelo.cola[0]].map(c=>(
                <button key={c.id} onClick={()=>gana(c)} style={{flex:"1 1 140px",padding:"14px 10px",borderRadius:10,border:`2px solid ${C.celeste}`,background:C.celestePale,color:C.navy,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{c.texto}</button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {candidatas.map(c=>(
              <div key={c.id} style={{display:"flex",justifyContent:"space-between",gap:8,alignItems:"center",padding:"6px 0",borderBottom:`1px solid ${C.border}`}}>
                <label style={{display:"flex",gap:8,alignItems:"center",fontSize:13,color:C.textPrimary}}>
                  <input type="checkbox" checked={marcadas.includes(c.id)} onChange={e=>setMarcadas(e.target.checked?[...marcadas,c.id]:marcadas.filter(x=>x!==c.id))}/>
                  {c.texto}
                </label>
                <button onClick={()=>elegir(c)} style={{...btnLink,fontSize:12}}>Elegir</button>
              </div>
            ))}
            {marcadas.length>=2 && <button onClick={empezarDuelo} style={{...btnLink,marginTop:10}}>Dudo entre {marcadas.length}: comparar de a pares</button>}
            <div style={{display:"flex",gap:8,marginTop:12}}>
              <input value={libre} onChange={e=>setLibre(e.target.value)} placeholder="O escribila" style={{...inp,fontSize:13}}/>
              <button onClick={()=>{ if(libre.trim()){ set({tareaClave:{id:null, texto:libre.trim()}}); setLibre(""); } }} style={{...btnPrimario,width:"auto",padding:"10px 16px",fontSize:13}}>Usar</button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

// Los 8 roles con su descripción, para tenerlos presentes cada mañana.
function MisRoles(){
  return (
    <div style={card}>
      <SLabel>✦ Mis 8 roles</SLabel>
      <div className="roles-grid">
        {ROLES.map((r,i)=>(
          <div key={r.num} style={{display:"flex",gap:12,alignItems:"flex-start",paddingBottom:i<ROLES.length-1?14:0,marginBottom:i<ROLES.length-1?14:0,borderBottom:i<ROLES.length-1?`1px solid ${C.border}`:"none"}}>
            <div style={{width:28,height:28,borderRadius:"50%",background:C.navy,color:C.white,fontSize:12,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{r.num}</div>
            <div>
              <div style={{fontSize:14,fontWeight:600,color:C.textPrimary}}>{r.nombre}</div>
              <div style={{fontSize:12,color:C.textMuted,marginTop:2}}>{r.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Ajustes anotados: insumo para las revisiones trimestral y anual (Fase 4).
function Ajustes({ajustes}){
  return (
    <details style={{...card,marginTop:24}}>
      <summary style={{fontSize:11,letterSpacing:2,color:C.textMuted,textTransform:"uppercase",cursor:"pointer"}}>Ajustes anotados de misión y visión ({ajustes.length})</summary>
      <div style={{marginTop:12}}>
        {ajustes.map(a=>(
          <div key={a.fecha} style={{fontSize:13,color:C.textSecond,padding:"6px 0",borderBottom:`1px solid ${C.border}`}}>
            <strong style={{color:C.textPrimary}}>{formatDate(a.fecha)}</strong>
            {a.misionAjuste && <div>Misión: {a.misionAjuste}</div>}
            {a.visionAjuste && <div>Visión: {a.visionAjuste}</div>}
          </div>
        ))}
      </div>
    </details>
  );
}
