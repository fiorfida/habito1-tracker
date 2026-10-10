import { useState } from "react";
import { C, card, inp, btnPrimario } from "../theme";
import { SLabel, FechaInput } from "../components/ui";
import { MatrizDecision } from "../components/Chispa";
import { MISION, VISION_ALT, ROLES, ROLES_TODOS, nombreRol } from "../content/contenido";
import { formatDate, addDays, todayBsAs } from "../lib/fechas";
import { MESES, inicioTrimestral } from "../lib/periodos";
import { tiempoPorRol, esV2, hs } from "../lib/semanal";
import { nuevoId } from "../lib/datos";
import ObjetivosAnio, { objetivosDelAnio } from "./ObjetivosAnio";

const PARTES = ["Evaluar el año", "Reconectar", "Objetivos", "Hábitos e inversiones", "Multiplicar"];
const sub = { fontSize:12, color:C.textMuted, marginBottom:10 };
const pregunta = { fontSize:13, fontWeight:500, color:C.textPrimary, margin:"10px 0 4px", lineHeight:1.5 };
const area = { ...inp, resize:"vertical", fontSize:13, lineHeight:1.5 };
const campo = { ...inp, fontSize:13, padding:"8px 10px" };
const btnLink = { background:"none", border:"none", color:C.celeste, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit", padding:0 };
const pad = (n) => String(n).padStart(2,"0");
const norm = (t) => (t||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/\s+/g," ").trim();

function Pendiente({children}){
  return <div style={{fontSize:12,color:C.textMuted,fontStyle:"italic",background:C.surfaceAlt,borderRadius:8,padding:"8px 10px"}}>{children}</div>;
}
function Opciones({valor, opciones, onChange}){
  return (
    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
      {opciones.map(o=>(
        <button key={o.v} onClick={()=>onChange(valor===o.v?null:o.v)} style={{padding:"5px 10px",borderRadius:8,border:`1px solid ${valor===o.v?o.c:C.border}`,cursor:"pointer",
          background:valor===o.v?o.bg:C.surfaceAlt,color:valor===o.v?o.c:C.textMuted,fontSize:12,fontWeight:600,fontFamily:"inherit"}}>{o.t}</button>
      ))}
    </div>
  );
}
function Preguntas({lista, valores, onChange}){
  return lista.map((q,k)=>(
    <div key={k}>
      <div style={pregunta}>{q}</div>
      <textarea value={valores?.[k]||""} onChange={e=>onChange({...(valores||{}), [k]:e.target.value})} rows={2} style={area}/>
    </div>
  ));
}

// ─── Guía anual de Superhábitos ────────────────────────────────────────
const LOGROS = ["¿Qué salió bien?", "¿Cuándo estuve mejor?", "¿De qué trabajo estoy orgulloso?", "¿Qué retos me hicieron crecer?", "¿Qué acciones o cambios disfruté más?", "¿Cuáles fueron los momentos más emocionantes?"];
const MEJORABLE = ["¿Qué salió mal?", "¿Qué hubiera hecho diferente?", "¿En qué momentos me frenó el miedo?", "¿Cuándo estuve aburrido?", "¿Cuándo me sentí frustrado o trabado?"];
const PERSONAS = ["¿Qué actividades me conectaron con personas inspiradoras?", "¿Con quiénes disfruté pasar tiempo?", "¿Quiénes me ayudaron a lograr mis logros?", "¿Quiénes me obstaculizaron?", "¿De quiénes aprendí las lecciones más valiosas?"];
const CHEQUEO = [
  { id:"vivir",    t:"Vivir",    q:["¿Disfruto mi trabajo?", "¿Tengo energía sostenida?", "¿Estoy en la situación financiera que quiero?", "¿Me siento en control de mi tiempo?", "¿Me siento realizado con lo que hago a diario?"] },
  { id:"amar",     t:"Amar",     q:["¿Comparto con familia y amigos como me gustaría?", "¿Trabajo bien con otros?", "¿Me cuesta por malentendidos o falta de comunicación?"] },
  { id:"aprender", t:"Aprender", q:["¿Estoy aprendiendo y creciendo, o me siento estancado?", "¿Me limita la falta de formación o habilidades?"] },
  { id:"legado",   t:"Dejar un legado", q:["¿Tengo un sentido claro de dirección y propósito?", "¿Tengo claro lo que es importante para mí?"] },
];
const SI_MEDIAS_NO = [{v:"si",t:"Sí",c:C.yes,bg:C.yesBg},{v:"medias",t:"A medias",c:C.warn,bg:C.warnBg},{v:"no",t:"No",c:C.no,bg:C.noBg}];
const CATEGORIAS = [
  {v:"cumplido",t:"Cumplido (100%)",c:C.yes,bg:C.yesBg}, {v:"semi",t:"Semi (30-100%)",c:C.celeste,bg:C.celestePale},
  {v:"incumplido",t:"Incumplido (<30%)",c:C.no,bg:C.noBg}, {v:"descartado",t:"Descartado",c:C.textSecond,bg:C.surfaceAlt},
];
const IMPACTO = [{v:"economico",t:"Económico",c:C.gold,bg:C.goldBg},{v:"emocional",t:"Emocional",c:C.celeste,bg:C.celestePale},{v:"relaciones",t:"Relaciones",c:C.yes,bg:C.yesBg}];
const DIMENSIONES = [{v:"fisica",t:"Física"},{v:"mental",t:"Mental"},{v:"espiritual",t:"Espiritual"},{v:"emocional",t:"Emocional"}];
const TIPOS_INVERSION = ["Objeto","App","Formación","Servicio","Inversión financiera"];

export default function RevisionAnual(props){
  const { Y, doc, onGuardar } = props;
  const [partes, setPartes] = useState(()=>doc?.partes||{});
  const [parte, setParte] = useState(()=>{ const p = doc?.partes||{}; const f = [1,2,3,4,5].find(n=>p[n]?.estado!=="completa"); return f||1; });
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState(null);
  const datos = partes[parte] || {};
  const set = (c) => { setPartes(p=>({...p, [parte]:{...(p[parte]||{}), ...c}})); setAviso(null); };

  const guardar = async (cambios={}) => {
    setGuardando(true);
    const nuevas = {...partes, [parte]:{...(partes[parte]||{}), ...cambios}};
    setPartes(nuevas);
    const ok = await onGuardar(Y, {v:2, anio:Y, partes:nuevas, ts:todayBsAs()});
    setGuardando(false);
    return ok;
  };
  const completar = async () => {
    if (parte===1) await props.persistirEvaluaciones(datos.objetivos||{});
    if (parte===5) await props.onGuardarAgenda(datos.agenda||{});
    if (await guardar({estado:"completa"})) { setAviso(`✓ Parte ${parte} completa.`); window.scrollTo(0,0); }
  };
  const ir = async (n) => { await guardar(); setParte(n); setAviso(null); window.scrollTo(0,0); };
  const completas = [1,2,3,4,5].filter(n=>partes[n]?.estado==="completa").length;
  const ctx = {...props, datos, set};

  return (
    <div>
      <div style={{...card,padding:"12px 16px",marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:C.textSecond,flexWrap:"wrap",gap:6}}>
          <span>Revisión anual {Y} · planificación {Y+1}</span>
          <span style={{color:completas===5?C.yes:C.textSecond}}>{completas} de 5 partes</span>
        </div>
        <div style={{height:6,background:C.surfaceAlt,borderRadius:3,margin:"8px 0"}}><div style={{height:"100%",width:`${completas*20}%`,background:C.yes,borderRadius:3}}/></div>
        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
          {PARTES.map((t,i)=>{ const n=i+1, ok=partes[n]?.estado==="completa"; return (
            <button key={n} onClick={()=>ir(n)} style={{flex:"1 1 90px",padding:"6px 4px",borderRadius:6,border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:700,
              background:n===parte?C.navy:ok?C.yesBg:C.surfaceAlt,color:n===parte?C.white:ok?C.yes:C.textMuted}}>{ok?"✓ ":""}{n}. {t}</button>
          ); })}
        </div>
      </div>

      <div style={{fontSize:20,fontFamily:"'Playfair Display',serif",color:C.navy,margin:"4px 0 14px"}}>Parte {parte}. {PARTES[parte-1]}</div>

      {parte===1 && <Parte1 {...ctx}/>}
      {parte===2 && <Parte2 {...ctx}/>}
      {parte===3 && <Parte3 {...ctx}/>}
      {parte===4 && <Parte4 {...ctx}/>}
      {parte===5 && <Parte5 {...ctx}/>}

      <div style={{display:"flex",gap:8,marginTop:16,flexWrap:"wrap"}}>
        <button onClick={async()=>{ if(await guardar()) setAviso("✓ Guardado. Podés retomar cuando quieras."); }} style={{...btnPrimario,flex:"1 1 140px",background:C.surface,color:C.navy,border:`1px solid ${C.border}`}}>{guardando?"Guardando…":"Guardar"}</button>
        <button onClick={completar} style={{...btnPrimario,flex:"2 1 180px",background:datos.estado==="completa"?C.yes:C.navy}}>
          {datos.estado==="completa"?"✓ Parte completa · guardar cambios":`Marcar parte ${parte} como completa`}</button>
        {parte<5 && <button onClick={()=>ir(parte+1)} style={{...btnPrimario,flex:"1 1 140px",background:C.surfaceAlt,color:C.textSecond}}>Parte {parte+1} →</button>}
      </div>
      {aviso && <div style={{fontSize:12,color:C.yes,marginTop:8}}>{aviso}</div>}
    </div>
  );
}

// ─── Parte 1: evaluar el año ───────────────────────────────────────────
function lineasDeMeses(meses){
  return Object.entries(meses||{}).flatMap(([m,t])=>(t||"").split("\n").map(l=>l.trim()).filter(Boolean).map(l=>({mes:m, texto:l, key:`${m}|${l}`})));
}

function Parte1({Y, datos, set, mensualLog, semanaLog, planLog, planTrim, trimestreLog, objetivos}){
  const items = lineasDeMeses(datos.meses);
  const meta = Math.max(1, Math.ceil(items.length*0.2));
  const marcados = items.filter(i=>datos.impacto?.[i.key]?.marcado).length;
  const setImp = (k,c) => set({impacto:{...(datos.impacto||{}), [k]:{...(datos.impacto?.[k]||{}), ...c}}});
  const anuales = objetivosDelAnio(objetivos, Y);
  const t4 = (planTrim[`${Y}-Q4`]?.objetivos||[]).filter(o=>o.texto);

  // Tiempo por rol del año: planes semanales cuyo sábado cae en el año.
  const min = {};
  Object.entries(planLog||{}).filter(([P])=>addDays(P,6).startsWith(String(Y))).forEach(([,pl])=>tiempoPorRol(pl.items||[], pl.agendadoPorRol).forEach(x=>{ min[x.rol.num]=(min[x.rol.num]||0)+x.min; }));
  const total = Object.values(min).reduce((a,b)=>a+b,0);

  const ayudaMes = (m) => {
    const mesKey = `${Y}-${m}`;
    const sem = Object.keys(semanaLog||{}).filter(W=>addDays(W,6).slice(0,7)===mesKey && esV2(semanaLog[W])).map(W=>semanaLog[W].reflexion?.intencion).filter(Boolean);
    const tri = ["03","06","09"].includes(m) ? trimestreLog?.[`${Y}-Q${Number(m)/3}`]?.salida?.proximosPasos : null;
    return { cierre: mensualLog?.[mesKey], sem, tri };
  };

  return (
    <>
      <div style={card}>
        <SLabel>Titular del año</SLabel>
        <div style={sub}>Si mi año fuera una nota en el diario, ¿qué diría?</div>
        <input value={datos.titular||""} onChange={e=>set({titular:e.target.value})} style={{...campo,fontSize:15,fontWeight:600}}/>
      </div>

      <div style={card}>
        <SLabel>¿Qué pasó este año? · mes a mes</SLabel>
        <div style={sub}>Un acontecimiento por renglón. Al lado, lo que el tracker registró ese mes.</div>
        {MESES.map((nombre,i)=>{ const m=pad(i+1); const a=ayudaMes(m); return (
          <div key={m} style={{padding:"8px 0",borderTop:`1px solid ${C.border}`}}>
            <div style={{fontSize:13,fontWeight:700,color:C.navy,textTransform:"capitalize",marginBottom:4}}>{nombre}</div>
            {(a.cierre||a.sem.length>0||a.tri) && (
              <div style={{fontSize:11,color:C.textMuted,marginBottom:4}}>
                {a.cierre?.cualidad && <span>Cualidad elegida: {a.cierre.cualidad} · </span>}
                {a.cierre?.auditoria?.frase && <span>Frase reactiva: "{a.cierre.auditoria.frase}" · </span>}
                {a.sem.length>0 && <span>Intenciones: {a.sem.join(" / ")} · </span>}
                {a.tri && <span>Próximos pasos trimestrales: {a.tri}</span>}
              </div>
            )}
            <textarea value={datos.meses?.[m]||""} onChange={e=>set({meses:{...(datos.meses||{}), [m]:e.target.value}})} rows={2} style={area}/>
          </div>
        ); })}
      </div>

      <div style={card}>
        <SLabel>¿Qué tuvo más impacto? · el 20%</SLabel>
        {items.length===0 ? <Pendiente>Cargá los acontecimientos de arriba para elegir.</Pendiente> : <>
          <div style={sub}>{items.length} acontecimientos: marcá alrededor de {meta}. Llevás {marcados}.</div>
          {items.map(i=>{ const v=datos.impacto?.[i.key]||{}; return (
            <div key={i.key} style={{padding:"6px 0",borderTop:`1px solid ${C.border}`}}>
              <label style={{display:"flex",gap:8,fontSize:13,color:C.textPrimary}}>
                <input type="checkbox" checked={!!v.marcado} onChange={e=>setImp(i.key,{marcado:e.target.checked})}/>
                <span><span style={{color:C.textMuted,textTransform:"capitalize"}}>{MESES[Number(i.mes)-1]}: </span>{i.texto}</span>
              </label>
              {v.marcado && <div style={{marginTop:6,paddingLeft:24}}><Opciones valor={v.tipo} opciones={IMPACTO} onChange={t=>setImp(i.key,{tipo:t})}/></div>}
            </div>
          ); })}
        </>}
      </div>

      <div style={card}><SLabel>Logros</SLabel><Preguntas lista={LOGROS} valores={datos.logros} onChange={v=>set({logros:v})}/></div>
      <div style={card}><SLabel>Lo que podría haber sido mejor</SLabel><Preguntas lista={MEJORABLE} valores={datos.mejorable} onChange={v=>set({mejorable:v})}/></div>
      <div style={card}><SLabel>Personas</SLabel><Preguntas lista={PERSONAS} valores={datos.personas} onChange={v=>set({personas:v})}/></div>

      <div style={card}>
        <SLabel>Chequeo vivir · amar · aprender · legado</SLabel>
        <div style={sub}>Chequeo de la guía de Superhábitos (no figura en "Los 7 hábitos").</div>
        {CHEQUEO.map(a=>{ const v=datos.chequeo?.[a.id]||{}; const setA=c=>set({chequeo:{...(datos.chequeo||{}), [a.id]:{...v, ...c}}}); return (
          <div key={a.id} style={{padding:"8px 0",borderTop:`1px solid ${C.border}`}}>
            <div style={{fontSize:14,fontWeight:700,color:C.navy}}>{a.t}</div>
            {a.q.map((q,k)=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",gap:8,alignItems:"center",flexWrap:"wrap",padding:"4px 0"}}>
                <span style={{fontSize:13,color:C.textSecond,flex:"1 1 200px"}}>{q}</span>
                <Opciones valor={v.respuestas?.[k]} opciones={SI_MEDIAS_NO} onChange={r=>setA({respuestas:{...(v.respuestas||{}), [k]:r}})}/>
              </div>
            ))}
            <input value={v.nota||""} onChange={e=>setA({nota:e.target.value})} placeholder={`Nota sobre ${a.t.toLowerCase()}`} style={{...campo,marginTop:6,fontSize:12}}/>
          </div>
        ); })}
      </div>

      <div style={card}>
        <SLabel>¿Qué ocupó más tiempo? · % por rol en {Y}</SLabel>
        {total===0 ? <Pendiente>Sin planes semanales en {Y}.</Pendiente> : ROLES_TODOS.filter(r=>min[r.num]).map(r=>{ const pct=Math.round(min[r.num]/total*100); return (
          <div key={r.num} style={{marginBottom:6}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:C.textSecond,marginBottom:2}}><span>{r.num} · {r.nombre}</span><span>{hs(min[r.num])} h · {pct}%</span></div>
            <div style={{height:6,background:C.surfaceAlt,borderRadius:3}}><div style={{height:"100%",width:pct+"%",background:C.celeste,borderRadius:3}}/></div>
          </div>
        ); })}
      </div>

      <div style={card}>
        <SLabel>Objetivos {Y}</SLabel>
        {anuales.length===0 ? <Pendiente>Sin objetivos {Y} cargados en el tracker.</Pendiente> : anuales.map(o=>{
          const v=datos.objetivos?.[o.id]||{}; const setO=c=>set({objetivos:{...(datos.objetivos||{}), [o.id]:{...v, ...c}}});
          const ok = v.categoria==="cumplido"||v.categoria==="semi";
          return (
            <div key={o.id} style={{padding:"8px 0",borderTop:`1px solid ${C.border}`}}>
              <div style={{fontSize:13,fontWeight:600,color:C.navy,marginBottom:6}}>{o.central?"★ ":""}{o.titulo} <span style={{fontSize:11,color:C.textMuted,fontWeight:400}}>· {nombreRol(o.rol)}</span></div>
              <Opciones valor={v.categoria} opciones={CATEGORIAS} onChange={c=>setO({categoria:c})}/>
              {v.categoria && v.categoria!=="descartado" && (ok
                ? <input value={v.ayudo||""} onChange={e=>setO({ayudo:e.target.value})} placeholder="¿Qué hábitos, actividades, conocimientos o personas ayudaron?" style={{...campo,marginTop:6,fontSize:12}}/>
                : <>
                    <input value={v.impidio||""} onChange={e=>setO({impidio:e.target.value})} placeholder="¿Qué lo impidió?" style={{...campo,marginTop:6,fontSize:12}}/>
                    <input value={v.distinto||""} onChange={e=>setO({distinto:e.target.value})} placeholder="¿Qué podría haber hecho distinto?" style={{...campo,marginTop:6,fontSize:12}}/>
                  </>)}
              {v.categoria==="descartado" && <input value={v.motivo||""} onChange={e=>setO({motivo:e.target.value})} placeholder="¿Por qué lo descarté?" style={{...campo,marginTop:6,fontSize:12}}/>}
            </div>
          );
        })}
      </div>

      <div style={card}>
        <SLabel>Cierre del T4 {Y}</SLabel>
        {t4.length===0 ? <Pendiente>Sin plan del T4 {Y} cargado.</Pendiente> : t4.map(o=>{
          const v=datos.t4?.[o.id]||{}; const setT=c=>set({t4:{...(datos.t4||{}), [o.id]:{...v,...c}}});
          return (
            <div key={o.id} style={{padding:"8px 0",borderTop:`1px solid ${C.border}`}}>
              <div style={{fontSize:13,color:C.navy,fontWeight:600,marginBottom:6}}>{o.texto} <span style={{fontSize:11,color:C.textMuted,fontWeight:400}}>· {nombreRol(o.rol)}</span></div>
              <Opciones valor={v.estado} opciones={[{v:"si",t:"Cumplí",c:C.yes,bg:C.yesBg},{v:"parcial",t:"A medias",c:C.warn,bg:C.warnBg},{v:"no",t:"No cumplí",c:C.no,bg:C.noBg}]} onChange={x=>setT({estado:x})}/>
              <input value={v.porque||""} onChange={e=>setT({porque:e.target.value})} placeholder="¿Por qué?" style={{...campo,marginTop:6,fontSize:12}}/>
            </div>
          );
        })}
      </div>

      <div style={card}>
        <SLabel>Lecciones del año · de 1 a 10</SLabel>
        {(datos.lecciones||[""]).map((l,k)=>(
          <div key={k} style={{display:"flex",gap:6,marginBottom:6}}>
            <span style={{fontSize:13,color:C.textMuted,paddingTop:9,minWidth:18}}>{k+1}.</span>
            <input value={l} onChange={e=>set({lecciones:(datos.lecciones||[""]).map((x,j)=>j===k?e.target.value:x)})} style={campo}/>
          </div>
        ))}
        {(datos.lecciones||[""]).length<10 && <button onClick={()=>set({lecciones:[...(datos.lecciones||[""]), ""]})} style={btnLink}>+ Lección</button>}
      </div>
    </>
  );
}

