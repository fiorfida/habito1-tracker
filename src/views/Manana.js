import { C, card, btnPrimario } from "../theme";
import { SLabel } from "../components/ui";
import { MISION, VISION_ALT, ROLES } from "../content/contenido";

export default function Manana({mananHoy, frase, onMarcar}){
  return (
    <div>
      <div style={{...card, background:mananHoy?C.yesBg:C.warnBg, border:`1px solid ${mananHoy?C.yes:C.warn}`, marginBottom:20}}>
        <div style={{fontSize:13,fontWeight:600,color:mananHoy?C.yes:C.warn}}>{mananHoy?"✓ Revisión matutina completada":"⏰ Revisión matutina pendiente"}</div>
        <div style={{fontSize:12,color:C.textMuted,marginTop:2}}>{mananHoy?"Ya leíste tu misión, visión y roles hoy.":"Leé tu misión, visión y roles, y confirmá al final del recorrido."}</div>
      </div>

      <div style={{...card,background:C.celestePale,border:`1px solid ${C.celeste}`,marginBottom:20}}>
        <div style={{fontSize:15,fontStyle:"italic",color:C.navy,lineHeight:1.6}}>"{frase.texto}"</div>
        <div style={{fontSize:13,color:C.celeste,fontWeight:600,marginTop:8,textAlign:"right"}}>— {frase.autor}</div>
      </div>

      <div style={card}>
        <SLabel>✦ Misión Personal</SLabel>
        <div style={{fontSize:14,color:C.textSecond,lineHeight:1.7,whiteSpace:"pre-line"}}>{MISION}</div>
      </div>

      <div style={card}>
        <SLabel>✦ Visión Personal — 5 años</SLabel>
        <img src={`${process.env.PUBLIC_URL}/vision.webp`} alt={VISION_ALT}
          style={{width:"100%",height:"auto",display:"block",borderRadius:8}}/>
      </div>

      <div style={card}>
        <SLabel>✦ Mis 8 Roles</SLabel>
        <div className="roles-grid">
          {ROLES.map((r,i)=>(
            <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",paddingBottom:i<ROLES.length-1?14:0,marginBottom:i<ROLES.length-1?14:0,borderBottom:i<ROLES.length-1?`1px solid ${C.border}`:"none"}}>
              <div style={{width:28,height:28,borderRadius:"50%",background:C.navy,color:C.white,fontSize:12,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{r.num}</div>
              <div>
                <div style={{fontSize:14,fontWeight:600,color:C.textPrimary}}>{r.nombre}</div>
                <div style={{fontSize:12,color:C.textMuted,marginTop:2}}>{r.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {!mananHoy && <button onClick={onMarcar} style={btnPrimario}>✓ Marcar revisión matutina como completada</button>}
    </div>
  );
}
