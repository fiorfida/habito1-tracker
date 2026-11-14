import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { C, card, inp } from "../theme";
import { PREGUNTA_H2 } from "../content/contenido";
import { addDays, dayOfWeek, formatDate, getWeekStart } from "../lib/fechas";
import { analizarPeriodo, estadoDe, exportarMarkdown, rangoPeriodo, ESTADO_TEXTO, SENALES } from "../lib/proactividad";

// Color + ícono por estado (el ícono evita depender solo del color).
const ESTILO = {
  bueno:        { fill:C.good, fg:C.white, icono:"✓", suave:C.yesBg },
  medio:        { fill:C.mid,  fg:C.white, icono:"~", suave:C.warnBg },
  malo:         { fill:C.bad,  fg:C.white, icono:"✕", suave:C.noBg },
  sin_registro: { fill:C.surfaceAlt, fg:C.textMuted, icono:"·", suave:C.surfaceAlt, borde:C.border },
  pendiente:    { fill:"transparent", fg:C.textMuted, icono:"", suave:C.surfaceAlt, borde:C.textMuted, punteado:true },
};
const SERIE_BUENOS = "#2176c7", SERIE_REGISTRO = "#7c3aed";
const DIAS = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
const MESES_C = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
const etiqueta = { fontSize:11, letterSpacing:2, color:C.textMuted, textTransform:"uppercase" };
const fmtPct = p => p==null ? "—" : `${p}%`;

function Pastilla({ estado, grande }){
  const e = ESTILO[estado];
  const t = grande ? 22 : 14;
  return <span aria-hidden="true" style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:t,height:t,borderRadius:4,flexShrink:0,
    background:e.fill,color:e.fg,fontSize:grande?13:10,fontWeight:700,border:e.borde?`${e.punteado?"2px dashed":"1px solid"} ${e.borde}`:"none",boxSizing:"border-box"}}>{e.icono}</span>;
}