// ─── Parte 2: reconectar con lo importante ─────────────────────────────
function Parte2({datos, set, contenidoCfg, onGuardarContenido}){
  const [editMision, setEditMision] = useState(false);
  const [textoMision, setTextoMision] = useState(MISION);
  const [roles, setRoles] = useState(()=>ROLES_TODOS.map(r=>({...r})));
  const [rolesSucio, setRolesSucio] = useState(false);
  const [aviso, setAviso] = useState(null);
  const hoy = todayBsAs();
  const historial = contenidoCfg?.misionHistorial || [];

  const guardarMision = async () => {
    if (!textoMision.trim() || textoMision.trim()===MISION.trim()) { setEditMision(false); return; }
    const ok = await onGuardarContenido({ mision:textoMision.trim(), misionDesde:hoy,
      misionHistorial:[...historial, {texto:MISION, desde:contenidoCfg?.misionDesde||null, hasta:hoy}] });
    if (ok!==false) { setEditMision(false); setAviso("✓ Misión actualizada: desde hoy aparece en la Mañana."); }
  };
  const setRol = (num, c) => { setRoles(rs=>rs.map(r=>r.num===num?{...r,...c}:r)); setRolesSucio(true); };
  const agregarRol = () => { const num = String(Math.max(...roles.map(r=>Number(r.num)))+1); setRoles(rs=>[...rs,{num, nombre:"", desc:""}]); setRolesSucio(true); };
  const guardarRoles = async () => {
    const limpios = roles.filter(r=>r.nombre.trim()).map(r=>({...r, nombre:r.nombre.trim(), desc:(r.desc||"").trim()}));
    const ok = await onGuardarContenido({ roles:limpios, rolesHistorial:[...(contenidoCfg?.rolesHistorial||[]), {fecha:hoy, roles:ROLES_TODOS}] });
    if (ok!==false) { setRoles(limpios); setRolesSucio(false); setAviso("✓ Roles actualizados."); }
  };
  const v = datos.vision || {};
  const setV = c => set({vision:{...v, ...c}});
  const crit = datos.roles || {};

  return (
    <>
      {aviso && <div style={{fontSize:13,color:C.yes,marginBottom:10}}>{aviso}</div>}
      <div style={card}>
        <SLabel>✦ Misión</SLabel>
        {!editMision ? <>
          <div style={{fontSize:13,color:C.textSecond,lineHeight:1.6,whiteSpace:"pre-line"}}>{MISION}</div>
          <button onClick={()=>{setTextoMision(MISION); setEditMision(true);}} style={{...btnLink,marginTop:8}}>✏️ Editar la misión</button>
        </> : <>
          <textarea value={textoMision} onChange={e=>setTextoMision(e.target.value)} rows={14} style={area}/>
          <div style={{display:"flex",gap:10,marginTop:8}}>
            <button onClick={guardarMision} style={{...btnPrimario,width:"auto",padding:"8px 16px",fontSize:13}}>Guardar nueva misión</button>
            <button onClick={()=>setEditMision(false)} style={{...btnLink,color:C.textMuted}}>Cancelar</button>
          </div>
          <div style={{fontSize:11,color:C.textMuted,marginTop:6}}>La versión actual queda en el historial.</div>
        </>}
        <div style={pregunta}>¿Todavía me siento identificado? ¿Hay algo para agregar, quitar o cambiar?</div>
        <textarea value={datos.misionNota||""} onChange={e=>set({misionNota:e.target.value})} rows={2} style={area}/>
        {historial.length>0 && <details style={{marginTop:8}}><summary style={{fontSize:12,color:C.celeste,cursor:"pointer"}}>Versiones anteriores ({historial.length})</summary>
          {historial.map((h,k)=><div key={k} style={{fontSize:12,color:C.textSecond,whiteSpace:"pre-line",padding:"8px 0",borderTop:`1px solid ${C.border}`}}><strong>Hasta {formatDate(h.hasta)}</strong>{"\n"}{h.texto}</div>)}
        </details>}
      </div>

      <div style={card}>
        <SLabel>✦ Visión a 5 años</SLabel>
        <img src={`${process.env.PUBLIC_URL}/vision.webp`} alt={VISION_ALT} style={{width:"100%",height:"auto",display:"block",borderRadius:8}}/>
        <div style={pregunta}>Imaginá un día concreto dentro de 5 años, en esta misma fecha.</div>
        <input value={v.donde||""} onChange={e=>setV({donde:e.target.value})} placeholder="¿Dónde estoy?" style={{...campo,marginBottom:6}}/>
        <input value={v.conQuien||""} onChange={e=>setV({conQuien:e.target.value})} placeholder="¿Con quién?" style={{...campo,marginBottom:6}}/>
        <textarea value={v.queHago||""} onChange={e=>setV({queHago:e.target.value})} placeholder="¿Qué hago?" rows={3} style={area}/>
        <div style={pregunta}>¿Cambiarías algo de la imagen de visión?</div>
        <textarea value={v.cambios||""} onChange={e=>setV({cambios:e.target.value})} rows={2} placeholder="Si querés una imagen nueva, pasámela y la reemplazo." style={area}/>
      </div>

      <div style={card}>
        <SLabel>Roles</SLabel>
        {["Cubren mi vida profesional, mis relaciones con otros y mi vida como individuo", "Son funciones de todas las semanas", "Prevén lo que quiero crear a futuro", "Cada uno tiene un nombre propio"].map((c,k)=>(
          <label key={k} style={{display:"flex",gap:8,fontSize:13,color:C.textSecond,padding:"3px 0"}}>
            <input type="checkbox" checked={!!crit[k]} onChange={e=>set({roles:{...crit, [k]:e.target.checked}})}/>{c}
          </label>
        ))}
        <div style={{marginTop:10}}>
          {roles.map(r=>(
            <div key={r.num} style={{padding:"8px 0",borderTop:`1px solid ${C.border}`,opacity:r.archivado?0.55:1}}>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <span style={{fontSize:12,fontWeight:700,color:C.navy,minWidth:20}}>{r.num}</span>
                <input value={r.nombre} onChange={e=>setRol(r.num,{nombre:e.target.value})} placeholder="Nombre del rol" style={{...campo,fontWeight:600}}/>
                <button onClick={()=>setRol(r.num,{archivado:!r.archivado})} style={{...btnLink,fontSize:12,color:C.textMuted,whiteSpace:"nowrap"}}>{r.archivado?"Reactivar":"Archivar"}</button>
              </div>
              <input value={r.desc||""} onChange={e=>setRol(r.num,{desc:e.target.value})} placeholder="Descripción" style={{...campo,fontSize:12,marginTop:4,marginLeft:26,width:"calc(100% - 26px)"}}/>
              {r.archivado && <div style={{fontSize:11,color:C.textMuted,marginLeft:26}}>Archivado: conserva su historia, no aparece en la planificación.</div>}
            </div>
          ))}
          <div style={{display:"flex",gap:12,alignItems:"center",marginTop:10}}>
            <button onClick={agregarRol} style={btnLink}>+ Agregar rol</button>
            {rolesSucio && <button onClick={guardarRoles} style={{...btnPrimario,width:"auto",padding:"8px 16px",fontSize:13}}>Guardar roles</button>}
          </div>
        </div>
        <textarea value={crit.nota||""} onChange={e=>set({roles:{...crit, nota:e.target.value}})} placeholder="Notas sobre los roles" rows={2} style={{...area,marginTop:10}}/>
      </div>
    </>
  );
}

