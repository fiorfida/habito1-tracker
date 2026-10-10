import { C } from "../theme";
import { SLabel, HomeRow } from "../components/ui";
import { dayOfWeek, formatDate } from "../lib/fechas";

export default function Home({today, mananHoy, nocheHoy, nocheDisp,semanaEstado, mensualEstado, trimEstado, anualEstado, mensualEtiqueta, trimEtiqueta, anualEtiqueta, irA}){
  return (
    <div>
      <div style={{fontSize:11,letterSpacing:2,color:C.textMuted,textTransform:"uppercase",marginBottom:14}}>{dayOfWeek(today)} {formatDate(today)}</div>

      <div className="grid-2">
        <HomeRow icon="☀️" label="Mañana" estado={mananHoy?"completada":"pendiente"}
          detalle={mananHoy?"Misión, visión y plan del día revisados.":"Todavía no la hiciste hoy."}
          onClick={()=>irA("manana")}/>
        <HomeRow icon="🌙" label="Noche" estado={nocheHoy?"completada":nocheDisp?"pendiente":"neutral"}
          detalle={nocheHoy?"Registro del día guardado.":nocheDisp?"Falta tu reflexión nocturna.":"Se habilita a la noche."}
          onClick={()=>irA("noche")}/>
      </div>

      <div style={{marginTop:24}}>
        <SLabel>Periódica</SLabel>
        <div className="grid-2">
          <HomeRow icon="📋" label="Semanal" estado={semanaEstado}
            onClick={()=>irA("periodica","semanal")}/>
          <HomeRow icon="🗓" label="Mensual" estado={mensualEstado} etiqueta={mensualEtiqueta}
            onClick={()=>irA("periodica","mensual")}/>
          <HomeRow icon="⭐" label="Trimestral" estado={trimEstado} etiqueta={trimEtiqueta||(trimEstado==="hoy"?"Disponible":undefined)}
            onClick={()=>irA("periodica","trimestral")}/>
          <HomeRow icon="⭐" label="Anual" estado={anualEstado} etiqueta={anualEtiqueta}
            onClick={()=>irA("periodica","anual")}/>
        </div>
      </div>
    </div>
  );
}
