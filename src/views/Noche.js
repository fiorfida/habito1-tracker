import { C, card, inp, lbl } from "../theme";
import { PREGUNTAS_H1, PREGUNTA_H2 } from "../content/contenido";

function SiNo({valor, onChange}){
  return (
    <div style={{display:"flex",gap:8,marginBottom:12}}>
      {[true,false].map(val=>(
        <button key={String(val)} onClick={()=>onChange(val)} style={{padding:"8px 32px",borderRadius:8,border:"2px solid",cursor:"pointer",fontFamily:"inherit",fontSize:14,fontWeight:700,background:valor===val?(val?C.yesBg:C.noBg):C.surfaceAlt,color:valor===val?(val?C.yes:C.no):C.textMuted,borderColor:valor===val?(val?C.yes:C.no):C.border,transition:"all 0.15s"}}>{val?"SÍ":"NO"}</button>
      ))}
    </div>
  );
}

export default function Noche({form, setForm, today, registros, onGuardar, savedNoche}){
  const completo = form.p1!==null&&form.p2!==null&&form.p3!==null&&form.p4!==null;
  return (
    <div>
      <div style={{marginBottom:18}}>
        <label style={lbl}>Fecha del registro</label>
        <input type="date" value={form.fecha} max={today}
          onChange={e=>setForm({...form,fecha:e.target.value})} style={inp}/>
        {registros[form.fecha] && <div style={{marginTop:6,fontSize:12,color:C.celeste}}>✏️ Ya tenés un registro para este día — podés editarlo.</div>}
      </div>

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
    </div>
  );
}
