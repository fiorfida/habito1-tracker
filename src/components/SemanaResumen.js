import { C, card } from "../theme";
import { MetasRolLista } from "./ui";
import { PREGUNTAS_SEMANA } from "../content/contenido";
import { formatDate, addDays } from "../lib/fechas";
import { metasActivas } from "../lib/metas";
import { esV2, semanaPlanDe } from "../lib/semanal";

const etiqueta = { fontSize:11, color:C.celeste, textTransform:"uppercase", letterSpacing:1, marginBottom:4 };
const texto = { fontSize:13, color:C.textSecond, lineHeight:1.5, whiteSpace:"pre-line" };

// Una revisión semanal: formato nuevo (v2) o anterior (s1-s3 + metas).
// En el formato anterior, las metas cargadas eran para la semana siguiente.
export default function SemanaResumen({W, doc, plan}){
  const P = semanaPlanDe(W);
  const rango = `${formatDate(W)} al ${formatDate(addDays(W,6))}`;
  if (!esV2(doc)) {
    return (
      <div style={{...card,marginBottom:12}}>
        <div style={{fontSize:13,fontWeight:600,color:C.navy,marginBottom:12}}>Semana del {rango} <span style={{fontSize:11,color:C.textMuted,fontWeight:400}}>· formato anterior</span></div>
        {PREGUNTAS_SEMANA.map(p=>(
          <div key={p.id} style={{marginBottom:10}}>
            <div style={etiqueta}>{p.pregunta.slice(0,45)}…</div>
            <div style={texto}>{doc[p.id]||<em style={{color:C.textMuted}}>Sin respuesta</em>}</div>
          </div>
        ))}
        {metasActivas(doc.metas).length>0 && (
          <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${C.border}`}}>
            <div style={etiqueta}>Metas para la semana del {formatDate(P)}</div>
            <MetasRolLista metas={doc.metas}/>
          </div>
        )}
      </div>
    );
  }
  const r = doc.reflexion || {};
  const pre = r.preocupaciones || [];
  return (
    <div style={{...card,marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",gap:8,flexWrap:"wrap",marginBottom:12}}>
        <span style={{fontSize:13,fontWeight:600,color:C.navy}}>Revisión {rango}</span>
        <span style={{fontSize:11,color:doc.estado==="completa"?C.yes:C.warn}}>{doc.estado==="completa"?"✓ Completa":"En curso"}{doc.minutos?` · ${doc.minutos} min`:""}</span>
      </div>
      {pre.length>0 && (
        <div style={{marginBottom:10}}>
          <div style={etiqueta}>Círculo de influencia</div>
          {pre.map(p=>(
            <div key={p.id} style={{fontSize:13,color:C.textSecond}}>
              <span style={{color:p.control?C.yes:C.textMuted,fontWeight:600}}>{p.control===null?"·":p.control?"En mi control":"No en mi control"}</span> — {p.texto}
            </div>
          ))}
        </div>
      )}
      {r.libre && <div style={{marginBottom:10}}><div style={etiqueta}>Reflexión</div><div style={texto}>{r.libre}</div></div>}
      {r.intencion && <div style={{marginBottom:10}}><div style={etiqueta}>Intención para la semana siguiente</div><div style={texto}>{r.intencion}</div></div>}
      {plan && metasActivas(plan.metas).length>0 && (
        <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${C.border}`}}>
          <div style={etiqueta}>Plan · semana del {formatDate(P)}</div>
          <MetasRolLista metas={plan.metas}/>
        </div>
      )}
    </div>
  );
}