// ─── Parte 3: objetivos del año nuevo ──────────────────────────────────
function Parte3({Y, datos, set, objetivos, onGuardarObjetivo, pesos}){
  const [matriz, setMatriz] = useState(false);
  const nuevos = objetivosDelAnio(objetivos, Y+1);
  return (
    <>
      <div style={sub}>Por cada rol, de 1 a 3 objetivos específicos, medibles y con plazo, como estado actual → estado deseado. Marcá el central de cada rol.</div>
      <ObjetivosAnio anio={Y+1} objetivos={objetivos} onGuardar={onGuardarObjetivo}/>
      <div style={card}>
        <button onClick={()=>setMatriz(!matriz)} style={btnLink}>{matriz?"Ocultar matriz":"Pasar objetivos en duda por la matriz de la chispa"}</button>
        {(datos.decisiones||[]).map((d,k)=><div key={k} style={{fontSize:12,color:C.textSecond,marginTop:6}}>{d.contexto} → <strong>{d.elegida}</strong></div>)}
      </div>
      {matriz && <MatrizDecision pesos={pesos} alternativasIniciales={nuevos.slice(0,3).map(o=>o.titulo)}
        onGuardar={d=>set({decisiones:[...(datos.decisiones||[]), {...d, fecha:todayBsAs()}]})}/>}
    </>
  );
}

