import { useState } from "react";
import { C, card, inp, btnPrimario } from "../theme";
import { SLabel } from "./ui";
import { CHISPA_DEFINICION, CHISPA_PROPOSITO, CHISPA_BLOQUES, MATRIZ_CRITERIOS } from "../content/contenido";

const naranja = "#c2410c", naranjaBg = "#fff4ec", naranjaBorde = "#fdba8c";

function Lista({items, compacta}){
  return (
    <ul style={{margin:0,paddingLeft:18,display:"flex",flexDirection:"column",gap:compacta?1:4}}>
      {items.map((t,i)=><li key={i} style={{fontSize:compacta?12:13,color:C.textSecond,lineHeight:compacta?1.4:1.5}}>{t}</li>)}
    </ul>
  );
}

// Tarjeta colapsable al inicio de cada revisión periódica.
export function ChispaResumen({chispa, onAbrir}){
  const [abierta, setAbierta] = useState(true);
  return (
    <div style={{...card, background:naranjaBg, border:`1px solid ${naranjaBorde}`, marginBottom:20}}>
      <button onClick={()=>setAbierta(!abierta)} style={{all:"unset",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%"}}>
        <span style={{fontSize:11,letterSpacing:2,color:naranja,textTransform:"uppercase",fontWeight:600}}>🔥 Mi chispa</span>
        <span style={{fontSize:12,color:naranja}}>{abierta?"ocultar ▲":"mostrar ▼"}</span>
      </button>
      {abierta && (
        <div style={{marginTop:12}}>
          <div style={{fontSize:13,color:C.navy,fontWeight:600,marginBottom:12}}>{CHISPA_PROPOSITO}</div>
          <div className="grid-3" style={{gap:12}}>
            {CHISPA_BLOQUES.slice(0,3).map(b=>(
              <div key={b.id} style={{marginBottom:8}}>
                <div style={{fontSize:12,fontWeight:700,color:C.textPrimary,marginBottom:4}}>{b.icono} {b.titulo}</div>
                <Lista items={chispa[b.id]} compacta/>
              </div>
            ))}
          </div>
          <div style={{fontSize:12,color:C.textSecond,marginTop:12,lineHeight:1.5}}>
            <strong style={{color:C.textPrimary}}>🔥 Imagen:</strong> {chispa.imagen}
          </div>
          <button onClick={onAbrir} style={{marginTop:12,padding:"8px 14px",borderRadius:8,border:`1px solid ${naranja}`,background:"transparent",color:naranja,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
            Abrir matriz de decisión →
          </button>
        </div>
      )}
    </div>
  );
}

// Vista completa: chispa, matriz de decisión y configuración de pesos.
export function ChispaVista({chispa, onGuardar}){
  const [editando, setEditando] = useState(false);
  const [borrador, setBorrador] = useState(null);
  const [guardado, setGuardado] = useState(false);

  const empezarEdicion = () => {
    setBorrador({
      ...Object.fromEntries(CHISPA_BLOQUES.map(b=>[b.id, chispa[b.id].join("\n")])),
      imagen: chispa.imagen,
    });
    setEditando(true);
  };
  const guardarEdicion = async () => {
    const limpio = t => t.split("\n").map(s=>s.trim()).filter(Boolean);
    const datos = { ...Object.fromEntries(CHISPA_BLOQUES.map(b=>[b.id, limpio(borrador[b.id])])), imagen: borrador.imagen.trim() };
    if (await onGuardar(datos)) { setEditando(false); setGuardado(true); setTimeout(()=>setGuardado(false),2500); }
  };

  return (
    <div>
      <div style={{...card, background:naranjaBg, border:`1px solid ${naranjaBorde}`}}>
        <div style={{fontSize:11,letterSpacing:2,color:naranja,textTransform:"uppercase",fontWeight:600,marginBottom:8}}>🔥 Chispa interior</div>
        <div style={{fontSize:13,color:C.textSecond,lineHeight:1.6}}>{CHISPA_DEFINICION}</div>
        <div style={{fontSize:13,color:C.navy,fontWeight:600,marginTop:10}}>{CHISPA_PROPOSITO}</div>
      </div>

      {!editando ? (
        <div style={card}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <SLabel>Mi chispa</SLabel>
            <button onClick={empezarEdicion} style={{marginTop:-14,fontSize:12,color:C.celeste,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>
              {guardado?"✓ Guardado":"✏️ Editar"}
            </button>
          </div>
          <div className="grid-2" style={{gap:16}}>
            {CHISPA_BLOQUES.map(b=>(
              <div key={b.id} style={{marginBottom:8}}>
                <div style={{fontSize:13,fontWeight:700,color:C.textPrimary,marginBottom:6}}>{b.icono} {b.titulo}</div>
                {b.id==="necesidades"
                  ? <div style={{fontSize:13,color:C.textSecond}}>{chispa.necesidades.join(", ")}.</div>
                  : <Lista items={chispa[b.id]}/>}
              </div>
            ))}
          </div>
          <div style={{marginTop:16,paddingTop:14,borderTop:`1px solid ${C.border}`}}>
            <div style={{fontSize:13,fontWeight:700,color:C.textPrimary,marginBottom:6}}>🔥 Imagen de mi chispa</div>
            <div style={{fontSize:13,color:C.textSecond,lineHeight:1.6}}>{chispa.imagen}</div>
          </div>
        </div>
      ) : (
        <div style={card}>
          <SLabel>Editar mi chispa · un ítem por línea</SLabel>
          {CHISPA_BLOQUES.map(b=>(
            <div key={b.id} style={{marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:700,color:C.textPrimary,marginBottom:6}}>{b.icono} {b.titulo}</div>
              <textarea value={borrador[b.id]} onChange={e=>setBorrador({...borrador,[b.id]:e.target.value})}
                rows={Math.max(3, borrador[b.id].split("\n").length)} style={{...inp,resize:"vertical",lineHeight:1.5,fontSize:13}}/>
            </div>
          ))}
          <div style={{fontSize:13,fontWeight:700,color:C.textPrimary,marginBottom:6}}>🔥 Imagen de mi chispa</div>
          <textarea value={borrador.imagen} onChange={e=>setBorrador({...borrador,imagen:e.target.value})}
            rows={3} style={{...inp,resize:"vertical",lineHeight:1.5,fontSize:13}}/>
          <div style={{display:"flex",gap:8,marginTop:14}}>
            <button onClick={guardarEdicion} style={{...btnPrimario,flex:1}}>Guardar cambios</button>
            <button onClick={()=>setEditando(false)} style={{...btnPrimario,flex:"0 0 auto",width:"auto",padding:"14px 18px",background:C.surfaceAlt,color:C.textSecond}}>Cancelar</button>
          </div>
        </div>
      )}

      <MatrizDecision pesos={chispa.pesos}/>
      <ConfigPesos pesos={chispa.pesos} onGuardar={pesos=>onGuardar({pesos})}/>
    </div>
  );
}

const nuevaAlternativa = () => ({ nombre:"", notas: MATRIZ_CRITERIOS.map(()=>null) });

// Calculadora (Fase 1: no se guarda). Puntaje = Σ peso × nota (1-5).
export function MatrizDecision({pesos}){
  const [alts, setAlts] = useState(()=>[nuevaAlternativa(), nuevaAlternativa(), nuevaAlternativa()]);
  const maximo = pesos.reduce((a,p)=>a+p,0)*5;
  const puntaje = a => a.notas.reduce((s,n,i)=>s+(n||0)*pesos[i],0);
  const completa = a => a.notas.every(n=>n!==null);
  const completas = alts.filter(completa);
  const mejor = completas.length>=2 ? Math.max(...completas.map(puntaje)) : null;

  const setNota = (ai, ci, n) => setAlts(prev => prev.map((a,i)=>i!==ai?a:{...a, notas:a.notas.map((v,j)=>j===ci?n:v)}));
  const setNombre = (ai, nombre) => setAlts(prev => prev.map((a,i)=>i!==ai?a:{...a, nombre}));

  return (
    <div style={card}>
      <SLabel>Matriz de decisión</SLabel>
      <div style={{fontSize:12,color:C.textMuted,marginTop:-8,marginBottom:14}}>
        Nota de 1 a 5 por criterio. Puntaje = suma de (peso × nota). Máximo: {maximo}. Se prioriza la de mayor puntaje.
      </div>
      <div className="grid-3" style={{gap:12}}>
        {alts.map((a,ai)=>{
          const p = puntaje(a), gana = mejor!==null && completa(a) && p===mejor;
          return (
            <div key={ai} style={{border:`2px solid ${gana?C.yes:C.border}`,borderRadius:10,padding:12,background:gana?C.yesBg:C.surface}}>
              <input value={a.nombre} onChange={e=>setNombre(ai,e.target.value)} placeholder={`Alternativa ${ai+1}`}
                style={{...inp,fontSize:13,fontWeight:600,padding:"8px 10px",marginBottom:10}}/>
              {MATRIZ_CRITERIOS.map((crit,ci)=>(
                <div key={ci} style={{marginBottom:8}}>
                  <div style={{fontSize:11,color:C.textSecond,marginBottom:4}}>{crit} <span style={{color:C.textMuted}}>(×{pesos[ci]})</span></div>
                  <div style={{display:"flex",gap:4}}>
                    {[1,2,3,4,5].map(n=>(
                      <button key={n} onClick={()=>setNota(ai,ci,n)} style={{flex:1,padding:"5px 0",borderRadius:6,border:`1px solid ${a.notas[ci]===n?C.navy:C.border}`,background:a.notas[ci]===n?C.navy:C.surfaceAlt,color:a.notas[ci]===n?C.white:C.textSecond,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{n}</button>
                    ))}
                  </div>
                </div>
              ))}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginTop:10,paddingTop:8,borderTop:`1px solid ${C.border}`}}>
                <span style={{fontSize:12,color:gana?C.yes:C.textMuted,fontWeight:600}}>{gana?"✓ Prioridad":completa(a)?"":"Incompleta"}</span>
                <span style={{fontSize:20,fontWeight:700,color:gana?C.yes:C.navy}}>{p}<span style={{fontSize:12,color:C.textMuted}}>/{maximo}</span></span>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{display:"flex",gap:8,marginTop:12}}>
        <button onClick={()=>setAlts(prev => [...prev, nuevaAlternativa()])} style={{padding:"8px 14px",borderRadius:8,border:`1px solid ${C.celeste}`,background:"transparent",color:C.celeste,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>+ Agregar alternativa</button>
        <button onClick={()=>setAlts([nuevaAlternativa(), nuevaAlternativa(), nuevaAlternativa()])} style={{padding:"8px 14px",borderRadius:8,border:`1px solid ${C.border}`,background:"transparent",color:C.textMuted,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>Limpiar</button>
      </div>
    </div>
  );
}

function ConfigPesos({pesos, onGuardar}){
  const [abierta, setAbierta] = useState(false);
  const [valores, setValores] = useState(pesos);
  const [guardado, setGuardado] = useState(false);
  const cambiado = valores.some((v,i)=>v!==pesos[i]);
  const guardar = async () => {
    if (await onGuardar(valores)) { setGuardado(true); setTimeout(()=>setGuardado(false),2500); }
  };
  return (
    <div style={card}>
      <button onClick={()=>{setAbierta(!abierta); setValores(pesos);}} style={{all:"unset",cursor:"pointer",display:"flex",justifyContent:"space-between",width:"100%"}}>
        <span style={{fontSize:11,letterSpacing:2,color:C.textMuted,textTransform:"uppercase"}}>⚙ Configuración · pesos de la matriz</span>
        <span style={{fontSize:12,color:C.textMuted}}>{abierta?"▲":"▼"}</span>
      </button>
      {abierta && (
        <div style={{marginTop:14}}>
          {MATRIZ_CRITERIOS.map((crit,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,marginBottom:8}}>
              <span style={{fontSize:13,color:C.textSecond}}>{crit}</span>
              <input type="number" min={0} max={10} value={valores[i]}
                onChange={e=>setValores(valores.map((v,j)=>j===i?Math.max(0,Math.min(10,parseInt(e.target.value,10)||0)):v))}
                style={{...inp,width:64,textAlign:"center",padding:"6px 8px"}}/>
            </div>
          ))}
          <div style={{fontSize:12,color:C.textMuted,margin:"4px 0 12px"}}>Máximo resultante: {valores.reduce((a,p)=>a+p,0)*5}</div>
          <button onClick={guardar} disabled={!cambiado} style={{...btnPrimario,opacity:cambiado?1:0.5}}>{guardado?"✓ Pesos guardados":"Guardar pesos"}</button>
        </div>
      )}
    </div>
  );
}
