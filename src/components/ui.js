import { C, card } from "../theme";
import { metasActivas } from "../lib/metas";

export function SLabel({children}){
  return <div style={{fontSize:11,letterSpacing:2,color:"#8aa3c0",textTransform:"uppercase",marginBottom:14}}>{children}</div>;
}
export function EstadoBanner({estado, tituloPendiente, tituloVencida, tituloCompletada, subtitulo}){
  const colores = {
    pendiente:  {bg:C.warnBg, border:C.warn, text:C.warn},
    vencida:    {bg:C.noBg,   border:C.no,   text:C.no},
    completada: {bg:C.yesBg,  border:C.yes,  text:C.yes},
  };
  const c = colores[estado];
  const titulo = estado==="pendiente"?tituloPendiente:estado==="vencida"?tituloVencida:tituloCompletada;
  return (
    <div style={{...card, background:c.bg, border:`1px solid ${c.border}`, marginBottom:20}}>
      <div style={{fontSize:13,fontWeight:600,color:c.text}}>{titulo}</div>
      {subtitulo && <div style={{fontSize:12,color:"#8aa3c0",marginTop:2}}>{subtitulo}</div>}
    </div>
  );
}
export function HomeRow({icon, label, estado, detalle, onClick}){
  const colores = {
    pendiente:  {bg:C.warnBg, text:C.warn, texto:"Pendiente"},
    vencida:    {bg:C.noBg,   text:C.no,   texto:"Vencida"},
    completada: {bg:C.yesBg,  text:C.yes,  texto:"✓ Listo"},
    neutral:    {bg:C.surfaceAlt, text:C.textMuted, texto:"Desde 19:00"},
    hoy:        {bg:C.warnBg, text:C.warn, texto:"Hoy"},
    encurso:    {bg:C.celestePale, text:C.celeste, texto:"En curso"},
    espera:     {bg:C.surfaceAlt, text:C.textMuted, texto:"Pendiente"},
  };
  const c = colores[estado];
  return (
    <button onClick={onClick} style={{
      ...card, width:"100%", textAlign:"left", cursor:"pointer", fontFamily:"inherit",
      display:"flex", alignItems:"center", justifyContent:"space-between", gap:12,
    }}>
      <div style={{display:"flex",alignItems:"center",gap:12,minWidth:0}}>
        <div style={{fontSize:20,flexShrink:0}}>{icon}</div>
        <div style={{minWidth:0}}>
          <div style={{fontSize:14,fontWeight:600,color:"#0d1f3c"}}>{label}</div>
          {detalle && <div style={{fontSize:12,color:"#8aa3c0",marginTop:2}}>{detalle}</div>}
        </div>
      </div>
      <span style={{fontSize:12,fontWeight:700,padding:"4px 12px",borderRadius:20,background:c.bg,color:c.text,flexShrink:0}}>{c.texto}</span>
    </button>
  );
}
export function MetasRolLista({metas}){
  const activos = metasActivas(metas);
  if(!activos.length) return <div style={{fontSize:12,color:C.textMuted,fontStyle:"italic"}}>Sin metas cargadas.</div>;
  return (
    <div style={{display:"flex",flexDirection:"column",gap:6}}>
      {activos.map(r=>(
        <div key={r.num} style={{display:"flex",gap:8,fontSize:13}}>
          <span style={{color:C.celeste,fontWeight:600,minWidth:120,flexShrink:0}}>{r.nombre}</span>
          <span style={{color:C.textSecond}}>{(metas[r.num]||[]).filter(v=>v&&v.trim()).join(" · ")}</span>
        </div>
      ))}
    </div>
  );
}
export function Empty(){
  return <div style={{textAlign:"center",color:"#8aa3c0",padding:"56px 0",fontSize:15}}>Aún no hay registros.<br/><span style={{fontSize:13}}>Completá tu primer chequeo nocturno.</span></div>;
}
export function Escudo({size}){
  return (
    <div style={{width:size,height:size,flexShrink:0}}>
      <svg viewBox="0 0 38 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 2L36 9V24C36 33 28 40 19 42C10 40 2 33 2 24V9L19 2Z" fill={C.celeste} stroke={C.white} strokeWidth="1.5"/>
        <path d="M19 2L36 9V24C36 33 28 40 19 42V2Z" fill={C.navy}/>
        <path d="M19 2L2 9V24C2 33 10 40 19 42V2Z" fill={C.white}/>
        <path d="M10 20H28M19 11V31" stroke={C.celeste} strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    </div>
  );
}
// Aviso de sincronización: errores de carga y guardados que no llegaron a la nube.
export function AvisoSync({errorCarga, pendientes, reintentando, onReintentar}){
  if (!errorCarga && !pendientes.length) return null;
  return (
    <div style={{...card, background:C.noBg, border:`1px solid ${C.no}`, marginBottom:20}}>
      {errorCarga && (
        <div style={{fontSize:13,color:C.no,fontWeight:600,marginBottom:pendientes.length?10:0}}>
          ⚠ No se pudieron cargar datos de la nube ({errorCarga.join(", ")}). Revisá la conexión y recargá la página antes de guardar cambios.
        </div>
      )}
      {pendientes.length>0 && (
        <>
          <div style={{fontSize:13,color:C.no,fontWeight:600}}>⚠ {pendientes.length===1?"Un guardado no llegó":`${pendientes.length} guardados no llegaron`} a la nube</div>
          <div style={{fontSize:12,color:C.textSecond,marginTop:4,marginBottom:10}}>
            Quedaron en este dispositivo: {pendientes.map(p=>p.label).join(" · ")}
          </div>
          <button onClick={onReintentar} disabled={reintentando} style={{padding:"8px 16px",borderRadius:8,border:"none",cursor:"pointer",background:C.no,color:C.white,fontSize:13,fontWeight:600,fontFamily:"inherit"}}>
            {reintentando?"Reintentando…":"Reintentar ahora"}
          </button>
        </>
      )}
    </div>
  );
}