// ─── Parte 4: hábitos e inversiones ────────────────────────────────────
function Parte4({Y, datos, set, objetivos, habitos, onGuardarHabito}){
  const anio = Y+1;
  const nuevos = objetivosDelAnio(objetivos, anio);
  const lista = Object.entries(habitos||{}).map(([id,h])=>({id,...h})).filter(h=>h.anio===anio && !h.archivado)
    .sort((a,b)=>(b.objetivos||[]).length-(a.objetivos||[]).length);
  const priorizados = lista.filter(h=>h.prioridad);
  const dimsFaltan = DIMENSIONES.filter(d=>!priorizados.some(h=>h.dimension===d.v));
  const [textos, setTextos] = useState({});

  const agregar = async (objId) => {
    const t = (textos[objId]||"").trim(); if (!t) return;
    const existente = lista.find(h=>norm(h.texto)===norm(t));
    if (existente) { if (!(existente.objetivos||[]).includes(objId)) await onGuardarHabito(existente.id, {objetivos:[...(existente.objetivos||[]), objId]}); }
    else await onGuardarHabito(nuevoId(), {anio, texto:t, objetivos:[objId], prioridad:false, mes:null, dimension:null});
    setTextos(x=>({...x, [objId]:""}));
  };
  const inv = datos.inversiones || [];
  const setInv = (k,c) => set({inversiones:inv.map((x,j)=>j===k?{...x,...c}:x)});

  return (
    <>
      <div style={card}>
        <SLabel>Hábitos por objetivo {anio}</SLabel>
        <div style={sub}>¿Qué acción, si la hiciera a diario, haría que esto suceda o sea más fácil? Si un hábito se repite, suma una marca.</div>
        {nuevos.length===0 ? <Pendiente>Cargá primero los objetivos {anio} en la Parte 3.</Pendiente> : nuevos.map(o=>(
          <div key={o.id} style={{padding:"8px 0",borderTop:`1px solid ${C.border}`}}>
            <div style={{fontSize:13,fontWeight:600,color:C.navy}}>{o.titulo} <span style={{fontSize:11,color:C.textMuted,fontWeight:400}}>· {nombreRol(o.rol)}</span></div>
            <div style={{fontSize:12,color:C.textSecond,margin:"4px 0"}}>{lista.filter(h=>(h.objetivos||[]).includes(o.id)).map(h=>`▸ ${h.texto}`).join("   ")}</div>
            <div style={{display:"flex",gap:6}}>
              <input value={textos[o.id]||""} onChange={e=>setTextos(x=>({...x,[o.id]:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&agregar(o.id)} placeholder="Acción diaria" style={{...campo,fontSize:12}}/>
              <button onClick={()=>agregar(o.id)} style={{...btnPrimario,width:"auto",padding:"8px 14px",fontSize:12}}>Agregar</button>
            </div>
          </div>
        ))}
      </div>

      <div style={card}>
        <SLabel>Priorizar hasta 12 hábitos · uno por mes</SLabel>
        <div style={sub}>Criterios: se conectan con los objetivos más importantes, impactan en más objetivos, facilitan desarrollar otros. Llevás {priorizados.length} de 12.</div>
        {priorizados.length>0 && dimsFaltan.length>0 && <div style={{fontSize:12,color:C.warn,marginBottom:8}}>Falta alguna dimensión entre los priorizados: {dimsFaltan.map(d=>d.t).join(", ")}.</div>}
        {lista.length===0 ? <Pendiente>Sin hábitos cargados todavía.</Pendiente> : lista.map(h=>(
          <div key={h.id} style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",padding:"6px 0",borderTop:`1px solid ${C.border}`}}>
            <label style={{display:"flex",gap:8,alignItems:"center",fontSize:13,color:C.textPrimary,flex:"1 1 200px"}}>
              <input type="checkbox" checked={!!h.prioridad} disabled={!h.prioridad && priorizados.length>=12} onChange={e=>onGuardarHabito(h.id,{prioridad:e.target.checked})}/>
              {h.texto} <span style={{fontSize:11,color:C.celeste,fontWeight:700}}>{"●".repeat((h.objetivos||[]).length)}</span>
            </label>
            {h.prioridad && <>
              <select value={h.mes||""} onChange={e=>onGuardarHabito(h.id,{mes:e.target.value?Number(e.target.value):null})} style={{...campo,width:"auto",fontSize:12}}>
                <option value="">Mes</option>{MESES.map((m,i)=><option key={m} value={i+1}>{m}</option>)}
              </select>
              <select value={h.dimension||""} onChange={e=>onGuardarHabito(h.id,{dimension:e.target.value||null})} style={{...campo,width:"auto",fontSize:12}}>
                <option value="">Dimensión</option>{DIMENSIONES.map(d=><option key={d.v} value={d.v}>{d.t}</option>)}
              </select>
            </>}
          </div>
        ))}
      </div>

      <div style={card}>
        <SLabel>Inversiones</SLabel>
        <div style={sub}>¿Qué inversiones ayudarían a cada objetivo o hábito, y cómo se financia cada una?</div>
        {inv.map((x,k)=>(
          <div key={k} style={{display:"flex",gap:6,flexWrap:"wrap",padding:"6px 0",borderTop:`1px solid ${C.border}`}}>
            <input value={x.que||""} onChange={e=>setInv(k,{que:e.target.value})} placeholder="Qué" style={{...campo,flex:"2 1 160px",fontSize:12}}/>
            <input value={x.para||""} onChange={e=>setInv(k,{para:e.target.value})} placeholder="Para qué objetivo o hábito" style={{...campo,flex:"2 1 160px",fontSize:12}}/>
            <select value={x.tipo||""} onChange={e=>setInv(k,{tipo:e.target.value})} style={{...campo,flex:"1 1 120px",fontSize:12,width:"auto"}}>
              <option value="">Tipo</option>{TIPOS_INVERSION.map(t=><option key={t}>{t}</option>)}
            </select>
            <input value={x.financia||""} onChange={e=>setInv(k,{financia:e.target.value})} placeholder="Cómo se financia" style={{...campo,flex:"2 1 160px",fontSize:12}}/>
          </div>
        ))}
        <button onClick={()=>set({inversiones:[...inv,{}]})} style={btnLink}>+ Inversión</button>
      </div>
    </>
  );
}

// ─── Parte 5: multiplicar las probabilidades ───────────────────────────
function Parte5({Y, datos, set, objetivos, habitos, agenda}){
  const anio = Y+1;
  const ag = datos.agenda || { [anio]:{ t1:inicioTrimestral(anio,1,agenda), t2:inicioTrimestral(anio,2,agenda), t3:inicioTrimestral(anio,3,agenda) }, semanal: agenda?.semanal || {dia:6, hora:"09:30"} };
  const setAg = (c) => set({agenda:{...ag, ...c}});
  const comp = datos.companeros || [];
  const setComp = (k,c) => set({companeros:comp.map((x,j)=>j===k?{...x,...c}:x)});
  const nuevos = objetivosDelAnio(objetivos, anio);
  const habs = Object.values(habitos||{}).filter(h=>h.anio===anio && h.prioridad && !h.archivado).sort((a,b)=>(a.mes||13)-(b.mes||13));
  return (
    <>
      <div style={card}>
        <SLabel>Un día a fin de {anio}</SLabel>
        <div style={sub}>Si cumplo todo lo propuesto, ¿cómo es un día a fin de año? Se te va a mostrar en la semanal cuando la semana venga baja.</div>
        <textarea value={datos.relato||""} onChange={e=>set({relato:e.target.value})} rows={6} style={area}/>
      </div>

      <div style={card}>
        <SLabel>Agenda {anio}</SLabel>
        <div style={sub}>Cada trimestral se habilita en la fecha que elijas y queda abierta 3 semanas. El cierre del T4 va con la anual (desde el 15/12).</div>
        {[1,2,3].map(q=>(
          <div key={q} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,padding:"4px 0"}}>
            <span style={{fontSize:13,color:C.textSecond}}>Revisión trimestral T{q}</span>
            <FechaInput value={ag[anio]?.[`t${q}`]||""} onChange={v=>setAg({[anio]:{...(ag[anio]||{}), [`t${q}`]:v}})} style={{...campo,width:130}}/>
          </div>
        ))}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,padding:"4px 0",flexWrap:"wrap"}}>
          <span style={{fontSize:13,color:C.textSecond}}>Organización semanal</span>
          <div style={{display:"flex",gap:6}}>
            <select value={ag.semanal?.dia??6} onChange={e=>setAg({semanal:{...ag.semanal, dia:Number(e.target.value)}})} style={{...campo,width:"auto"}}>
              <option value={6}>Sábado</option><option value={0}>Domingo</option>
            </select>
            <input type="time" value={ag.semanal?.hora||"09:30"} onChange={e=>setAg({semanal:{...ag.semanal, hora:e.target.value}})} style={{...campo,width:"auto"}}/>
          </div>
        </div>
        <div style={{fontSize:11,color:C.textMuted,marginTop:4}}>Se aplica al marcar esta parte como completa.</div>
      </div>

      <div style={card}>
        <SLabel>Compañeros de ruta</SLabel>
        <div style={sub}>Personas y comunidades que me acompañan: con qué objetivo y de qué modo.</div>
        {comp.map((x,k)=>(
          <div key={k} style={{display:"flex",gap:6,flexWrap:"wrap",padding:"6px 0",borderTop:`1px solid ${C.border}`}}>
            <input value={x.quien||""} onChange={e=>setComp(k,{quien:e.target.value})} placeholder="Persona o comunidad" style={{...campo,flex:"1 1 150px",fontSize:12}}/>
            <input value={x.objetivo||""} onChange={e=>setComp(k,{objetivo:e.target.value})} placeholder="Con qué objetivo" style={{...campo,flex:"1 1 150px",fontSize:12}}/>
            <input value={x.modo||""} onChange={e=>setComp(k,{modo:e.target.value})} placeholder="De qué modo" style={{...campo,flex:"1 1 150px",fontSize:12}}/>
          </div>
        ))}
        <button onClick={()=>set({companeros:[...comp,{}]})} style={btnLink}>+ Compañero de ruta</button>
      </div>

      <div style={{...card,borderLeft:`4px solid ${C.yes}`}}>
        <SLabel>Salida · listo para el T1 {anio}</SLabel>
        <div style={{fontSize:13,color:C.textSecond,marginBottom:6}}>{nuevos.length} objetivo{nuevos.length===1?"":"s"} {anio} en {new Set(nuevos.map(o=>o.rol)).size} de {ROLES.length} roles.</div>
        {ROLES.map(r=>{ const os=nuevos.filter(o=>o.rol===r.num); return os.length>0 && (
          <div key={r.num} style={{fontSize:12,color:C.textSecond,padding:"2px 0"}}><strong style={{color:C.celeste}}>{r.nombre}:</strong> {os.map(o=>(o.central?"★ ":"")+o.titulo).join(" · ")}</div>
        ); })}
        <div style={{fontSize:13,color:C.textSecond,margin:"10px 0 4px"}}>Hábitos del año: {habs.length}</div>
        {habs.map(h=><div key={h.texto} style={{fontSize:12,color:C.textSecond}}>{h.mes?MESES[h.mes-1]:"sin mes"} · {h.texto}{h.dimension?` (${DIMENSIONES.find(d=>d.v===h.dimension)?.t})`:""}</div>)}
      </div>
    </>
  );
}
