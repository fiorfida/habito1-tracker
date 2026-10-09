import { useState, useEffect } from "react";
import { C, card, inp, btnPrimario } from "../theme";
import { SLabel } from "../components/ui";
import { MatrizDecision } from "../components/Chispa";
import { ROLES } from "../content/contenido";
import { formatDate, todayBsAs, addDays } from "../lib/fechas";
import { nuevoId } from "../lib/datos";
import { semanasDelTrimestre, partesTrimestre, nombreTrimestre } from "../lib/periodos";
import { objetivosDelAnio } from "./ObjetivosAnio";

const btnLink = { background:"none", border:"none", color:C.celeste, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit", padding:0 };
const campo = { ...inp, fontSize:13, padding:"8px 10px" };
const MESES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
const UMBRAL_SEMANA = 5; // más acciones que esto en una semana se marca como cargada

const vacio = (K) => ({ trimestre:K, objetivos:[], prioridad:"", decisiones:[] });

// Plan del trimestre: Rol → Objetivo → Acciones repartidas en las semanas.
export default function PlanTrimestral({K, doc, objetivos, pesos, onGuardar}){
  const [plan, setPlan] = useState(()=>({...vacio(K), ...(doc||{})}));
  const [sucio, setSucio] = useState(false);
  const [aviso, setAviso] = useState(null);
  const [matriz, setMatriz] = useState(false);
  useEffect(()=>{ if (!sucio) setPlan({...vacio(K), ...(doc||{})}); }, [doc, K]);

  const semanas = semanasDelTrimestre(K);
  const { anio, meses } = partesTrimestre(K);
  const anuales = objetivosDelAnio(objetivos, anio);
  const cambiar = (fn) => { setPlan(p=>fn(p)); setSucio(true); setAviso(null); };
  const setObj = (id, c) => cambiar(p=>({...p, objetivos:p.objetivos.map(o=>o.id===id?{...o,...c}:o)}));
  const setAcc = (oid, aid, c) => cambiar(p=>({...p, objetivos:p.objetivos.map(o=>o.id!==oid?o:{...o, acciones:o.acciones.map(a=>a.id===aid?{...a,...c}:a)})}));
  const guardar = async () => {
    const limpio = {...plan, objetivos:plan.objetivos.filter(o=>o.texto.trim()).map(o=>({...o, acciones:o.acciones.filter(a=>a.texto.trim())}))};
    if (await onGuardar(K, limpio)) { setPlan(limpio); setSucio(false); setAviso("✓ Plan guardado"); }
  };

  const acciones = plan.objetivos.flatMap(o=>o.acciones.map(a=>({...a, rol:o.rol, objetivo:o.texto})));
  const porSemana = Object.fromEntries(semanas.map(s=>[s, acciones.filter(a=>a.semana===s)]));
  const sinSemana = acciones.filter(a=>!a.semana && a.texto.trim()).length;
  const etiquetaSemana = (s,i) => `Sem ${i+1} · ${formatDate(s).slice(0,5)}`;

  return (
    <div>
      <div style={{fontSize:12,color:C.textMuted,marginBottom:12}}>
        {nombreTrimestre(K)} · {semanas.length} semanas, del {formatDate(semanas[0])} al {formatDate(addDays(semanas[semanas.length-1],6))}. Por rol: objetivos del trimestre y sus acciones, cada una en una semana.
      </div>

      <div className="roles-grid">
        {ROLES.map(r=>{
          const delRol = plan.objetivos.filter(o=>o.rol===r.num);
          const anualesRol = anuales.filter(o=>o.rol===r.num);
          return (
            <div key={r.num} style={card}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <span style={{fontSize:14,fontWeight:600,color:C.textPrimary}}>{r.num} · {r.nombre}</span>
                <button onClick={()=>cambiar(p=>({...p, objetivos:[...p.objetivos,{id:nuevoId(), rol:r.num, texto:"", objetivoAnual:anualesRol.find(o=>o.central)?.id||null, acciones:[{id:nuevoId(),texto:"",semana:null}]}]}))} style={{...btnLink,fontSize:12}}>+ Objetivo</button>
              </div>
              {anualesRol.length>0 && <div style={{fontSize:11,color:C.textMuted,marginBottom:6}}>Objetivos {anio}: {anualesRol.map(o=>(o.central?"★ ":"")+o.titulo).join(" · ")}</div>}
              {delRol.length===0 && <div style={{fontSize:12,color:C.textMuted,fontStyle:"italic"}}>Sin objetivos para el trimestre.</div>}
              {delRol.map(o=>(
                <div key={o.id} style={{borderTop:`1px solid ${C.border}`,paddingTop:8,marginTop:6}}>
                  <div style={{display:"flex",gap:6}}>
                    <input value={o.texto} onChange={e=>setObj(o.id,{texto:e.target.value})} placeholder="Objetivo del trimestre" style={{...campo,fontWeight:600}}/>
                    <button onClick={()=>cambiar(p=>({...p, objetivos:p.objetivos.filter(x=>x.id!==o.id)}))} style={{...btnLink,color:C.textMuted}} aria-label="Quitar objetivo">✕</button>
                  </div>
                  {anualesRol.length>0 && (
                    <select value={o.objetivoAnual||""} onChange={e=>setObj(o.id,{objetivoAnual:e.target.value||null})} style={{...campo,marginTop:6,fontSize:12}}>
                      <option value="">Sin objetivo anual asociado</option>
                      {anualesRol.map(a=><option key={a.id} value={a.id}>Aporta a: {a.titulo}</option>)}
                    </select>
                  )}
                  {o.acciones.map(a=>(
                    <div key={a.id} style={{display:"flex",gap:6,marginTop:6,paddingLeft:10}}>
                      <input value={a.texto} onChange={e=>setAcc(o.id,a.id,{texto:e.target.value})} placeholder="Acción" style={{...campo,fontSize:12}}/>
                      <select value={a.semana||""} onChange={e=>setAcc(o.id,a.id,{semana:e.target.value||null})} style={{...campo,fontSize:12,width:"auto",flexShrink:0}}>
                        <option value="">Semana</option>
                        {semanas.map((s,i)=><option key={s} value={s}>{etiquetaSemana(s,i)}</option>)}
                      </select>
                      <button onClick={()=>setObj(o.id,{acciones:o.acciones.filter(x=>x.id!==a.id)})} style={{...btnLink,color:C.textMuted}} aria-label="Quitar acción">✕</button>
                    </div>
                  ))}
                  <button onClick={()=>setObj(o.id,{acciones:[...o.acciones,{id:nuevoId(),texto:"",semana:null}]})} style={{...btnLink,fontSize:12,marginTop:6,paddingLeft:10}}>+ Acción</button>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <div style={card}>
        <SLabel>Carga por semana</SLabel>
        <div style={{fontSize:12,color:C.textMuted,marginTop:-8,marginBottom:10}}>Para no sobrecargar ninguna semana. {sinSemana>0 && <strong style={{color:C.warn}}>{sinSemana} acción{sinSemana===1?"":"es"} sin semana.</strong>}</div>
        {meses.map(mes=>{
          const delMes = semanas.map((s,i)=>({s,i})).filter(({s})=>addDays(s,6).slice(0,7)===mes);
          return (
            <div key={mes} style={{marginBottom:10}}>
              <div style={{fontSize:12,fontWeight:700,color:C.navy,marginBottom:4,textTransform:"capitalize"}}>{MESES[Number(mes.slice(5))-1]}</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {delMes.map(({s,i})=>{
                  const n = porSemana[s].length;
                  return (
                    <div key={s} title={porSemana[s].map(a=>`${a.texto} (rol ${a.rol})`).join("\n")} style={{flex:"1 1 70px",border:`1px solid ${n>UMBRAL_SEMANA?C.warn:C.border}`,background:n>UMBRAL_SEMANA?C.warnBg:n?C.celestePale:C.surface,borderRadius:8,padding:"6px 8px"}}>
                      <div style={{fontSize:11,color:C.textMuted}}>{etiquetaSemana(s,i)}</div>
                      <div style={{fontSize:16,fontWeight:700,color:n>UMBRAL_SEMANA?C.warn:C.navy}}>{n}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div style={card}>
        <SLabel>Priorización</SLabel>
        <div style={{fontSize:13,color:C.textSecond,marginBottom:8}}>¿Hay algún objetivo que, si lo logro este trimestre, haría más fáciles los demás?</div>
        <textarea value={plan.prioridad} onChange={e=>cambiar(p=>({...p,prioridad:e.target.value}))} rows={2} style={{...inp,resize:"vertical",fontSize:13}}/>
        <button onClick={()=>setMatriz(!matriz)} style={{...btnLink,marginTop:10}}>{matriz?"Ocultar matriz":"Pasar objetivos nuevos por la matriz de la chispa"}</button>
        {(plan.decisiones||[]).map((d,k)=><div key={k} style={{fontSize:12,color:C.textSecond,marginTop:6}}>{d.contexto} → <strong>{d.elegida}</strong></div>)}
      </div>
      {matriz && <MatrizDecision pesos={pesos} alternativasIniciales={plan.objetivos.filter(o=>o.texto.trim()).slice(0,3).map(o=>o.texto)}
        onGuardar={d=>cambiar(p=>({...p, decisiones:[...(p.decisiones||[]), {...d, fecha:todayBsAs()}]}))}/>}

      <button onClick={guardar} style={{...btnPrimario,background:sucio?C.navy:C.surfaceAlt,color:sucio?C.white:C.textMuted}}>
        {sucio?`Guardar plan ${nombreTrimestre(K)}`:aviso||"Sin cambios"}
      </button>
    </div>
  );
}
