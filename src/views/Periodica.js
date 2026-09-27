import { C, card, inp, btnPrimario } from "../theme";
import { SLabel, EstadoBanner, MetasRolLista } from "../components/ui";
import { ROLES, PREGUNTAS_SEMANA, PREGUNTAS_TRIMESTRE, PREGUNTAS_ANUAL } from "../content/contenido";
import { formatDate, addDays } from "../lib/fechas";
import { metasActivas } from "../lib/metas";
import { ChispaResumen, ChispaVista } from "../components/Chispa";

export default function Periodica(props){
  const { sub, setSub, semanaEstado, trimEstado, anualEstado } = props;
  return (
    <div>
      <div style={{display:"flex",gap:4,marginBottom:20,background:C.surfaceAlt,borderRadius:10,padding:4}}>
        {[
          {id:"semanal",    label:"Semanal",    pend:semanaEstado!=="completada"},
          {id:"trimestral", label:"Trimestral", pend:trimEstado!=="completada"},
          {id:"anual",      label:"Anual",      pend:anualEstado!=="completada"},
          {id:"chispa",     label:"🔥 Chispa",  pend:false},
        ].map(s=>(
          <button key={s.id} onClick={()=>setSub(s.id)} style={{
            flex:1,position:"relative",padding:"10px 4px",borderRadius:8,border:"none",cursor:"pointer",whiteSpace:"nowrap",
            background:sub===s.id?C.navy:"transparent",
            color:sub===s.id?C.white:C.textSecond,
            fontSize:13,fontFamily:"inherit",fontWeight:600,transition:"all 0.2s",
          }}>
            {s.label}
            {s.pend && <span style={{position:"absolute",top:4,right:6,width:6,height:6,borderRadius:"50%",background:sub===s.id?C.celesteLight:C.warn}}/>}
          </button>
        ))}
      </div>

      {(sub==="trimestral"||sub==="anual") && <ChispaResumen chispa={props.chispa} onAbrir={()=>setSub("chispa")}/>}

      {sub==="chispa" && <ChispaVista chispa={props.chispa} onGuardar={props.onGuardarChispa}/>}

      {sub==="semanal" && <Semanal {...props}/>}

      {sub==="trimestral" && (
        <ReflexionSimple estado={trimEstado} nombre="trimestral" icono="⭐"
          subtitulo={`T${props.trimInfo.quarter} ${props.trimInfo.quarterYear}`}
          preguntas={PREGUNTAS_TRIMESTRE} form={props.trimestreForm} setForm={props.setTrimestreForm}
          onGuardar={props.onGuardarTrimestre} saved={props.savedTrimestre}
          log={props.trimestreLog} tituloItem={key=>key.replace("-Q"," · T")}/>
      )}

      {sub==="anual" && (
        <ReflexionSimple estado={anualEstado} nombre="anual" icono="⭐"
          subtitulo={`Año ${props.anualInfo.reviewedYear}`}
          preguntas={PREGUNTAS_ANUAL} form={props.anualForm} setForm={props.setAnualForm}
          onGuardar={props.onGuardarAnual} saved={props.savedAnual}
          log={props.anualLog} tituloItem={year=>`Año ${year}`}/>
      )}
    </div>
  );
}

function Preguntas({preguntas, form, setForm}){
  return preguntas.map((p,i)=>(
    <div key={p.id} style={{marginBottom:i<preguntas.length-1?20:0}}>
      <div style={{fontSize:14,fontWeight:500,color:C.textPrimary,marginBottom:8,lineHeight:1.5}}>{p.pregunta}</div>
      <textarea placeholder={p.placeholder} value={form[p.id]}
        onChange={e=>setForm({...form,[p.id]:e.target.value})}
        rows={3} style={{...inp,resize:"none",lineHeight:1.5,fontSize:13}}/>
    </div>
  ));
}