// ─── Filtro de período ─────────────────────────────────────────────────
function Filtro({ tipo, setTipo, custom, setCustom, hoy }){
  const op = [{id:"30",t:"Últimos 30 días"},{id:"trimestre",t:"Trimestre actual"},{id:"custom",t:"Personalizado"}];
  return (
    <div style={{marginBottom:14}}>
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {op.map(o=>(
          <button key={o.id} onClick={()=>setTipo(o.id)} aria-pressed={tipo===o.id} style={{padding:"6px 12px",borderRadius:16,border:`1px solid ${tipo===o.id?C.navy:C.border}`,
            background:tipo===o.id?C.navy:C.surface,color:tipo===o.id?C.white:C.textSecond,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{o.t}</button>
        ))}
      </div>
      {tipo==="custom" && (
        <div style={{display:"flex",gap:8,marginTop:10,flexWrap:"wrap"}}>
          {[["desde","Desde"],["hasta","Hasta"]].map(([k,t])=>(
            <label key={k} style={{flex:"1 1 140px",fontSize:12,color:C.textSecond}}>{t}
              <input type="date" value={custom[k]} max={hoy} onChange={e=>setCustom({...custom,[k]:e.target.value})} style={{...inp,marginTop:4,padding:"8px 10px"}}/>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Indicadores ───────────────────────────────────────────────────────
function Kpi({ titulo, valor, sub, className }){
  return (
    <div className={className} style={{...card,marginBottom:0,padding:"14px 14px"}}>
      <div style={{...etiqueta,fontSize:10,letterSpacing:1.5}}>{titulo}</div>
      <div style={{fontSize:26,fontWeight:700,color:C.navy,marginTop:4,lineHeight:1.1}}>{valor}</div>
      {sub && <div style={{fontSize:12,color:C.textSecond,marginTop:4}}>{sub}</div>}
    </div>
  );
}
function Indicadores({ a }){
  return (
    <div className="proa-kpis">
      <Kpi titulo="Días con registro" valor={fmtPct(a.pctRegistro)} sub={`${a.conRegistro} de ${a.totalDias} días`}/>
      <Kpi titulo="Días buenos" valor={fmtPct(a.pctBuenos)} sub={`${a.dist.bueno} de ${a.conRegistro} registrados`}/>
      <div className="proa-kpi-dist" style={{...card,marginBottom:0,padding:"14px 14px"}}>
        <div style={{...etiqueta,fontSize:10,letterSpacing:1.5,marginBottom:8}}>Distribución</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"6px 10px"}}>
          {["bueno","medio","malo","sin_registro"].map(e=>(
            <div key={e} style={{display:"flex",alignItems:"center",gap:6,fontSize:13,color:C.textSecond}}>
              <Pastilla estado={e}/><span>{ESTADO_TEXTO[e]}</span><strong style={{marginLeft:"auto",color:C.textPrimary}}>{a.dist[e]}</strong>
            </div>
          ))}
        </div>
      </div>
      <Kpi titulo="Racha de días buenos" valor={a.rachaBuenos} sub={`Mejor del período: ${a.mejorRachaBuenos}`}/>
      <Kpi titulo="Racha con registro" valor={a.rachaRegistro} sub="días seguidos registrados"/>
    </div>
  );
}

// ─── Heatmap (semanas en columnas, Dom-Sáb en filas) ───────────────────
const CELDA = 26, GAP = 4;
function Heatmap({ a, onElegir }){
  const scroller = useRef(null), envoltorio = useRef(null);
  const [tip, setTip] = useState(null);
  const porFecha = useMemo(()=>Object.fromEntries(a.dias.map(d=>[d.fecha,d.estado])), [a.dias]);
  const semanas = [];
  for (let w=getWeekStart(a.desde); w<=a.hasta; w=addDays(w,7)) semanas.push(w);
  useEffect(()=>{ if(scroller.current) scroller.current.scrollLeft = scroller.current.scrollWidth; }, [a.desde, a.hasta]);
  const mostrar = (ev, fecha) => {
    const r = ev.currentTarget.getBoundingClientRect(), base = envoltorio.current.getBoundingClientRect();
    setTip({ fecha, x:r.left-base.left+r.width/2, y:r.top-base.top });
  };
  return (
    <div style={card}>
      <div style={{...etiqueta,marginBottom:10}}>Calendario</div>
      <div ref={envoltorio} style={{position:"relative"}}>
        <div ref={scroller} style={{overflowX:"auto",paddingBottom:4}}>
          <div style={{display:"flex",gap:GAP,width:"max-content"}}>
            <div style={{display:"flex",flexDirection:"column",gap:GAP,paddingTop:16}}>
              {DIAS.map(d=><div key={d} style={{height:CELDA,lineHeight:`${CELDA}px`,fontSize:10,color:C.textMuted,width:26}}>{d}</div>)}
            </div>
            {semanas.map((w,i)=>{
              const mes = w.slice(5,7), mesPrevio = i>0 ? semanas[i-1].slice(5,7) : null;
              return (
                <div key={w} style={{display:"flex",flexDirection:"column",gap:GAP}}>
                  <div style={{height:12,fontSize:10,color:C.textMuted,whiteSpace:"nowrap",width:CELDA}}>{mes!==mesPrevio ? MESES_C[Number(mes)-1] : ""}</div>
                  {[0,1,2,3,4,5,6].map(k=>{
                    const fecha = addDays(w,k), estado = porFecha[fecha];
                    if (!estado) return <div key={k} style={{width:CELDA,height:CELDA}}/>;
                    const e = ESTILO[estado];
                    return (
                      <button key={k} onClick={()=>onElegir(fecha)} onMouseEnter={ev=>mostrar(ev,fecha)} onMouseLeave={()=>setTip(null)}
                        onFocus={ev=>mostrar(ev,fecha)} onBlur={()=>setTip(null)}
                        aria-label={`${dayOfWeek(fecha)} ${formatDate(fecha)}: ${ESTADO_TEXTO[estado]}`}
                        style={{width:CELDA,height:CELDA,padding:0,borderRadius:5,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:700,
                          background:e.fill,color:e.fg,border:e.borde?`${e.punteado?"2px dashed":"1px solid"} ${e.borde}`:"none",boxSizing:"border-box"}}>{e.icono}</button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
        {tip && (
          <div role="tooltip" style={{position:"absolute",left:tip.x,top:tip.y-6,transform:"translate(-50%,-100%)",pointerEvents:"none",whiteSpace:"nowrap",
            background:C.navy,color:C.white,fontSize:12,padding:"5px 9px",borderRadius:6,boxShadow:"0 2px 8px rgba(0,31,91,0.25)",zIndex:2}}>
            {dayOfWeek(tip.fecha)} {formatDate(tip.fecha)} · <strong>{ESTADO_TEXTO[porFecha[tip.fecha]]}</strong>
          </div>
        )}
      </div>
      <div style={{display:"flex",gap:"6px 14px",flexWrap:"wrap",marginTop:12,fontSize:12,color:C.textSecond}}>
        {["bueno","medio","malo","sin_registro","pendiente"].map(e=>(
          <span key={e} style={{display:"inline-flex",alignItems:"center",gap:5}}><Pastilla estado={e}/>{e==="pendiente"?"Pendiente (hoy)":ESTADO_TEXTO[e]}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Tendencia semanal (línea, un solo eje 0-100%) ─────────────────────
function Tendencia({ semanas }){
  const [hover, setHover] = useState(null);
  // El viewBox sigue al ancho real: así el texto queda en 11-12 px también en el celular.
  const caja = useRef(null);
  const [W, setW] = useState(640);
  useEffect(()=>{
    const el = caja.current; if(!el) return;
    const medir = () => setW(Math.max(260, Math.round(el.clientWidth)));
    medir();
    const ro = new ResizeObserver(medir); ro.observe(el);
    return ()=>ro.disconnect();
  }, [semanas.length>0]);
  const H=W<480?190:220, M={l:36,r:84,t:14,b:28};
  const iw=W-M.l-M.r, ih=H-M.t-M.b, n=semanas.length;
  const x = i => M.l + (n===1 ? iw/2 : i*iw/(n-1));
  const y = p => M.t + ih - p/100*ih;
  const tramos = key => { // corta la línea donde no hay dato
    const out=[]; let cur=[];
    semanas.forEach((s,i)=>{ if(s[key]==null){ if(cur.length) out.push(cur); cur=[]; } else cur.push([x(i),y(s[key])]); });
    if(cur.length) out.push(cur);
    return out;
  };
  const series = [
    {key:"pctBuenos", nombre:"% días buenos", corto:"Buenos", color:SERIE_BUENOS, dash:null},
    {key:"pctRegistro", nombre:"% días con registro", corto:"Registro", color:SERIE_REGISTRO, dash:"6 4"},
  ];
  const ultimo = key => { for(let i=n-1;i>=0;i--) if(semanas[i][key]!=null) return {i,v:semanas[i][key]}; return null; };
  const finales = series.map(s=>({...s, u:ultimo(s.key)}));
  if (finales[0].u && finales[1].u && Math.abs(y(finales[0].u.v)-y(finales[1].u.v))<14) { finales[0].dy=-7; finales[1].dy=7; }
  const paso = Math.max(1, Math.ceil(n/Math.max(2, Math.floor(iw/52))));
  const ddmm = f => formatDate(f).slice(0,5);
  const h = hover!=null ? semanas[hover] : null;
  return (
    <div style={card}>
      <div style={{...etiqueta,marginBottom:8}}>Tendencia semanal</div>
      <div style={{display:"flex",gap:14,flexWrap:"wrap",fontSize:12,color:C.textSecond,marginBottom:6}}>
        {series.map(s=>(
          <span key={s.key} style={{display:"inline-flex",alignItems:"center",gap:6}}>
            <svg width="22" height="8" aria-hidden="true"><line x1="1" y1="4" x2="21" y2="4" stroke={s.color} strokeWidth="2" strokeDasharray={s.dash||undefined} strokeLinecap="round"/></svg>{s.nombre}
          </span>
        ))}
      </div>
      {n===0 ? <div style={{fontSize:13,color:C.textMuted,padding:"20px 0"}}>Sin datos en el período.</div> : (
        <div ref={caja} style={{position:"relative"}}>
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Tendencia semanal de % días buenos y % días con registro" style={{display:"block",overflow:"visible"}}>
            {[0,25,50,75,100].map(p=>(
              <g key={p}>
                <line x1={M.l} x2={W-M.r} y1={y(p)} y2={y(p)} stroke={C.border} strokeWidth={p===0?1:0.6} strokeDasharray={p===0?undefined:"2 4"}/>
                {p%50===0 && <text x={M.l-6} y={y(p)+4} fontSize="11" textAnchor="end" fill={C.textMuted}>{p}%</text>}
              </g>
            ))}
            {semanas.map((s,i)=> i%paso===0 || i===n-1 ? (
              <text key={s.semana} x={x(i)} y={H-8} fontSize="11" textAnchor="middle" fill={C.textMuted}>{ddmm(s.semana)}</text>
            ) : null)}
            {hover!=null && <line x1={x(hover)} x2={x(hover)} y1={M.t} y2={M.t+ih} stroke={C.textMuted} strokeWidth="1"/>}
            {series.map(s=>(
              <g key={s.key}>
                {tramos(s.key).map((t,k)=> t.length>1
                  ? <polyline key={k} points={t.map(p=>p.join(",")).join(" ")} fill="none" stroke={s.color} strokeWidth="2" strokeDasharray={s.dash||undefined} strokeLinejoin="round" strokeLinecap="round"/>
                  : null)}
                {semanas.map((w,i)=> w[s.key]==null ? null : (
                  <circle key={i} cx={x(i)} cy={y(w[s.key])} r={hover===i?5:4} fill={s.color} stroke={C.surface} strokeWidth="2"/>
                ))}
              </g>
            ))}
            {finales.map(s=> s.u && (
              <text key={s.key} x={x(s.u.i)+10} y={y(s.u.v)+4+(s.dy||0)} fontSize="12" fill={C.textSecond}>{s.corto} {s.u.v}%</text>
            ))}
            {semanas.map((s,i)=>{ // zonas de hover más anchas que la marca
              const ancho = n===1 ? iw : iw/(n-1);
              return <rect key={s.semana} x={x(i)-ancho/2} y={M.t} width={ancho} height={ih} fill="transparent" onMouseEnter={()=>setHover(i)} onMouseLeave={()=>setHover(null)} onClick={()=>setHover(i)}/>;
            })}
          </svg>
          {h && (
            <div role="tooltip" style={{position:"absolute",top:0,left:`${x(hover)/W*100}%`,transform:`translateX(${hover>n/2?"calc(-100% - 10px)":"10px"})`,pointerEvents:"none",
              background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 10px",fontSize:12,color:C.textSecond,boxShadow:"0 2px 8px rgba(0,31,91,0.12)",whiteSpace:"nowrap"}}>
              <div style={{fontWeight:600,color:C.textPrimary,marginBottom:4}}>Semana {ddmm(h.semana)} – {ddmm(addDays(h.semana,6))}</div>
              <div>Buenos: <strong style={{color:C.textPrimary}}>{fmtPct(h.pctBuenos)}</strong> ({h.buenos}/{h.registrados})</div>
              <div>Con registro: <strong style={{color:C.textPrimary}}>{fmtPct(h.pctRegistro)}</strong> ({h.registrados}/{h.dias})</div>
            </div>
          )}
        </div>
      )}
      {n>0 && (
        <details style={{marginTop:8,fontSize:12,color:C.textSecond}}>
          <summary style={{cursor:"pointer",color:C.celeste}}>Ver tabla</summary>
          <table style={{width:"100%",borderCollapse:"collapse",marginTop:6}}>
            <thead><tr style={{color:C.textMuted,textAlign:"left"}}><th style={{padding:"4px 0"}}>Semana</th><th>Buenos</th><th>Con registro</th></tr></thead>
            <tbody>{semanas.map(s=>(
              <tr key={s.semana} style={{borderTop:`1px solid ${C.surfaceAlt}`}}>
                <td style={{padding:"4px 0"}}>{ddmm(s.semana)} – {ddmm(addDays(s.semana,6))}</td>
                <td>{fmtPct(s.pctBuenos)} ({s.buenos}/{s.registrados})</td><td>{fmtPct(s.pctRegistro)} ({s.registrados}/{s.dias})</td>
              </tr>
            ))}</tbody>
          </table>
        </details>
      )}
    </div>
  );
}

// ─── Señal más débil ───────────────────────────────────────────────────
function SenalDebil({ senales }){
  return (
    <div style={card}>
      <div style={{...etiqueta,marginBottom:10}}>Señal más débil · % de Sí</div>
      <div className="proa-senales">
        {senales.map((s,i)=>(
          <div key={s.id} style={{background:i===0&&s.pct!=null?C.warnBg:C.surfaceAlt,borderRadius:8,padding:"10px 10px"}}>
            <div style={{fontSize:12,fontWeight:600,color:C.textSecond}}>{s.nombre}</div>
            <div style={{fontSize:22,fontWeight:700,color:C.navy,margin:"2px 0 6px"}}>{fmtPct(s.pct)}</div>
            <div style={{height:6,borderRadius:3,background:C.surface,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${s.pct||0}%`,background:C.celeste,borderRadius:3}}/>
            </div>
            <div style={{fontSize:11,color:C.textMuted,marginTop:5}}>{s.si}/{s.respondidas} días{s.id==="compromiso"&&s.parcial?` · Parcial: ${s.parcial}`:""}</div>
            {i===0&&s.pct!=null && <div style={{fontSize:11,fontWeight:700,color:C.warn,marginTop:3}}>▼ más débil</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Detalle de un día ─────────────────────────────────────────────────
const RES = { si:{t:"Sí",c:C.yes}, parcial:{t:"Parcial",c:C.warn}, no:{t:"No",c:C.no} };
function Valor({ v, neutro }){
  if (neutro && typeof v==="boolean") return <span style={{fontWeight:700,color:C.navy}}>{v?"Sí":"No"}</span>;
  if (v===true) return <span style={{fontWeight:700,color:C.yes}}>Sí</span>;
  if (v===false) return <span style={{fontWeight:700,color:C.no}}>No</span>;
  if (RES[v]) return <span style={{fontWeight:700,color:RES[v].c}}>{RES[v].t}</span>;
  return <span style={{color:C.textMuted}}>—</span>;
}
function Fila({ titulo, valor, texto, extra, neutro }){
  return (
    <div style={{padding:"10px 0",borderTop:`1px solid ${C.surfaceAlt}`}}>
      <div style={{display:"flex",justifyContent:"space-between",gap:10}}>
        <div style={{fontSize:12,color:C.textMuted}}>{titulo}</div>{valor!==undefined && <Valor v={valor} neutro={neutro}/>}
      </div>
      {extra && <div style={{fontSize:13,color:C.navy,background:C.celestePale,borderRadius:6,padding:"6px 9px",marginTop:5}}>{extra}</div>}
      {texto!==undefined && <div style={{fontSize:13,color:C.textSecond,marginTop:3}}>{texto || <em style={{color:C.textMuted}}>Sin nota</em>}</div>}
    </div>
  );
}
function DetalleDia({ fecha, setFecha, registros, mananaLog, hoy, onCerrar }){
  const r = registros[fecha], m = mananaLog[fecha], estado = estadoDe(fecha, registros, hoy), e = ESTILO[estado];
  const puedeSig = fecha < hoy;
  const cerrar = useRef(null);
  useEffect(()=>{
    const tecla = ev => {
      if (ev.key==="Escape") onCerrar();
      if (ev.key==="ArrowLeft") setFecha(f=>addDays(f,-1));
      if (ev.key==="ArrowRight") setFecha(f=>f<hoy?addDays(f,1):f);
    };
    window.addEventListener("keydown", tecla);
    const prev = document.body.style.overflow; document.body.style.overflow = "hidden";
    cerrar.current?.focus();
    return ()=>{ window.removeEventListener("keydown", tecla); document.body.style.overflow = prev; };
  }, [hoy, onCerrar, setFecha]);
  const nav = activo => ({flex:1,padding:"10px 0",borderRadius:8,border:`1px solid ${C.border}`,background:activo?C.surface:C.surfaceAlt,color:activo?C.navy:C.textMuted,
    fontSize:13,fontWeight:600,cursor:activo?"pointer":"default",fontFamily:"inherit"});
  return (
    <div className="proa-overlay" onClick={onCerrar}>
      <div className="proa-modal" role="dialog" aria-modal="true" aria-label={`Detalle del ${formatDate(fecha)}`} onClick={ev=>ev.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{fontSize:17,fontWeight:700,color:C.textPrimary}}>{dayOfWeek(fecha)} {formatDate(fecha)}</div>
          <button ref={cerrar} onClick={onCerrar} aria-label="Cerrar" style={{width:36,height:36,borderRadius:8,border:`1px solid ${C.border}`,background:C.surface,color:C.navy,fontSize:16,cursor:"pointer"}}>✕</button>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,background:e.suave,borderLeft:`4px solid ${estado==="pendiente"||estado==="sin_registro"?C.border:e.fill}`,borderRadius:8,padding:"10px 12px",marginBottom:6}}>
          <Pastilla estado={estado} grande/>
          <div style={{fontSize:15,fontWeight:700,color:C.textPrimary}}>{estado==="pendiente"?"Pendiente (hoy)":ESTADO_TEXTO[estado]}</div>
        </div>
        {!r ? (
          <div style={{fontSize:13,color:C.textMuted,padding:"14px 0"}}>
            {estado==="pendiente" ? "Todavía no cargaste el check-in de esta noche." : "No hay check-in nocturno de este día."}
            {m?.compromiso && <Fila titulo="Compromiso de la mañana" extra={m.compromiso}/>}
          </div>
        ) : (<>
          {SENALES.filter(s=>s.id!=="compromiso").map(s=>(
            <Fila key={s.id} titulo={s.nombre} valor={r[s.id]} texto={r[`${s.id}_nota`]||""}/>
          ))}
          <Fila titulo="Compromiso de la mañana" valor={r.compromisoCumplido} extra={m?.compromiso || <em style={{color:C.textMuted}}>No cargaste un compromiso esa mañana.</em>}/>
          <div style={{...etiqueta,fontSize:10,margin:"14px 0 2px"}}>Otros campos del check-in</div>
          {r.p4!==undefined && <Fila titulo={PREGUNTA_H2.label} valor={r.p4} texto={r.p4_nota||""}/>}
          {(m?.tareaClave?.texto || r.tareaClaveHecha) && <Fila titulo="★ Tarea clave" valor={r.tareaClaveHecha} extra={m?.tareaClave?.texto}/>}
          {r.conflicto!=null && <Fila titulo="¿Hubo algún conflicto?" neutro valor={r.conflicto} texto={r.conflicto ? (r.conflicto_nota||"") : undefined}/>}
        </>)}
        <div style={{display:"flex",gap:8,marginTop:16}}>
          <button onClick={()=>setFecha(f=>addDays(f,-1))} style={nav(true)}>◀ Día anterior</button>
          <button onClick={()=>puedeSig&&setFecha(f=>addDays(f,1))} disabled={!puedeSig} style={nav(puedeSig)}>Día siguiente ▶</button>
        </div>
      </div>
    </div>
  );
}

// ─── Exportar ──────────────────────────────────────────────────────────
async function copiar(texto){
  try { await navigator.clipboard.writeText(texto); return true; } catch {}
  try {
    const t = document.createElement("textarea"); t.value = texto; t.style.position = "fixed"; t.style.opacity = "0";
    document.body.appendChild(t); t.select(); const ok = document.execCommand("copy"); t.remove(); return ok;
  } catch { return false; }
}
function descargar(texto, nombre){
  const url = URL.createObjectURL(new Blob([texto], { type:"text/markdown;charset=utf-8" }));
  const a = document.createElement("a"); a.href = url; a.download = nombre;
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}

// ─── Vista ─────────────────────────────────────────────────────────────
export default function Proactividad({ registros, mananaLog, today }){
  const [tipo, setTipo] = useState("30");
  const [custom, setCustom] = useState(()=>({ desde:addDays(today,-29), hasta:today }));
  const [detalle, setDetalle] = useState(null);
  const [aviso, setAviso] = useState(null);
  const cerrarDetalle = useCallback(()=>setDetalle(null), []);
  const { desde, hasta } = rangoPeriodo(tipo, today, custom.desde, custom.hasta);
  const a = useMemo(()=>analizarPeriodo(desde, hasta, today, registros), [desde, hasta, today, registros]);
  useEffect(()=>{ if(!aviso) return; const t = setTimeout(()=>setAviso(null), 2200); return ()=>clearTimeout(t); }, [aviso]);
  const md = () => exportarMarkdown(a, registros, mananaLog);
  const onCopiar = async () => setAviso(await copiar(md()) ? "✓ Copiado al portapapeles" : "No se pudo copiar — probá Descargar .md");
  const boton = primario => ({padding:"9px 14px",borderRadius:8,border:primario?"none":`1px solid ${C.border}`,background:primario?C.navy:C.surface,
    color:primario?C.white:C.navy,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"});

  return (
    <div>
      <Filtro tipo={tipo} setTipo={setTipo} custom={custom} setCustom={setCustom} hoy={today}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:14}}>
        <div style={{fontSize:13,color:C.textSecond}}>{formatDate(desde)} – {formatDate(hasta)}</div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={onCopiar} style={boton(true)}>Exportar para Claude</button>
          <button onClick={()=>descargar(md(), `habito1-proactividad-${desde}_${hasta}.md`)} style={boton(false)}>Descargar .md</button>
        </div>
      </div>
      <Indicadores a={a}/>
      <Heatmap a={a} onElegir={setDetalle}/>
      <Tendencia semanas={a.semanas}/>
      <SenalDebil senales={a.senalesOrdenadas}/>
      {detalle && <DetalleDia fecha={detalle} setFecha={setDetalle} registros={registros} mananaLog={mananaLog} hoy={today} onCerrar={cerrarDetalle}/>}
      {aviso && <div role="status" style={{position:"fixed",left:"50%",bottom:24,transform:"translateX(-50%)",background:C.navy,color:C.white,padding:"10px 16px",
        borderRadius:10,fontSize:14,fontWeight:600,boxShadow:"0 4px 14px rgba(0,31,91,0.3)",zIndex:60}}>{aviso}</div>}
    </div>
  );
}
