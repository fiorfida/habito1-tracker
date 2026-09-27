import { C, card, inp, lbl } from "../theme";
import { PREGUNTAS_H1, PREGUNTA_H2 } from "../content/contenido";
import { addDays, dayOfWeek, formatDate, nocheDisponible, NOCHE_DESDE } from "../lib/fechas";

function SiNo({valor, onChange}){
  return (
    <div style={{display:"flex",gap:8,marginBottom:12}}>
      {[true,false].map(val=>(
        <button key={String(val)} onClick={()=>onChange(val)} style={{padding:"8px 32px",borderRadius:8,border:"2px solid",cursor:"pointer",fontFamily:"inherit",fontSize:14,fontWeight:700,background:valor===val?(val?C.yesBg:C.noBg):C.surfaceAlt,color:valor===val?(val?C.yes:C.no):C.textMuted,borderColor:valor===val?(val?C.yes:C.no):C.border,transition:"all 0.15s"}}>{val?"SÍ":"NO"}</button>
      ))}
    </div>
  );
}

const flecha = (activo) => ({
  width:40,height:40,borderRadius:8,border:`1px solid ${C.border}`,background:activo?C.surface:C.surfaceAlt,
  color:activo?C.navy:C.textMuted,fontSize:16,cursor:activo?"pointer":"default",fontFamily:"inherit",flexShrink:0,
});

export default function Noche({form, setForm, today, registros, onGuardar, savedNoche}){
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

      <button onClick={onGuardar} disabled={!completo}
        style={{width:"100%",padding:14,borderRadius:10,border:"none",background:completo?C.navy:C.surfaceAlt,color:completo?C.white:C.textMuted,fontSize:15,fontFamily:"inherit",fontWeight:600,cursor:"pointer",transition:"all 0.2s"}}>
        {savedNoche?"✓ Guardado y sincronizado":"Guardar registro del día"}
      </button>
      </>)}
    </div>
  );
}
