import { C } from "../theme";
import { SLabel, HomeRow } from "../components/ui";
import { dayOfWeek, formatDate } from "../lib/fechas";

export default function Home({today, mananHoy, nocheHoy, semanaEstado, trimEstado, anualEstado, irA}){
  return (
    <div>
      <div style={{fontSize:11,letterSpacing:2,color:C.textMuted,textTransform:"uppercase",marginBottom:14}}>{dayOfWeek(today)} {formatDate(today)}</div>

      <div className="grid-2">
        <HomeRow icon="☀️" label="Mañana" estado={mananHoy?"completada":"pendiente"}
          detalle={mananHoy?"Misión, visión y roles leídos hoy.":"Todavía no la hiciste hoy."}
          onClick={()=>irA("manana")}/>
        <HomeRow icon="🌙" label="Noche" estado={nocheHoy?"completada":"pendiente"}
          detalle={nocheHoy?"Registro del día guardado.":"Falta tu reflexión nocturna."}
          onClick={()=>irA("noche")}/>
      </div>

      <div style={{marginTop:24}}>
        <SLabel>Periódica</SLabel>
        <div className="grid-3">
          <HomeRow icon="📋" label="Semanal" estado={semanaEstado}
            onClick={()=>irA("periodica","semanal")}/>
          <HomeRow icon="⭐" label="Trimestral" estado={trimEstado}
            onClick={()=>irA("periodica","trimestral")}/>
          <HomeRow icon="⭐" label="Anual" estado={anualEstado}
            onClick={()=>irA("periodica","anual")}/>
        </div>
      </div>
    </div>
  );
}
