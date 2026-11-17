import { C, card, inp, lbl } from "../theme";
import { PREGUNTAS_H1, PREGUNTA_H2, SALIDAS, PEDIDOS_NOCHE } from "../content/contenido";
import { COLOR_SALIDA } from "../components/ui";
import { entradasSinSalida } from "../lib/habito2";
import { addDays, dayOfWeek, formatDate, nocheDisponible, NOCHE_DESDE } from "../lib/fechas";
import { finDefinido, partesFin, FIN_CUMPLIDO } from "../lib/fin";

// `neutro`: el Sí no es "bueno" ni el No "malo" (p. ej. ¿hubo conflicto?).
function SiNo({valor, onChange, neutro}){
  const col = val => neutro ? {fg:C.navy, bg:C.celestePale} : val ? {fg:C.yes, bg:C.yesBg} : {fg:C.no, bg:C.noBg};
  return (
    <div style={{display:"flex",gap:8,marginBottom:12}}>
      {[true,false].map(val=>(
        <button key={String(val)} onClick={()=>onChange(val)} style={{padding:"8px 32px",borderRadius:8,border:"2px solid",cursor:"pointer",fontFamily:"inherit",fontSize:14,fontWeight:700,background:valor===val?col(val).bg:C.surfaceAlt,color:valor===val?col(val).fg:C.textMuted,borderColor:valor===val?col(val).fg:C.border,transition:"all 0.15s"}}>{val?"SÍ":"NO"}</button>
      ))}
    </div>
  );
}

const OPCIONES = [
  {v:"si", t:"Sí", fg:C.yes, bg:C.yesBg}, {v:"parcial", t:"Parcial", fg:C.warn, bg:C.warnBg}, {v:"no", t:"No", fg:C.no, bg:C.noBg},
];
function Cumplimiento({titulo, texto, vacio, valor, onChange}){
  return (
    <div style={card}>
      <div style={{fontSize:15,color:C.textPrimary,marginBottom:8,lineHeight:1.5,fontWeight:500}}>{titulo}</div>
      {!texto ? <div style={{fontSize:13,color:C.textMuted,fontStyle:"italic"}}>{vacio}</div> : (<>
        <div style={{fontSize:14,color:C.navy,background:C.celestePale,borderRadius:8,padding:"10px 12px",marginBottom:12}}>{texto}</div>
        <div style={{display:"flex",gap:8}}>
          {OPCIONES.map(o=>(
            <button key={o.v} onClick={()=>onChange(valor===o.v?null:o.v)} style={{flex:1,padding:"10px 0",borderRadius:8,border:"2px solid",cursor:"pointer",fontFamily:"inherit",fontSize:14,fontWeight:700,
              background:valor===o.v?o.bg:C.surfaceAlt,color:valor===o.v?o.fg:C.textMuted,borderColor:valor===o.v?o.fg:C.border}}>{o.t}</button>
          ))}
        </div>
      </>)}
    </div>
  );
}

