import { useState } from "react";
import { C, card, inp, btnPrimario } from "../theme";
import { SLabel } from "../components/ui";
import { ROLES } from "../content/contenido";
import { formatDate } from "../lib/fechas";

const ESTADOS = {
  abierto:     { t:"Abierto",     color:C.navy },
  planificado: { t:"Planificado", color:C.celeste },
  hecho:       { t:"Hecho",       color:C.yes },
  delegado:    { t:"Delegado",    color:C.textSecond },
  descartado:  { t:"Descartado",  color:C.textMuted },
};
const btnLink = { background:"none", border:"none", color:C.celeste, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit", padding:0 };

// To Do's: se anotan cuando aparecen y llegan solos al paso 5 de la semanal.
export default function Pendientes({todos, onAgregar, onTodo}){
  const [texto, setTexto] = useState("");
  const [rol, setRol] = useState("1");
  const [error, setError] = useState(null);
  const [verCerrados, setVerCerrados] = useState(false);
  const lista = Object.entries(todos||{}).map(([id,t])=>({id,...t})).sort((a,b)=>(b.creado||"").localeCompare(a.creado||""));
  const activos = lista.filter(t=>t.estado==="abierto"||t.estado==="planificado");
  const cerrados = lista.filter(t=>!(t.estado==="abierto"||t.estado==="planificado"));

  const agregar = async () => {
    if (!texto.trim()) { setError("Escribí el pendiente."); return; }
    if (await onAgregar(texto.trim(), rol)) { setTexto(""); setError(null); }
  };
  const Fila = ({t}) => (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,padding:"8px 0",borderBottom:`1px solid ${C.border}`}}>
      <div style={{minWidth:0}}>
        <div style={{fontSize:13,color:C.textPrimary}}>{t.texto}</div>
        <div style={{fontSize:11,color:ESTADOS[t.estado]?.color||C.textMuted}}>
          {ESTADOS[t.estado]?.t}{t.estado==="planificado"&&t.semana?` · semana del ${formatDate(t.semana)}`:""}{t.creado?` · anotado ${formatDate(t.creado)}`:""}
        </div>
      </div>
      <div style={{display:"flex",gap:10,flexShrink:0}}>
        {(t.estado==="abierto"||t.estado==="planificado") ? (<>
          <button onClick={()=>onTodo(t.id,{estado:"hecho"})} style={btnLink}>✓ Hecho</button>
          <button onClick={()=>onTodo(t.id,{estado:"descartado"})} style={{...btnLink,color:C.textMuted}}>Descartar</button>
        </>) : (
          <button onClick={()=>onTodo(t.id,{estado:"abierto"})} style={{...btnLink,color:C.textMuted}}>Reabrir</button>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <div style={card}>
        <SLabel>Anotar un pendiente</SLabel>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <input value={texto} onChange={e=>{setTexto(e.target.value); setError(null);}} onKeyDown={e=>e.key==="Enter"&&agregar()}
            placeholder="Llamar al contador" style={{...inp,flex:"1 1 200px",fontSize:13}}/>
          <select value={rol} onChange={e=>setRol(e.target.value)} style={{...inp,width:"auto",fontSize:13}}>
            {ROLES.map(r=><option key={r.num} value={r.num}>{r.num} · {r.nombre}</option>)}
          </select>
          <button onClick={agregar} style={{...btnPrimario,width:"auto",padding:"10px 18px",fontSize:13}}>Agregar</button>
        </div>
        {error && <div style={{fontSize:12,color:C.no,marginTop:6}}>{error}</div>}
        <div style={{fontSize:12,color:C.textMuted,marginTop:8}}>Aparecen en el paso 5 de la revisión semanal, dentro de su rol.</div>
      </div>

      {activos.length===0 ? (
        <div style={{...card,textAlign:"center",color:C.textMuted,fontSize:13}}>Sin pendientes abiertos.</div>
      ) : (
        <div className="roles-grid">
          {ROLES.filter(r=>activos.some(t=>t.rol===r.num)).map(r=>(
            <div key={r.num} style={card}>
              <div style={{fontSize:14,fontWeight:600,color:C.textPrimary,marginBottom:4}}>{r.num} · {r.nombre}</div>
              {activos.filter(t=>t.rol===r.num).map(t=><Fila key={t.id} t={t}/>)}
            </div>
          ))}
        </div>
      )}

      {cerrados.length>0 && (
        <div style={card}>
          <button onClick={()=>setVerCerrados(!verCerrados)} style={{...btnLink,color:C.textMuted,fontSize:12}}>
            {verCerrados?"▲":"▼"} Cerrados ({cerrados.length})
          </button>
          {verCerrados && cerrados.map(t=><Fila key={t.id} t={t}/>)}
        </div>
      )}
    </div>
  );
}
