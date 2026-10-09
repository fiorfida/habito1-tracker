import { useState } from "react";
import { C, card, inp, btnPrimario } from "../theme";
import { SLabel, FechaInput } from "../components/ui";
import { ROLES } from "../content/contenido";
import { formatDate, todayBsAs, addDays } from "../lib/fechas";
import { nuevoId } from "../lib/datos";

const btnLink = { background:"none", border:"none", color:C.celeste, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit", padding:0 };
const campo = { ...inp, fontSize:13, padding:"8px 10px" };
const etiqueta = { fontSize:11, color:C.textMuted, marginBottom:3, display:"block" };

// Objetivos anuales por rol (1 a 3, uno central). Se cargan en cualquier
// momento; la revisión anual (entrega 4c) los crea y los evalúa.
export const objetivosDelAnio = (objetivos, anio) =>
  Object.entries(objetivos||{}).map(([id,o])=>({id,...o})).filter(o=>o.anio===anio && !o.archivado);

export default function ObjetivosAnio({anio, objetivos, onGuardar}){
  const lista = objetivosDelAnio(objetivos, anio);
  const total = lista.length;
  return (
    <div>
      <div style={{fontSize:12,color:C.textMuted,marginBottom:12}}>
        {total} objetivo{total===1?"":"s"} cargado{total===1?"":"s"} para {anio}. De 1 a 3 por rol: específicos, medibles y con plazo, como estado actual → estado deseado.
      </div>
      <div className="roles-grid">
        {ROLES.map(r=><RolObjetivos key={r.num} rol={r} anio={anio} objetivos={lista.filter(o=>o.rol===r.num)} onGuardar={onGuardar}/>)}
      </div>
    </div>
  );
}

function RolObjetivos({rol, anio, objetivos, onGuardar}){
  const [editando, setEditando] = useState(null); // id | "nuevo"
  const hoy = todayBsAs();
  return (
    <div style={card}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <span style={{fontSize:14,fontWeight:600,color:C.textPrimary}}>{rol.num} · {rol.nombre}</span>
        {objetivos.length<3 && editando===null && <button onClick={()=>setEditando("nuevo")} style={{...btnLink,fontSize:12}}>+ Objetivo</button>}
      </div>
      {objetivos.length===0 && editando===null && <div style={{fontSize:12,color:C.textMuted,fontStyle:"italic"}}>Sin objetivos cargados.</div>}
      {objetivos.map(o=> editando===o.id
        ? <FormObjetivo key={o.id} inicial={o} onCancelar={()=>setEditando(null)}
            onGuardar={async d=>{ if(await onGuardar(o.id, d)) setEditando(null); }}
            onQuitar={async()=>{ if(await onGuardar(o.id, {archivado:true})) setEditando(null); }}/>
        : (
          <div key={o.id} style={{padding:"8px 0",borderTop:`1px solid ${C.border}`}}>
            <div style={{display:"flex",justifyContent:"space-between",gap:8}}>
              <span style={{fontSize:13,fontWeight:600,color:C.navy}}>{o.central?"★ ":""}{o.titulo}</span>
              <button onClick={()=>setEditando(o.id)} style={{...btnLink,fontSize:12}}>Editar</button>
            </div>
            {(o.estadoActual||o.estadoDeseado) && <div style={{fontSize:12,color:C.textSecond,marginTop:2}}>{o.estadoActual||"…"} → {o.estadoDeseado||"…"}</div>}
            {o.plazo && <div style={{fontSize:11,marginTop:2,color:o.plazo<=addDays(hoy,30)?C.warn:C.textMuted}}>Plazo: {formatDate(o.plazo)}</div>}
          </div>
        ))}
      {editando==="nuevo" && (
        <FormObjetivo inicial={{anio, rol:rol.num, central:objetivos.length===0}} onCancelar={()=>setEditando(null)}
          onGuardar={async d=>{ if(await onGuardar(nuevoId(), {...d, anio, rol:rol.num, estado:"activo"})) setEditando(null); }}/>
      )}
    </div>
  );
}

function FormObjetivo({inicial, onGuardar, onCancelar, onQuitar}){
  const [o, setO] = useState({titulo:"", estadoActual:"", estadoDeseado:"", plazo:"", paraQue:"", intencion:"", central:false, ...inicial});
  const [error, setError] = useState(null);
  const set = c => { setO(p=>({...p,...c})); setError(null); };
  const guardar = () => {
    if (!o.titulo.trim()) { setError("Escribí el objetivo."); return; }
    const { id, ...datos } = o;
    onGuardar({...datos, titulo:o.titulo.trim()});
  };
  return (
    <div style={{borderTop:`1px solid ${C.border}`,paddingTop:10,marginTop:6,display:"flex",flexDirection:"column",gap:8}}>
      <div><span style={etiqueta}>Objetivo</span><input value={o.titulo} onChange={e=>set({titulo:e.target.value})} placeholder="Correr 10 km en menos de 55 min" style={campo}/></div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        <div style={{flex:"1 1 140px"}}><span style={etiqueta}>Estado actual</span><input value={o.estadoActual} onChange={e=>set({estadoActual:e.target.value})} style={campo}/></div>
        <div style={{flex:"1 1 140px"}}><span style={etiqueta}>Estado deseado</span><input value={o.estadoDeseado} onChange={e=>set({estadoDeseado:e.target.value})} style={campo}/></div>
      </div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"flex-end"}}>
        <div style={{flex:"0 0 130px"}}><span style={etiqueta}>Plazo</span><FechaInput value={o.plazo} onChange={v=>set({plazo:v})} style={campo}/></div>
        <label style={{display:"flex",gap:6,alignItems:"center",fontSize:12,color:C.textSecond,paddingBottom:8}}>
          <input type="checkbox" checked={!!o.central} onChange={e=>set({central:e.target.checked})}/> Objetivo central del rol
        </label>
      </div>
      <div><span style={etiqueta}>¿Para qué es importante?</span><input value={o.paraQue} onChange={e=>set({paraQue:e.target.value})} style={campo}/></div>
      <div><span style={etiqueta}>¿Cuál es mi intención?</span><input value={o.intencion} onChange={e=>set({intencion:e.target.value})} style={campo}/></div>
      {error && <div style={{fontSize:12,color:C.no}}>{error}</div>}
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        <button onClick={guardar} style={{...btnPrimario,width:"auto",padding:"8px 16px",fontSize:13}}>Guardar</button>
        <button onClick={onCancelar} style={{...btnLink,color:C.textMuted}}>Cancelar</button>
        {onQuitar && <button onClick={onQuitar} style={{...btnLink,color:C.textMuted,marginLeft:"auto",fontSize:12}}>Quitar objetivo</button>}
      </div>
    </div>
  );
}