// 🎯 Mi fin para hoy: la frase de la mañana (solo lectura) y si lo viví.
// Reemplaza a H2 — Alineación y a "¿Hice la tarea más importante?" (se derivan al guardar, ver App.js).
const NOTA_H2 = "¿Qué rol quedó más alineado hoy? ¿Cuál quedó en deuda?";
function FinDelDia({manana, form, setForm}){
  const p = partesFin(manana);
  const valor = form.finCumplido;
  const colores = { si:{fg:C.yes,bg:C.yesBg}, parcial:{fg:C.warn,bg:C.warnBg}, no:{fg:C.no,bg:C.noBg} };
  return (
    <div style={{...card,borderLeft:`4px solid ${C.gold}`}}>
      <div style={{fontSize:11,letterSpacing:2,color:C.gold,textTransform:"uppercase",marginBottom:8,fontWeight:700}}>🎯 Mi fin para hoy</div>
      <div style={{fontSize:15,lineHeight:1.6,color:C.textPrimary,background:C.goldBg,borderRadius:8,padding:"12px 14px",marginBottom:14}}>
        Hoy priorizo <strong style={{color:C.navy}}>{p.rol}</strong>, guiado por <strong style={{color:C.navy}}>{p.principio}</strong>: <strong style={{color:C.navy}}>{p.tarea}</strong>.
      </div>
      <div style={{fontSize:15,color:C.textPrimary,marginBottom:4,lineHeight:1.5,fontWeight:500}}>¿Viviste tu fin de hoy?</div>
      <div style={{fontSize:12,color:C.textMuted,marginBottom:12,fontStyle:"italic"}}>Hice la tarea y la viví en ese rol, con ese principio. "A medias" cuenta como No en Alineación.</div>
      <div style={{display:"flex",gap:8,marginBottom:12}}>
        {FIN_CUMPLIDO.map(o=>(
          <button key={o.v} onClick={()=>setForm({...form, finCumplido:valor===o.v?null:o.v})} style={{flex:1,padding:"10px 0",borderRadius:8,border:"2px solid",cursor:"pointer",fontFamily:"inherit",fontSize:14,fontWeight:700,
            background:valor===o.v?colores[o.v].bg:C.surfaceAlt,color:valor===o.v?colores[o.v].fg:C.textMuted,borderColor:valor===o.v?colores[o.v].fg:C.border}}>{o.t}</button>
        ))}
      </div>
      <textarea placeholder={NOTA_H2} value={form[`${PREGUNTA_H2.id}_nota`]}
        onChange={e=>setForm({...form,[`${PREGUNTA_H2.id}_nota`]:e.target.value})}
        rows={2} style={{...inp,resize:"none",lineHeight:1.5,fontSize:13}}/>
    </div>
  );
}

