import { C, card, inp, lbl } from "../theme";
import { PREGUNTAS_H1, PREGUNTA_H2 } from "../content/contenido";
import { addDays, dayOfWeek, formatDate, nocheDisponible, NOCHE_DESDE } from "../lib/fechas";

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

const flecha = (activo) => ({
  width:40,height:40,borderRadius:8,border:`1px solid ${C.border}`,background:activo?C.surface:C.surfaceAlt,
  color:activo?C.navy:C.textMuted,fontSize:16,cursor:activo?"pointer":"default",fontFamily:"inherit",flexShrink:0,
});

export default function Noche({form, setForm, today, registros, manana, onGuardar, savedNoche}){
  const completo = form.p1!==null&&form.p2!==null&&form.p3!==null&&form.p4!==null;
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
      <div style={{...card,borderLeft:`4px solid ${C.celeste}`}}>
        <div style={{fontSize:11,letterSpacing:2,color:C.celeste,textTransform:"uppercase",marginBottom:6}}>{PREGUNTA_H2.label}</div>
        <div style={{fontSize:15,color:C.textPrimary,marginBottom:6,lineHeight:1.5,fontWeight:500}}>{PREGUNTA_H2.pregunta}</div>
        <div style={{fontSize:12,color:C.textMuted,marginBottom:14,fontStyle:"italic"}}>{PREGUNTA_H2.ayuda}</div>
        <SiNo valor={form[PREGUNTA_H2.id]} onChange={val=>setForm({...form,[PREGUNTA_H2.id]:val})}/>
        <textarea placeholder="¿Qué rol quedó más alineado hoy? ¿Cuál quedó en deuda?" value={form[`${PREGUNTA_H2.id}_nota`]}
          onChange={e=>setForm({...form,[`${PREGUNTA_H2.id}_nota`]:e.target.value})}
          rows={2} style={{...inp,resize:"none",lineHeight:1.5,fontSize:13}}/>
      </div>

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
      <Cumplimiento titulo="¿Hice la tarea más importante del día?" texto={manana?.tareaClave?.texto}
        vacio="No elegiste una tarea clave esa mañana." valor={form.tareaClaveHecha} onChange={v=>setForm({...form,tareaClaveHecha:v})}/>

      <button onClick={onGuardar} disabled={!completo}
        style={{width:"100%",padding:14,borderRadius:10,border:"none",background:completo?C.navy:C.surfaceAlt,color:completo?C.white:C.textMuted,fontSize:15,fontFamily:"inherit",fontWeight:600,cursor:"pointer",transition:"all 0.2s"}}>
        {savedNoche?"✓ Guardado y sincronizado":"Guardar registro del día"}
      </button>
      </>)}
    </div>
  );
}
