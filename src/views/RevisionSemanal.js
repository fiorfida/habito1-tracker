import { useState, useEffect, useRef } from "react";
import { C, card, inp, btnPrimario } from "../theme";
import { SLabel } from "../components/ui";
import { MatrizDecision } from "../components/Chispa";
import { MISION, VISION_ALT, ROLES } from "../content/contenido";
import { formatDate, dayOfWeek, todayBsAs } from "../lib/fechas";
import { mergeMetas } from "../lib/metas";
import { nuevoId } from "../lib/datos";
import {
  PASOS, OBJETIVO_CAPACIDAD, LIMITE_DIVIDIR_MIN, CUADRANTES, diasDe, metasPrevistas, datosSemana,
  itemsActivos, horas, hs, demandaMin, disponibleMin, tiempoPorRol, cargaPorDia, sinDia, parsearResumen,
} from "../lib/semanal";

// ─── Piezas chicas ─────────────────────────────────────────────────────
const nombreRol = (num) => ROLES.find(r => r.num === num)?.nombre || `Rol ${num}`;
const chip = (activo, color=C.navy, bg=C.celestePale) => ({
  padding:"6px 12px", borderRadius:8, border:`1px solid ${activo?color:C.border}`, cursor:"pointer",
  background:activo?bg:C.surfaceAlt, color:activo?color:C.textMuted, fontSize:12, fontWeight:600, fontFamily:"inherit",
});
const btnLink = { background:"none", border:"none", color:C.celeste, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit", padding:0 };
const sub = { fontSize:12, color:C.textMuted, marginBottom:10 };
function Pendiente({children}){
  return <div style={{fontSize:12,color:C.textMuted,fontStyle:"italic",background:C.surfaceAlt,borderRadius:8,padding:"8px 10px"}}>{children}</div>;
}
function Barra({pct, color=C.celeste}){
  return (
    <div style={{height:8,background:C.surfaceAlt,borderRadius:4,overflow:"hidden"}}>
      <div style={{height:"100%",width:Math.min(100,pct)+"%",background:color,borderRadius:4}}/>
    </div>
  );
}
function Opciones({valor, opciones, onChange}){
  return (
    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
      {opciones.map(o=>(
        <button key={o.v} onClick={()=>onChange(valor===o.v?null:o.v)} style={chip(valor===o.v,o.color,o.bg)}>{o.t}</button>
      ))}
    </div>
  );
}
const SI_PARCIAL_NO = [
  {v:"si", t:"Sí", color:C.yes, bg:C.yesBg}, {v:"parcial", t:"Parcial", color:C.warn, bg:C.warnBg}, {v:"no", t:"No", color:C.no, bg:C.noBg},
];

function revInicial(doc){
  return {
    v:2, estado:"borrador", paso:1, minutos:0, realizado:{},
    reflexion:{ preocupaciones:[], libre:"", intencion:"" },
    ...(doc?.v===2 ? doc : {}),
  };
}
function planInicial(doc, W){
  const metas = mergeMetas(doc?.metas);
  return {
    semanaRevisada:W, items:[], capacidad:{}, agendadoPorRol:{}, tareaClave:{}, decisiones:[],
    excesoAceptado:false, ext:{ calendar:null, clickup:null },
    ...(doc||{}), metas,
    items: sincronizarMetas(doc?.items||[], metas),
  };
}

// Mantiene un ítem de inventario por cada meta escrita (origen "meta").
function sincronizarMetas(items, metas){
  const vistos = new Set();
  const nuevos = items.flatMap(i => {
    if (i.origen !== "meta") return [i];
    const texto = metas[i.rol]?.[i.metaIdx];
    if (!texto || !texto.trim()) return [];
    vistos.add(`${i.rol}-${i.metaIdx}`);
    return [{...i, titulo:texto.trim()}];
  });
  // Las partes de una meta borrada se van con ella.
  const ids = new Set(nuevos.map(i=>i.id));
  const conPadre = nuevos.filter(i => !i.padreId || ids.has(i.padreId));
  ROLES.forEach(r => (metas[r.num]||[]).forEach((t, idx) => {
    if (t && t.trim() && !vistos.has(`${r.num}-${idx}`)) {
      conPadre.push({ id:nuevoId(), titulo:t.trim(), rol:r.num, origen:"meta", metaIdx:idx,
        cuadrante:"II", minutos:60, tipo:"flexible", dia:null, hora:"", acerca:true, estado:"planificado" });
    }
  }));
  return conPadre;
}

// ─── Asistente ─────────────────────────────────────────────────────────
export default function RevisionSemanal(props){
  const { W, P, revDoc, planDoc, planLog, semanaLog, registros, mananaLog, todos, pesos, onGuardar, onTodo } = props;
  const [rev, setRev]   = useState(()=>revInicial(revDoc));
  const [plan, setPlan] = useState(()=>planInicial(planDoc, W));
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState(null);
  const t0 = useRef(Date.now());
  const [, tick] = useState(0);
  useEffect(()=>{ const id=setInterval(()=>tick(n=>n+1),30000); return ()=>clearInterval(id); },[]);

  const paso = rev.paso || 1;
  const minutosTotales = (rev.minutos||0) + Math.floor((Date.now()-t0.current)/60000);
  const setRefl = (c) => setRev(r=>({...r, reflexion:{...r.reflexion, ...c}}));
  const setItems = (fn) => setPlan(p=>({...p, items: fn(p.items)}));
  const setItem = (id, c) => setItems(items=>items.map(i=>i.id===id?{...i,...c}:i));

  const guardar = async (cambiosRev={}) => {
    setGuardando(true);
    const ahora = Date.now();
    const nuevoRev = { ...rev, ...cambiosRev,
      minutos:(rev.minutos||0)+Math.round((ahora-t0.current)/60000),
      datos: datosSemana(W, registros, mananaLog), ts:todayBsAs() };
    t0.current = ahora;
    const nuevoPlan = { ...plan, items: sincronizarMetas(plan.items, plan.metas) };
    setRev(nuevoRev); setPlan(nuevoPlan);
    const ok = await onGuardar(nuevoRev, nuevoPlan);
    setGuardando(false);
    return ok;
  };

  const disp = disponibleMin(plan.capacidad, P);
  const objetivo = Math.round(disp*OBJETIVO_CAPACIDAD);
  const dem = demandaMin(plan.items);
  const excedido = disp>0 && dem>objetivo;

  const irA = async (n) => {
    setError(null);
    if (n>paso && paso===6 && excedido && !plan.excesoAceptado) {
      setError("La demanda supera el 80% de tu capacidad. Postergá ítems o marcá que lo decidís conscientemente.");
      return;
    }
    if (paso===5) setPlan(p=>({...p, items: sincronizarMetas(p.items, p.metas)}));
    await guardar({ paso:n });
    window.scrollTo(0,0);
  };
  const finalizar = async () => {
    if (await guardar({ estado:"completa", paso:7 })) { setAviso("✓ Revisión completa y plan guardado."); }
  };

  const ctx = { W, P, rev, setRev, setRefl, plan, setPlan, setItems, setItem, planLog, semanaLog, registros, mananaLog, todos, onTodo, pesos,
    disp, objetivo, dem, excedido };

  return (
    <div>
      <div style={{...card,padding:"12px 16px",marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:6,fontSize:12,color:C.textSecond}}>
          <span>Revisión {formatDate(W)} al {formatDate(diasDe(W)[6])} · Plan {formatDate(P)} al {formatDate(diasDe(P)[6])}</span>
          <span>⏱ {minutosTotales} min{rev.estado==="completa"?" · ✓ completa":""}</span>
        </div>
        <div style={{display:"flex",gap:4,marginTop:10}}>
          {PASOS.map((t,i)=>(
            <button key={i} onClick={()=>irA(i+1)} title={t} style={{flex:1,height:28,borderRadius:6,border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:700,
              background:i+1===paso?C.navy:i+1<paso?C.celestePale:C.surfaceAlt,color:i+1===paso?C.white:i+1<paso?C.navy:C.textMuted}}>{i+1}</button>
          ))}
        </div>
      </div>

      <div style={{fontSize:20,fontFamily:"'Playfair Display',serif",color:C.navy,margin:"4px 0 14px"}}>{paso}. {PASOS[paso-1]}</div>

      {paso===1 && <Paso1/>}
      {paso===2 && <Paso2 {...ctx}/>}
      {paso===3 && <Paso3 {...ctx}/>}
      {paso===4 && <Paso4 {...ctx}/>}
      {paso===5 && <Paso5 {...ctx}/>}
      {paso===6 && <Paso6 {...ctx}/>}
      {paso===7 && <Paso7 {...ctx} onFinalizar={finalizar} aviso={aviso} guardando={guardando}/>}

      {error && <div style={{fontSize:13,color:C.no,margin:"8px 0"}}>{error}</div>}
      <div style={{display:"flex",gap:8,marginTop:16,flexWrap:"wrap"}}>
        {paso>1 && <button onClick={()=>irA(paso-1)} style={{...btnPrimario,flex:"1 1 120px",background:C.surfaceAlt,color:C.textSecond}}>← Anterior</button>}
        <button onClick={async()=>{ if(await guardar()) setAviso("✓ Guardado. Podés retomar cuando quieras."); }}
          style={{...btnPrimario,flex:"1 1 120px",background:C.surface,color:C.navy,border:`1px solid ${C.border}`}}>{guardando?"Guardando…":"Guardar"}</button>
        {paso<7 && <button onClick={()=>irA(paso+1)} style={{...btnPrimario,flex:"1 1 120px"}}>Siguiente →</button>}
      </div>
      {aviso && paso<7 && <div style={{fontSize:12,color:C.yes,marginTop:8}}>{aviso}</div>}
    </div>
  );
}

// ─── 1. Reconexión ─────────────────────────────────────────────────────
function Paso1(){
  return (
    <>
      <div style={sub}>Lectura breve antes de mirar números.</div>
      <div style={card}>
        <SLabel>✦ Misión personal</SLabel>
        <div style={{fontSize:14,color:C.textSecond,lineHeight:1.7,whiteSpace:"pre-line"}}>{MISION}</div>
      </div>
      <div style={card}>
        <SLabel>✦ Visión personal — 5 años</SLabel>
        <img src={`${process.env.PUBLIC_URL}/vision.webp`} alt={VISION_ALT} style={{width:"100%",height:"auto",display:"block",borderRadius:8}}/>
      </div>
    </>
  );
}

// ─── 2. Datos de la semana ─────────────────────────────────────────────
function Paso2({W, registros, mananaLog}){
  const d = datosSemana(W, registros, mananaLog);
  const Metrica = ({t,v}) => (
    <div style={{flex:"1 1 90px",background:C.surfaceAlt,borderRadius:8,padding:"10px 12px"}}>
      <div style={{fontSize:11,color:C.textMuted}}>{t}</div>
      <div style={{fontSize:22,fontWeight:700,color:C.navy}}>{v}</div>
    </div>
  );
  const Dia = ({x, bueno}) => (
    <div style={{padding:"8px 0",borderBottom:`1px solid ${C.border}`}}>
      <span style={{fontSize:12,fontWeight:700,padding:"2px 8px",borderRadius:12,background:bueno?C.yesBg:C.noBg,color:bueno?C.yes:C.no}}>{x.dia} {formatDate(x.fecha)} · {x.puntos}/4</span>
      {x.nota && <div style={{fontSize:12,color:C.textSecond,marginTop:4}}>{x.nota}</div>}
    </div>
  );
  return (
    <>
      <div style={card}>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <Metrica t="Noches registradas" v={`${d.noches}/7`}/>
          <Metrica t="Score (H1 + H2)" v={d.score===null?"—":`${d.score}%`}/>
          <Metrica t="Mañanas" v={`${d.mananas}/7`}/>
        </div>
      </div>
      <div className="grid-2">
        <div style={card}>
          <SLabel>Días más proactivos</SLabel>
          {d.proactivos.length ? d.proactivos.map(x=><Dia key={x.fecha} x={x} bueno/>) : <Pendiente>Sin días con 3/4 o más.</Pendiente>}
        </div>
        <div style={card}>
          <SLabel>Días más reactivos</SLabel>
          {d.reactivos.length ? d.reactivos.map(x=><Dia key={x.fecha} x={x}/>) : <Pendiente>Sin días con 2/4 o menos.</Pendiente>}
        </div>
      </div>
      <div style={card}>
        <SLabel>Compromisos diarios y tarea clave</SLabel>
        <Pendiente>Pendiente de carga — se registran en la Mañana y la Noche desde la Fase 3.</Pendiente>
      </div>
    </>
  );
}

// ─── 3. Realizado vs. plan ─────────────────────────────────────────────
function Paso3({W, rev, setRev, planLog, semanaLog}){
  const previstas = metasPrevistas(W, planLog, semanaLog);
  const setRol = (num, c) => setRev(r=>({...r, realizado:{...r.realizado, [num]:{...(r.realizado?.[num]||{}), ...c}}}));
  const hayMetas = ROLES.some(r=>(previstas?.[r.num]||[]).some(t=>t&&t.trim()));
  return (
    <>
      <div style={card}>
        <SLabel>Plan trimestral — previsto para esta semana</SLabel>
        <Pendiente>Pendiente de carga — el plan trimestral se carga en la Fase 4.</Pendiente>
      </div>
      {!hayMetas ? (
        <div style={card}>
          <SLabel>Metas de la semana</SLabel>
          <Pendiente>No hay metas previstas para esta semana: la revisión anterior no se hizo en el tracker.</Pendiente>
          <textarea value={rev.realizado?.general?.nota||""} onChange={e=>setRol("general",{nota:e.target.value})}
            placeholder="Qué avancé esta semana (opcional)" rows={3} style={{...inp,resize:"vertical",fontSize:13,marginTop:10}}/>
        </div>
      ) :
      <div className="roles-grid">
        {ROLES.map(r=>{
          const metas = (previstas?.[r.num]||[]).map((t,idx)=>({t,idx})).filter(x=>x.t&&x.t.trim());
          const est = rev.realizado?.[r.num] || {};
          return (
            <div key={r.num} style={card}>
              <div style={{fontSize:14,fontWeight:600,color:C.textPrimary,marginBottom:8}}>{r.num} · {r.nombre}</div>
              {metas.length===0 ? <Pendiente>Sin metas previstas para esta semana.</Pendiente> : metas.map(m=>(
                <div key={m.idx} style={{marginBottom:10}}>
                  <div style={{fontSize:13,color:C.textSecond,marginBottom:6}}>{m.t}</div>
                  <Opciones valor={est.metas?.[m.idx]} opciones={SI_PARCIAL_NO}
                    onChange={v=>setRol(r.num,{metas:{...(est.metas||{}), [m.idx]:v}})}/>
                </div>
              ))}
              <textarea value={est.nota||""} onChange={e=>setRol(r.num,{nota:e.target.value})} placeholder="Qué avancé (opcional)"
                rows={2} style={{...inp,resize:"none",fontSize:13,marginTop:4}}/>
            </div>
          );
        })}
      </div>}
    </>
  );
}

// ─── 4. Reflexión semanal ──────────────────────────────────────────────
function Paso4({rev, setRefl}){
  const [nueva, setNueva] = useState("");
  const pre = rev.reflexion.preocupaciones || [];
  const agregar = () => { if(!nueva.trim()) return; setRefl({preocupaciones:[...pre, {id:nuevoId(), texto:nueva.trim(), control:null}]}); setNueva(""); };
  return (
    <>
      <div style={card}>
        <SLabel>Círculo de influencia — qué me preocupó esta semana</SLabel>
        {pre.map(p=>(
          <div key={p.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,flexWrap:"wrap",padding:"8px 0",borderBottom:`1px solid ${C.border}`}}>
            <span style={{fontSize:13,color:C.textPrimary,flex:"1 1 160px"}}>{p.texto}</span>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <Opciones valor={p.control===null?null:p.control?"si":"no"}
                opciones={[{v:"si",t:"En mi control",color:C.yes,bg:C.yesBg},{v:"no",t:"No en mi control",color:C.textSecond,bg:C.surfaceAlt}]}
                onChange={v=>setRefl({preocupaciones:pre.map(x=>x.id===p.id?{...x,control:v===null?null:v==="si"}:x)})}/>
              <button onClick={()=>setRefl({preocupaciones:pre.filter(x=>x.id!==p.id)})} style={{...btnLink,color:C.textMuted}} aria-label="Quitar">✕</button>
            </div>
          </div>
        ))}
        <div style={{display:"flex",gap:8,marginTop:10}}>
          <input value={nueva} onChange={e=>setNueva(e.target.value)} onKeyDown={e=>e.key==="Enter"&&agregar()} placeholder="Algo que me preocupó" style={{...inp,fontSize:13}}/>
          <button onClick={agregar} style={{...btnPrimario,width:"auto",padding:"10px 16px",fontSize:13}}>Agregar</button>
        </div>
      </div>
      <div style={card}>
        <SLabel>Reflexión libre</SLabel>
        <textarea value={rev.reflexion.libre} onChange={e=>setRefl({libre:e.target.value})} rows={5} style={{...inp,resize:"vertical",fontSize:13,lineHeight:1.5}}/>
      </div>
      <div style={card}>
        <SLabel>Intención concreta para la semana siguiente</SLabel>
        <input value={rev.reflexion.intencion} onChange={e=>setRefl({intencion:e.target.value})} placeholder="Una línea" style={{...inp,fontSize:13}}/>
      </div>
    </>
  );
}