// Hábito 2 · pedidos del día y la salida elegida (hasta PEDIDOS_NOCHE.maximo).
const vacia = () => ({pedido:"", salida:null});
function PedidosDelDia({form, setForm}){
  const lista = form.pedidos?.length ? form.pedidos : [vacia()];
  const sinSalida = entradasSinSalida(lista);
  const setLista = (l) => setForm({...form, pedidos:l});
  const setEntrada = (k, c) => setLista(lista.map((x,j)=>j===k?{...x,...c}:x));
  const btnLink = { background:"none", border:"none", color:C.celeste, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit", padding:0 };
  return (
    <div style={{...card,borderLeft:`4px solid ${C.gold}`}}>
      <div style={{fontSize:15,color:C.textPrimary,marginBottom:4,lineHeight:1.5,fontWeight:500}}>{PEDIDOS_NOCHE.pregunta}</div>
      <div style={{fontSize:12,color:C.textMuted,marginBottom:12,fontStyle:"italic"}}>{PEDIDOS_NOCHE.ayuda}</div>
      <label style={{display:"flex",gap:8,alignItems:"center",fontSize:13,color:C.textSecond,marginBottom:form.sinPedidos?0:12}}>
        <input type="checkbox" checked={!!form.sinPedidos} onChange={e=>setForm({...form, sinPedidos:e.target.checked})}/>
        {PEDIDOS_NOCHE.sinPedidos}
      </label>
      {!form.sinPedidos && (<>
        {lista.map((x,k)=>{
          const falta = sinSalida.includes(k);
          return (
            <div key={k} style={{paddingBottom:12,marginBottom:12,borderBottom:`1px solid ${C.border}`}}>
              <div style={{display:"flex",gap:8,marginBottom:8}}>
                <input value={x.pedido} onChange={e=>setEntrada(k,{pedido:e.target.value})} placeholder={PEDIDOS_NOCHE.placeholder}
                  maxLength={140} style={{...inp,fontSize:13}}/>
                <button onClick={()=>setLista(lista.length>1?lista.filter((_,j)=>j!==k):[vacia()])} style={{...btnLink,color:C.textMuted}} aria-label="Eliminar pedido">✕</button>
              </div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {SALIDAS.map(s=>{
                  const activo = x.salida===s.v, col = COLOR_SALIDA[s.v];
                  return (
                    <button key={s.v} onClick={()=>setEntrada(k,{salida:activo?null:s.v})} title={s.ayuda}
                      style={{flex:"1 1 90px",padding:"9px 6px",borderRadius:8,border:"2px solid",cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:700,
                        background:activo?col.bg:C.surfaceAlt,color:activo?col.fg:C.textMuted,borderColor:activo?col.fg:falta?C.no:C.border}}>{s.t}</button>
                  );
                })}
              </div>
              {falta && <div style={{fontSize:12,color:C.no,marginTop:6}}>{PEDIDOS_NOCHE.faltaSalida}</div>}
            </div>
          );
        })}
        {lista.length<PEDIDOS_NOCHE.maximo && <button onClick={()=>setLista([...lista, vacia()])} style={btnLink}>{PEDIDOS_NOCHE.agregar}</button>}
      </>)}
    </div>
  );
}

const flecha = (activo) => ({
  width:40,height:40,borderRadius:8,border:`1px solid ${C.border}`,background:activo?C.surface:C.surfaceAlt,
  color:activo?C.navy:C.textMuted,fontSize:16,cursor:activo?"pointer":"default",fontFamily:"inherit",flexShrink:0,
});

export default function Noche({form, setForm, today, registros, manana, onGuardar, savedNoche}){
  // Con fin definido, "¿Viviste tu fin?" reemplaza a Alineación (p4 se deriva al guardar).
  const conFin = finDefinido(manana);
  // Un pedido con texto y sin salida frena el guardado hasta completarlo (se marca en la card).
  const pedidosIncompletos = !form.sinPedidos && entradasSinSalida(form.pedidos).length>0;
  const completo = form.p1!==null&&form.p2!==null&&form.p3!==null&&(conFin ? form.finCumplido!==null : form.p4!==null) && !pedidosIncompletos;
  const esHoy = form.fecha===today;
  const bloqueada = !nocheDisponible(form.fecha) && !registros[form.fecha];
  const irA = f => setForm({...form, fecha:f});
  return (
    <div>
      <div style={{marginBottom:18}}>
        <label style={lbl}>Fecha del registro</label>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button onClick={()=>irA(addDays(form.fecha,-1))} style={flecha(true)} aria-label="Día anterior">◀</button>
          <div style={{...inp,flex:1,textAlign:"center",fontWeight:600}}>{dayOfWeek(form.fecha)} {formatDate(form.fecha)}</div>
          <button onClick={()=>!esHoy&&irA(addDays(form.fecha,1))} disabled={esHoy} style={flecha(!esHoy)} aria-label="Día siguiente">▶</button>
          {!esHoy && <button onClick={()=>irA(today)} style={{...flecha(true),width:"auto",padding:"0 12px",fontSize:13,fontWeight:600}}>Hoy</button>}
        </div>
        {registros[form.fecha] && <div style={{marginTop:6,fontSize:12,color:C.celeste}}>✏️ Ya tenés un registro para este día — podés editarlo.</div>}
      </div>

      {bloqueada ? (
        <div style={{...card,background:C.surfaceAlt,textAlign:"center",padding:"32px 16px"}}>
          <div style={{fontSize:28,marginBottom:8}}>🌙</div>
          <div style={{fontSize:15,fontWeight:600,color:C.textSecond}}>Disponible desde las {NOCHE_DESDE}:00</div>
          <div style={{fontSize:12,color:C.textMuted,marginTop:6}}>El check-in de hoy se habilita a la noche. Con ◀ podés completar días anteriores.</div>
        </div>
      ) : (<>

      <div style={{fontSize:11,letterSpacing:2,color:C.textMuted,textTransform:"uppercase",marginBottom:10}}>Hábito 1 — Sea Proactivo</div>
      {PREGUNTAS_H1.map(p=>(
        <div key={p.id} style={card}>
          <div style={{fontSize:11,letterSpacing:2,color:C.textMuted,textTransform:"uppercase",marginBottom:6}}>{p.label}</div>
          <div style={{fontSize:15,color:C.textPrimary,marginBottom:6,lineHeight:1.5,fontWeight:500}}>{p.pregunta}</div>
          <div style={{fontSize:12,color:C.textMuted,marginBottom:14,fontStyle:"italic"}}>{p.ayuda}</div>
          <SiNo valor={form[p.id]} onChange={val=>setForm({...form,[p.id]:val})}/>
          <textarea placeholder="Una línea explicando..." value={form[`${p.id}_nota`]}
            onChange={e=>setForm({...form,[`${p.id}_nota`]:e.target.value})}
            rows={2} style={{...inp,resize:"none",lineHeight:1.5,fontSize:13}}/>
        </div>
      ))}

      <div style={{fontSize:11,letterSpacing:2,color:C.textMuted,textTransform:"uppercase",marginBottom:10,marginTop:6}}>Hábito 2 — Empiece con un fin en mente</div>
      {conFin ? <FinDelDia manana={manana} form={form} setForm={setForm}/> : (
      <div style={{...card,borderLeft:`4px solid ${C.celeste}`}}>
        <div style={{fontSize:12,color:C.gold,fontWeight:600,marginBottom:10}}>🎯 {esHoy?"No definiste tu fin hoy.":"No definiste tu fin ese día."}</div>
        <div style={{fontSize:11,letterSpacing:2,color:C.celeste,textTransform:"uppercase",marginBottom:6}}>{PREGUNTA_H2.label}</div>
        <div style={{fontSize:15,color:C.textPrimary,marginBottom:6,lineHeight:1.5,fontWeight:500}}>{PREGUNTA_H2.pregunta}</div>
        <div style={{fontSize:12,color:C.textMuted,marginBottom:14,fontStyle:"italic"}}>{PREGUNTA_H2.ayuda}</div>
        <SiNo valor={form[PREGUNTA_H2.id]} onChange={val=>setForm({...form,[PREGUNTA_H2.id]:val})}/>
        <textarea placeholder={NOTA_H2} value={form[`${PREGUNTA_H2.id}_nota`]}
          onChange={e=>setForm({...form,[`${PREGUNTA_H2.id}_nota`]:e.target.value})}
          rows={2} style={{...inp,resize:"none",lineHeight:1.5,fontSize:13}}/>
      </div>
      )}
      <PedidosDelDia form={form} setForm={setForm}/>

      <div style={{fontSize:11,letterSpacing:2,color:C.textMuted,textTransform:"uppercase",marginBottom:10,marginTop:6}}>Cierre del día · opcional</div>
      <div style={card}>
        <div style={{fontSize:15,color:C.textPrimary,marginBottom:12,lineHeight:1.5,fontWeight:500}}>¿Hubo algún conflicto hoy?</div>
        <SiNo valor={form.conflicto} onChange={val=>setForm({...form,conflicto:val})} neutro/>
        {form.conflicto && (
          <textarea placeholder="¿Qué pude haber hecho yo diferente?" value={form.conflicto_nota}
            onChange={e=>setForm({...form,conflicto_nota:e.target.value})}
            rows={3} style={{...inp,resize:"none",lineHeight:1.5,fontSize:13}}/>
        )}
      </div>
      <Cumplimiento titulo="¿Cumplí el compromiso de la mañana?" texto={manana?.compromiso}
        vacio="No cargaste un compromiso esa mañana." valor={form.compromisoCumplido} onChange={v=>setForm({...form,compromisoCumplido:v})}/>
      {!conFin && <Cumplimiento titulo="¿Hice la tarea más importante del día?" texto={manana?.tareaClave?.texto}
        vacio="No elegiste una tarea clave esa mañana." valor={form.tareaClaveHecha} onChange={v=>setForm({...form,tareaClaveHecha:v})}/>}

      <button onClick={onGuardar} disabled={!completo}
        style={{width:"100%",padding:14,borderRadius:10,border:"none",background:completo?C.navy:C.surfaceAlt,color:completo?C.white:C.textMuted,fontSize:15,fontFamily:"inherit",fontWeight:600,cursor:"pointer",transition:"all 0.2s"}}>
        {savedNoche?"✓ Guardado y sincronizado":"Guardar registro del día"}
      </button>
      {pedidosIncompletos && <div style={{fontSize:12,color:C.no,marginTop:8,textAlign:"center"}}>Falta elegir la salida de un pedido (Hábito 2).</div>}
      </>)}
    </div>
  );
}