function Respuestas({preguntas, datos}){
  return preguntas.map(p=>(
    <div key={p.id} style={{marginBottom:10}}>
      <div style={{fontSize:11,color:C.celeste,textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>{p.pregunta.slice(0,45)}…</div>
      <div style={{fontSize:13,color:C.textSecond}}>{datos[p.id]||<em style={{color:C.textMuted}}>Sin respuesta</em>}</div>
    </div>
  ));
}

function Semanal({semanaEstado, wkStart, semanaForm, setSemanaForm, onMetaChange, onGuardarSemana, savedSemana, semanaLog}){
  return (
    <div>
      <EstadoBanner estado={semanaEstado}
        tituloPendiente="📋 Reflexión semanal pendiente"
        tituloVencida="⚠️ Reflexión semanal vencida"
        tituloCompletada="✓ Reflexión semanal completada"
        subtitulo={`Semana del ${formatDate(wkStart)} al ${formatDate(addDays(wkStart,6))}`}/>

      <div style={{...card,marginBottom:20}}>
        <SLabel>Selección de metas por rol</SLabel>
        <div style={{fontSize:12,color:C.textMuted,marginTop:-8,marginBottom:14}}>Elegí 2-3 metas por rol para esta semana, antes de mirar cualquier pendiente.</div>
        <div className="roles-grid">
          {ROLES.map((r,i)=>(
            <div key={r.num} style={{paddingBottom:i<ROLES.length-1?14:0,marginBottom:i<ROLES.length-1?14:0,borderBottom:i<ROLES.length-1?`1px solid ${C.border}`:"none"}}>
              <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:8}}>
                <div style={{width:24,height:24,borderRadius:"50%",background:C.navy,color:C.white,fontSize:11,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{r.num}</div>
                <div style={{fontSize:13,color:C.textPrimary,fontWeight:500}}>{r.nombre}</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {[0,1,2].map(idx=>(
                  <input key={idx} type="text" value={semanaForm.metas[r.num][idx]}
                    onChange={e=>onMetaChange(r.num, idx, e.target.value)}
                    placeholder={idx===0?"Meta 1":`Meta ${idx+1} (opcional)`}
                    style={{...inp,fontSize:13,padding:"8px 10px"}}/>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={card}>
        <SLabel>Reflexión semanal</SLabel>
        <Preguntas preguntas={PREGUNTAS_SEMANA} form={semanaForm} setForm={setSemanaForm}/>
        <button onClick={onGuardarSemana} style={{...btnPrimario,marginTop:16}}>
          {savedSemana?"✓ Reflexión guardada y sincronizada":"Guardar reflexión semanal"}
        </button>
      </div>

      {Object.keys(semanaLog).length>0&&(
        <div style={{marginTop:24}}>
          <SLabel>Reflexiones anteriores</SLabel>
          {Object.keys(semanaLog).sort((a,b)=>b.localeCompare(a)).map(wk=>{
            const s=semanaLog[wk];
            return (
              <div key={wk} style={{...card,marginBottom:12}}>
                <div style={{fontSize:13,fontWeight:600,color:C.navy,marginBottom:12}}>Semana del {formatDate(wk)}</div>
                {metasActivas(s.metas).length>0 && (
                  <div style={{marginBottom:14,paddingBottom:14,borderBottom:`1px solid ${C.border}`}}>
                    <div style={{fontSize:11,color:C.textMuted,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Metas por rol</div>
                    <MetasRolLista metas={s.metas}/>
                  </div>
                )}
                <Respuestas preguntas={PREGUNTAS_SEMANA} datos={s}/>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ReflexionSimple({estado, nombre, icono, subtitulo, preguntas, form, setForm, onGuardar, saved, log, tituloItem}){
  return (
    <div>
      <EstadoBanner estado={estado}
        tituloPendiente={`${icono} Reflexión ${nombre} pendiente`}
        tituloVencida={`⚠️ Reflexión ${nombre} vencida`}
        tituloCompletada={`✓ Reflexión ${nombre} completada`}
        subtitulo={subtitulo}/>

      <div style={card}>
        <SLabel>Reflexión {nombre}</SLabel>
        <Preguntas preguntas={preguntas} form={form} setForm={setForm}/>
        <button onClick={onGuardar} style={{...btnPrimario,marginTop:16}}>
          {saved?"✓ Reflexión guardada y sincronizada":`Guardar reflexión ${nombre}`}
        </button>
      </div>

      {Object.keys(log).length>0&&(
        <div style={{marginTop:24}}>
          <SLabel>Reflexiones anteriores</SLabel>
          {Object.keys(log).sort((a,b)=>b.localeCompare(a)).map(key=>(
            <div key={key} style={{...card,marginBottom:12}}>
              <div style={{fontSize:13,fontWeight:600,color:C.navy,marginBottom:12}}>{tituloItem(key)}</div>
              <Respuestas preguntas={preguntas} datos={log[key]}/>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