// ─── 5. Qué necesita cada rol + inventario ─────────────────────────────
function Paso5({P, plan, setPlan, setItems, setItem, todos, onTodo}){
  const setMeta = (num, idx, v) => setPlan(p=>{
    const metas = {...p.metas, [num]:p.metas[num].map((x,i)=>i===idx?v:x)};
    return {...p, metas, items:sincronizarMetas(p.items, metas)};
  });
  const abiertos = Object.entries(todos||{}).map(([id,t])=>({id,...t})).filter(t=>t.estado==="abierto");
  const enInventario = new Set(plan.items.filter(i=>i.pendienteId).map(i=>i.pendienteId));
  const agregarTodo = (t) => {
    setItems(items=>[...items, { id:nuevoId(), titulo:t.texto, rol:t.rol, origen:"pendiente", pendienteId:t.id,
      cuadrante:"II", minutos:60, tipo:"flexible", dia:null, hora:"", acerca:true, estado:"planificado" }]);
    onTodo(t.id, {estado:"planificado", semana:P});
  };
  const agregarCompromiso = () => setItems(items=>[...items, { id:nuevoId(), titulo:"", rol:"1", origen:"compromiso",
    cuadrante:"II", minutos:60, tipo:"fijo", dia:null, hora:"", acerca:true, estado:"planificado" }]);
  const items = plan.items;

  return (
    <>
      <div style={sub}>¿Qué necesita este rol de mí esta semana para avanzar hacia su imagen de destino? 2-3 metas por rol.</div>
      <div className="roles-grid">
        {ROLES.map(r=>{
          const delRol = abiertos.filter(t=>t.rol===r.num && !enInventario.has(t.id));
          return (
            <div key={r.num} style={card}>
              <div style={{fontSize:14,fontWeight:600,color:C.textPrimary,marginBottom:8}}>{r.num} · {r.nombre}</div>
              <div style={{fontSize:11,color:C.textMuted,marginBottom:6}}>Insumos: plan trimestral y objetivos anuales — pendiente de carga (Fase 4)</div>
              {delRol.length>0 && (
                <div style={{marginBottom:8}}>
                  {delRol.map(t=>(
                    <div key={t.id} style={{display:"flex",justifyContent:"space-between",gap:8,fontSize:12,color:C.textSecond,padding:"3px 0"}}>
                      <span>☐ {t.texto}</span>
                      <button onClick={()=>agregarTodo(t)} style={{...btnLink,fontSize:12,whiteSpace:"nowrap"}}>+ inventario</button>
                    </div>
                  ))}
                </div>
              )}
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {[0,1,2].map(idx=>(
                  <input key={idx} value={plan.metas[r.num][idx]} onChange={e=>setMeta(r.num,idx,e.target.value)}
                    placeholder={idx===0?"Meta 1":`Meta ${idx+1} (opcional)`} style={{...inp,fontSize:13,padding:"8px 10px"}}/>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{...card,marginTop:6}}>
        <SLabel>Inventario de la semana — metas + compromisos + pendientes</SLabel>
        <div style={sub}>Los eventos que ya están en tu Calendar no se cargan acá: se descuentan de la capacidad en el paso 6.</div>
        {items.filter(i=>!i.padreId).map(i=>(
          <ItemInventario key={i.id} item={i} P={P} hijos={items.filter(h=>h.padreId===i.id)} setItem={setItem} setItems={setItems} onTodo={onTodo}/>
        ))}
        <button onClick={agregarCompromiso} style={{...btnLink,marginTop:10}}>+ Agregar compromiso</button>
      </div>
    </>
  );
}

function ItemInventario({item:i, P, hijos, setItem, setItems, onTodo}){
  const dias = diasDe(P);
  const fuera = i.estado!=="planificado" && i.estado!=="postergado";
  const revisar = i.cuadrante==="III" || i.cuadrante==="IV";
  const dividir = () => {
    const mitad = Math.round((i.minutos||0)/2/30)*30 || 30;
    setItems(items=>[...items,
      {...i, id:nuevoId(), padreId:i.id, titulo:`${i.titulo} (parte 1)`, minutos:mitad, origen:"parte", tipo:"flexible", dia:null, hora:""},
      {...i, id:nuevoId(), padreId:i.id, titulo:`${i.titulo} (parte 2)`, minutos:(i.minutos||0)-mitad, origen:"parte", tipo:"flexible", dia:null, hora:""}]);
  };
  const setAccion = (accion) => {
    const estado = accion ? {eliminar:"eliminado", delegar:"delegado", no:"rechazado"}[accion] : "planificado";
    setItem(i.id, {accion, estado});
    if (i.pendienteId) onTodo(i.pendienteId, {estado: accion==="delegar"?"delegado":accion?"descartado":"planificado"});
  };
  const sel = {...inp, fontSize:12, padding:"6px 8px", width:"auto"};
  return (
    <div style={{padding:"12px 0",borderBottom:`1px solid ${C.border}`,opacity:fuera?0.55:1}}>
      <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:6}}>
        <span style={{fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",minWidth:62}}>{{meta:"Meta",compromiso:"Compromiso",pendiente:"Pendiente"}[i.origen]}</span>
        {i.origen==="meta"
          ? <span style={{fontSize:13,fontWeight:600,color:C.textPrimary}}>{i.titulo}</span>
          : <input value={i.titulo} onChange={e=>setItem(i.id,{titulo:e.target.value})} placeholder="Qué" style={{...inp,fontSize:13,padding:"6px 8px"}}/>}
      </div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
        <select value={i.rol} disabled={i.origen==="meta"} onChange={e=>setItem(i.id,{rol:e.target.value})} style={sel}>
          {ROLES.map(r=><option key={r.num} value={r.num}>Rol {r.num}</option>)}
        </select>
        <select value={i.cuadrante} onChange={e=>setItem(i.id,{cuadrante:e.target.value})} style={sel}>
          {CUADRANTES.map(q=><option key={q} value={q}>Q {q}</option>)}
        </select>
        {hijos.length===0 && (
          <label style={{fontSize:12,color:C.textSecond,display:"flex",alignItems:"center",gap:4}}>
            <input type="number" min={0.5} step={0.5} value={horas(i.minutos)} onChange={e=>setItem(i.id,{minutos:Math.round((parseFloat(e.target.value)||0)*60)})} style={{...sel,width:64}}/> h
          </label>
        )}
        <select value={i.tipo} onChange={e=>setItem(i.id,{tipo:e.target.value, dia:null, hora:""})} style={sel}>
          <option value="fijo">Horario prefijado</option><option value="flexible">A asignar espacio</option>
        </select>
        {i.tipo==="fijo" && hijos.length===0 && (<>
          <select value={i.dia||""} onChange={e=>setItem(i.id,{dia:e.target.value||null})} style={sel}>
            <option value="">Día</option>{dias.map(d=><option key={d} value={d}>{dayOfWeek(d)} {formatDate(d).slice(0,5)}</option>)}
          </select>
          <input type="time" value={i.hora||""} onChange={e=>setItem(i.id,{hora:e.target.value})} style={sel}/>
        </>)}
        {revisar && <span style={{fontSize:11,fontWeight:700,padding:"3px 8px",borderRadius:10,background:C.warnBg,color:C.warn}}>Q {i.cuadrante} · revisar</span>}
      </div>
      <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",marginTop:8}}>
        <span style={{fontSize:12,color:C.textSecond}}>¿Me acerca a mi misión, visión y objetivos?</span>
        <Opciones valor={i.acerca===false?"no":"si"} opciones={[{v:"si",t:"Sí",color:C.yes,bg:C.yesBg},{v:"no",t:"No",color:C.no,bg:C.noBg}]}
          onChange={v=>{ const acerca = v!=="no"; setItem(i.id,{acerca}); if (acerca) setAccion(null); }}/>
      </div>
      {i.acerca===false && (
        <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap",marginTop:8}}>
          <Opciones valor={i.accion||null} opciones={[{v:"eliminar",t:"Eliminar",color:C.no,bg:C.noBg},{v:"delegar",t:"Delegar",color:C.celeste,bg:C.celestePale},{v:"no",t:"Decir que no",color:C.warn,bg:C.warnBg}]} onChange={setAccion}/>
          {i.accion==="delegar" && <input value={i.delegadoA||""} onChange={e=>setItem(i.id,{delegadoA:e.target.value})} placeholder="¿A quién?" style={{...inp,fontSize:12,padding:"6px 8px",width:160}}/>}
        </div>
      )}
      {hijos.length===0 && (i.minutos||0)>LIMITE_DIVIDIR_MIN && !fuera && (
        <div style={{fontSize:12,color:C.warn,marginTop:8}}>
          Más de 3 h: conviene dividirlo en sub-actividades. <button onClick={dividir} style={{...btnLink,fontSize:12}}>Dividir</button>
        </div>
      )}
      {hijos.length>0 && (
        <div style={{marginTop:8,paddingLeft:12,borderLeft:`3px solid ${C.celestePale}`}}>
          <div style={{fontSize:11,color:C.textMuted,marginBottom:4}}>Dividido en {hijos.length} partes · {hs(hijos.reduce((a,h)=>a+(h.minutos||0),0))} h</div>
          {hijos.map(h=>(
            <div key={h.id} style={{display:"flex",gap:6,alignItems:"center",marginBottom:4}}>
              <input value={h.titulo} onChange={e=>setItem(h.id,{titulo:e.target.value})} style={{...inp,fontSize:12,padding:"6px 8px"}}/>
              <input type="number" min={0.5} step={0.5} value={horas(h.minutos)} onChange={e=>setItem(h.id,{minutos:Math.round((parseFloat(e.target.value)||0)*60)})} style={{...sel,width:64}}/>
              <span style={{fontSize:12,color:C.textMuted}}>h</span>
              <button onClick={()=>setItems(items=>items.filter(x=>x.id!==h.id))} style={{...btnLink,color:C.textMuted}} aria-label="Quitar parte">✕</button>
            </div>
          ))}
          <button onClick={()=>setItems(items=>[...items,{...hijos[0], id:nuevoId(), titulo:`${i.titulo} (parte ${hijos.length+1})`, minutos:60, dia:null, hora:""}])} style={{...btnLink,fontSize:12}}>+ parte</button>
        </div>
      )}
      {i.origen!=="meta" && <button onClick={()=>setItems(items=>items.filter(x=>x.id!==i.id&&x.padreId!==i.id))} style={{...btnLink,fontSize:12,color:C.textMuted,marginTop:6}}>Quitar del inventario</button>}
    </div>
  );
}

// ─── 6. Capacidad y priorización ───────────────────────────────────────
const FORMATO_RESUMEN = `Dom 27/09: 5,5 h libres
Lun 28/09: 3 h libres
…
Rol 6: 22 h agendadas
Rol 3: 4 h agendadas`;

function Paso6({P, plan, setPlan, setItem, pesos, disp, objetivo, dem, excedido}){
  const dias = diasDe(P);
  const [pegado, setPegado] = useState("");
  const [resultado, setResultado] = useState(null);
  const [matriz, setMatriz] = useState(false);
  const aplicar = () => {
    const r = parsearResumen(pegado, P);
    setPlan(p=>({...p, capacidad:{...p.capacidad, ...r.capacidad}, agendadoPorRol:{...p.agendadoPorRol, ...r.agendado}}));
    setResultado(r);
  };
  const activos = itemsActivos(plan.items);
  const orden = {IV:0, III:1, I:2, II:3};
  const candidatos = [...activos].sort((a,b)=>orden[a.cuadrante]-orden[b.cuadrante]);
  const postergados = plan.items.filter(i=>i.estado==="postergado");
  const porRol = tiempoPorRol(plan.items, plan.agendadoPorRol);
  const carga = cargaPorDia(plan.items, P);
  const flexSinDia = sinDia(plan.items).filter(i=>i.tipo!=="fijo");
  const fijosSinDia = sinDia(plan.items).filter(i=>i.tipo==="fijo");
  const numero = (v) => Math.max(0, parseFloat(String(v).replace(",","."))||0);
  const sel = {...inp, fontSize:12, padding:"6px 8px", width:"auto"};

  return (
    <>
      <div style={card}>
        <SLabel>Pegar resumen de Claude</SLabel>
        <div style={sub}>En la sesión del sábado te paso tus horas libres (06:00 a 22:00, sin eventos del Calendar) y lo ya agendado por rol, en este formato:</div>
        <textarea value={pegado} onChange={e=>setPegado(e.target.value)} placeholder={FORMATO_RESUMEN} rows={5} style={{...inp,resize:"vertical",fontSize:12,fontFamily:"monospace"}}/>
        <button onClick={aplicar} style={{...btnLink,marginTop:8}}>Aplicar</button>
        {resultado && (
          <div style={{fontSize:12,marginTop:6,color:resultado.errores.length?C.warn:C.yes}}>
            {Object.keys(resultado.capacidad).length} días y {Object.keys(resultado.agendado).length} roles cargados.
            {resultado.errores.length>0 && <> Sin reconocer: {resultado.errores.join(" · ")}</>}
          </div>
        )}
      </div>

      <div className="grid-2">
        <div style={card}>
          <SLabel>Horas libres por día</SLabel>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4}}>
            {dias.map(d=>(
              <label key={d} style={{fontSize:11,color:C.textSecond,textAlign:"center"}}>
                {dayOfWeek(d)}<br/>{formatDate(d).slice(0,5)}
                <input type="number" min={0} step={0.5} value={plan.capacidad[d]??""} onChange={e=>setPlan(p=>({...p,capacidad:{...p.capacidad,[d]:numero(e.target.value)}}))}
                  style={{...inp,fontSize:12,padding:"6px 2px",textAlign:"center",marginTop:4}}/>
              </label>
            ))}
          </div>
        </div>
        <div style={card}>
          <SLabel>Ya agendado por rol (Calendar)</SLabel>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
            {ROLES.map(r=>(
              <label key={r.num} style={{fontSize:11,color:C.textSecond}}>Rol {r.num}
                <input type="number" min={0} step={0.5} value={plan.agendadoPorRol[r.num]??""} onChange={e=>setPlan(p=>({...p,agendadoPorRol:{...p.agendadoPorRol,[r.num]:numero(e.target.value)}}))}
                  style={{...inp,fontSize:12,padding:"6px 4px",textAlign:"center",marginTop:2}}/>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div style={{...card, border:`1px solid ${excedido?C.warn:C.border}`, background:excedido?C.warnBg:C.surface}}>
        <div style={{display:"flex",gap:16,flexWrap:"wrap",fontSize:13,color:C.textSecond}}>
          <span>Libres: <strong>{hs(disp)} h</strong></span>
          <span>Objetivo 80%: <strong>{hs(objetivo)} h</strong></span>
          <span style={{color:excedido?C.warn:C.yes}}>Demandadas: <strong>{hs(dem)} h</strong></span>
        </div>
        <div style={{fontSize:11,color:C.textMuted,marginTop:4}}>Planificar al 80% de la capacidad es un criterio personal: deja espacio para imprevistos y personas.</div>
        {disp===0 && <div style={{fontSize:12,color:C.textMuted,marginTop:8}}>Cargá las horas libres para calcular la capacidad.</div>}
        {excedido && (
          <div style={{marginTop:12}}>
            <div style={{fontSize:13,fontWeight:600,color:C.warn,marginBottom:6}}>Superás el 80% por {hs(dem-objetivo)} h. Elegí qué postergar (primero lo que no es Cuadrante II):</div>
            {candidatos.map(i=>(
              <div key={i.id} style={{display:"flex",justifyContent:"space-between",gap:8,fontSize:12,padding:"4px 0"}}>
                <span>Q {i.cuadrante} · {i.titulo || "(sin título)"} · {hs(i.minutos)} h</span>
                <button onClick={()=>setItem(i.id,{estado:"postergado"})} style={{...btnLink,fontSize:12}}>Postergar</button>
              </div>
            ))}
            <label style={{display:"flex",gap:6,alignItems:"center",fontSize:12,color:C.textSecond,marginTop:8}}>
              <input type="checkbox" checked={!!plan.excesoAceptado} onChange={e=>setPlan(p=>({...p,excesoAceptado:e.target.checked}))}/>
              Mantengo el plan por encima del 80% (lo decido conscientemente)
            </label>
          </div>
        )}
        <button onClick={()=>setMatriz(!matriz)} style={{...btnLink,marginTop:10}}>{matriz?"Ocultar matriz":"Comparar alternativas con la matriz de la chispa"}</button>
        {postergados.length>0 && (
          <div style={{marginTop:10,fontSize:12,color:C.textSecond}}>
            Postergados: {postergados.map(i=>(
              <span key={i.id} style={{marginRight:8}}>{i.titulo} <button onClick={()=>setItem(i.id,{estado:"planificado"})} style={{...btnLink,fontSize:12}}>recuperar</button></span>
            ))}
          </div>
        )}
      </div>
      {matriz && <MatrizDecision pesos={pesos} alternativasIniciales={candidatos.slice(0,3).map(i=>i.titulo)}
        onGuardar={d=>setPlan(p=>({...p, decisiones:[...(p.decisiones||[]), {...d, fecha:todayBsAs()}]}))}/>}
      {(plan.decisiones||[]).length>0 && (
        <div style={card}>
          <SLabel>Decisiones tomadas con la matriz</SLabel>
          {plan.decisiones.map((d,k)=><div key={k} style={{fontSize:13,color:C.textSecond,marginBottom:4}}>{d.contexto} → <strong>{d.elegida}</strong></div>)}
        </div>
      )}

      <div className="grid-2">
        <div style={card}>
          <SLabel>% de tiempo planificado por rol</SLabel>
          {porRol.map(x=>(
            <div key={x.rol.num} style={{marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:C.textSecond,marginBottom:3}}>
                <span>{x.rol.num} · {x.rol.nombre}</span><span>{hs(x.min)} h · {x.pct}%</span>
              </div>
              <Barra pct={x.pct}/>
            </div>
          ))}
        </div>
        <div style={card}>
          <SLabel>¿Me dan los días?</SLabel>
          {carga.map(c=>{
            const cap = (Number(plan.capacidad[c.fecha])||0)*60, total = c.fijos+c.flexibles;
            const pct = cap ? total/cap*100 : (total?100:0);
            return (
              <div key={c.fecha} style={{marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:C.textSecond,marginBottom:3}}>
                  <span>{dayOfWeek(c.fecha)} {formatDate(c.fecha).slice(0,5)}</span>
                  <span style={{color:total>cap?C.no:C.textSecond}}>{hs(total)} / {hs(cap)} h</span>
                </div>
                <Barra pct={pct} color={total>cap?C.no:C.celeste}/>
              </div>
            );
          })}
          {fijosSinDia.length>0 && <div style={{fontSize:12,color:C.warn,marginTop:6}}>Horario prefijado sin día: {fijosSinDia.map(i=>i.titulo).join(", ")} (asignalo en el paso 5).</div>}
          {flexSinDia.length>0 && (
            <div style={{marginTop:10}}>
              <div style={{fontSize:12,fontWeight:600,color:C.textPrimary,marginBottom:4}}>A asignar espacio · elegí el día</div>
              {flexSinDia.map(i=>(
                <div key={i.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,fontSize:12,padding:"3px 0"}}>
                  <span>{i.titulo} · {hs(i.minutos)} h</span>
                  <select value="" onChange={e=>setItem(i.id,{dia:e.target.value||null})} style={sel}>
                    <option value="">Día</option>{dias.map(d=><option key={d} value={d}>{dayOfWeek(d)} {formatDate(d).slice(0,5)}</option>)}
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── 7. Plan semanal ───────────────────────────────────────────────────
function Paso7({P, rev, plan, setPlan, setItem, onFinalizar, aviso, guardando}){
  const dias = diasDe(P);
  const activos = itemsActivos(plan.items);
  const sel = {...inp, fontSize:12, padding:"6px 8px", width:"auto"};
  return (
    <>
      <div style={card}>
        <SLabel>Metas por rol · semana {formatDate(P)} al {formatDate(dias[6])}</SLabel>
        {ROLES.map(r=>{
          const m = (plan.metas[r.num]||[]).filter(x=>x&&x.trim());
          return (
            <div key={r.num} style={{display:"flex",gap:8,fontSize:13,padding:"4px 0"}}>
              <span style={{color:C.celeste,fontWeight:600,minWidth:150,flexShrink:0}}>{r.nombre}</span>
              <span style={{color:m.length?C.textSecond:C.textMuted}}>{m.length?m.join(" · "):"—"}</span>
            </div>
          );
        })}
      </div>
      <div style={card}>
        <SLabel>Bloques para lo importante y tarea clave por día</SLabel>
        {dias.map(d=>{
          const delDia = activos.filter(i=>i.dia===d).sort((a,b)=>(a.hora||"99").localeCompare(b.hora||"99"));
          return (
            <div key={d} style={{padding:"10px 0",borderBottom:`1px solid ${C.border}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                <span style={{fontSize:13,fontWeight:700,color:C.navy}}>{dayOfWeek(d)} {formatDate(d)}</span>
                <select value={plan.tareaClave?.[d]||""} onChange={e=>setPlan(p=>({...p,tareaClave:{...p.tareaClave,[d]:e.target.value}}))} style={sel}>
                  <option value="">Tarea clave (opcional)</option>
                  {delDia.map(i=><option key={i.id} value={i.id}>{i.titulo}</option>)}
                </select>
              </div>
              {delDia.length===0 ? <div style={{fontSize:12,color:C.textMuted,marginTop:4}}>Sin bloques.</div> : delDia.map(i=>(
                <div key={i.id} style={{display:"flex",gap:8,alignItems:"center",fontSize:12,color:C.textSecond,marginTop:6}}>
                  {i.tipo==="fijo" ? <span style={{minWidth:70}}>{i.hora||"—"}</span>
                    : <input type="time" value={i.hora||""} onChange={e=>setItem(i.id,{hora:e.target.value})} style={{...sel,width:90}}/>}
                  <span>{plan.tareaClave?.[d]===i.id?"★ ":""}{i.titulo} · {hs(i.minutos)} h · Rol {i.rol}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
      {plan.items.some(i=>i.estado!=="planificado") && (
        <div style={card}>
          <SLabel>Fuera del plan</SLabel>
          {[["postergado","Postergado"],["delegado","Delegado"],["rechazado","Dije que no"],["eliminado","Eliminado"]].map(([e,t])=>{
            const lista = plan.items.filter(i=>i.estado===e);
            return lista.length>0 && (
              <div key={e} style={{fontSize:13,color:C.textSecond,marginBottom:4}}>
                <strong>{t}:</strong> {lista.map(i=>i.titulo+(e==="delegado"&&i.delegadoA?` (a ${i.delegadoA})`:"")).join(" · ")}
              </div>
            );
          })}
        </div>
      )}
      <div style={{...card,background:C.surfaceAlt}}>
        <div style={{fontSize:12,color:C.textMuted}}>Exportación a Google Drive: se habilita en la Fase 5. El bloqueo en Calendar y la carga en ClickUp los hacés en la sesión con Claude.</div>
      </div>
      {rev.reflexion?.intencion && <div style={{fontSize:13,color:C.navy,margin:"6px 0 12px"}}>Intención de la semana: <em>{rev.reflexion.intencion}</em></div>}
      <button onClick={onFinalizar} style={{...btnPrimario,background:rev.estado==="completa"?C.yes:C.navy}}>
        {guardando?"Guardando…":rev.estado==="completa"?"✓ Revisión completa · guardar cambios":"Finalizar revisión y guardar plan"}
      </button>
      {aviso && <div style={{fontSize:12,color:C.yes,marginTop:8}}>{aviso}</div>}
    </>
  );
}
