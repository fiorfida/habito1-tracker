// ─── Contenido fijo ────────────────────────────────────────────────────
export const MISION = `Soy Facundo Iorfida y me comprometo a vivir una vida plena y alineada con lo que soy, lo que creo y lo que quiero lograr.

Para eso, voy a:

• Ser un padre presente y amoroso, acompañando a Francesca con el ejemplo, el amor y los valores necesarios para que crezca sana, feliz y libre.
• Ponerle pasión a todo lo que haga, disfrutar el proceso y estar presente de verdad, sin vivir a medias.
• Apostar a mi crecimiento personal, conociéndome más, y cuidar mi cuerpo y mi mente, porque son la base de mi energía, claridad y mejor versión.
• Valorar el esfuerzo y el laburo bien hecho, haciéndome cargo de mis decisiones y entendiendo que cada elección marca mi rumbo.
• Cuidar y nutrir mis relaciones, priorizando el amor, el respeto y el apoyo mutuo con Flo, mi familia y mis amigos.
• Impactar positivamente en quienes me rodean, actuando con honestidad, escuchando con atención y dando siempre lo mejor de mí.
• Construir mi libertad financiera y laboral, como base para vivir con autonomía y poder ayudar a otros con impacto.

Elijo vivir con intención, sabiendo que cada día me da la chance de escribir una historia única.`;

// La identidad de cada rol es `num`: los registros guardan el número, nunca el nombre.
export const ROLES = [
  { num:"1", nombre:"Facundo",              desc:"Desarrollo personal, hábitos, cuerpo y mente." },
  { num:"2", nombre:"Papá de Francesca",    desc:"Padre presente, amoroso, que lidera con el ejemplo." },
  { num:"3", nombre:"Facundito",            desc:"Compañero, presente, que elige a Flo todos los días." },
  { num:"4", nombre:"Iorfida",              desc:"Hijo, nieto, tío de Josefina. Familia extensa unida." },
  { num:"5", nombre:"Iorfi/a",              desc:"Amigo presente que cultiva los vínculos con EPG, EC, Vi y Lu." },
  { num:"6", nombre:"Lead Analyst Tecpetrol", desc:"Referente del área, liderazgo real, camino a Team Leader." },
  { num:"7", nombre:"Emprendedor",          desc:"Freelance (IJ, Yungo, Lubich) + proyecto inmobiliario Riglos." },
  { num:"8", nombre:"Referente CCBP",       desc:"Comunidad, organización, presencia deportiva y comisión." },
];

export const FRASES = [
  { habito:1, nombre:"Sea proactivo", texto:"Entre lo que te pasa y cómo respondés, hay un espacio: ahí se construye el papá, el socio y el líder que querés ser." },
  { habito:1, nombre:"Sea proactivo", texto:"Hoy podés gastar energía en lo que no controlás, o invertirla en tu círculo de influencia: Francesca, Flo, tu equipo, Riglos." },
  { habito:2, nombre:"Empiece con un fin en mente", texto:"Todo se crea dos veces: primero en tu cabeza, después en el día a día. ¿Qué estás creando hoy para tu familia y tu futuro?" },
  { habito:2, nombre:"Empiece con un fin en mente", texto:"Tu misión no es un texto guardado: es el filtro con el que elegís en qué usar las próximas horas." },
  { habito:3, nombre:"Primero lo primero", texto:"Lo urgente grita, lo importante espera en silencio. Hoy, ¿le diste lugar al Cuadrante II: tu cuerpo, Flo, Francesca, Riglos?" },
  { habito:3, nombre:"Primero lo primero", texto:"No se trata de ordenar la agenda de tus prioridades, sino de priorizar lo que ponés en la agenda." },
  { habito:4, nombre:"Piense en ganar/ganar", texto:"En Tecpetrol, con Flo, con tu equipo: buscá el resultado donde ganan los dos, no el que te deja solo arriba." },
  { habito:4, nombre:"Piense en ganar/ganar", texto:"La mentalidad de abundancia dice que hay éxito de sobra para todos. Hoy, ¿elegiste competir o construir junto a otros?" },
  { habito:5, nombre:"Procure primero comprender, y después ser comprendido", texto:"Antes de responder, escuchá para entender, no para contestar. Con Flo, con Josefina, con tu equipo." },
  { habito:5, nombre:"Procure primero comprender, y después ser comprendido", texto:"Escuchar de verdad es el depósito más grande que podés hacer en la cuenta emocional de alguien." },
  { habito:6, nombre:"Sinergice", texto:"La diferencia de mirada del otro no es un obstáculo: es la materia prima de una solución mejor a la que ibas a llegar solo." },
  { habito:6, nombre:"Sinergice", texto:"Hoy buscá la tercera alternativa: ni tu idea, ni la del otro — la que todavía no apareció." },
  { habito:7, nombre:"Afile la sierra", texto:"Cuerpo, mente, espíritu y vínculos: afilar la sierra en las cuatro te hace más efectivo en todo lo demás, no menos productivo." },
  { habito:7, nombre:"Afile la sierra", texto:"No tenés tiempo para no afilar la sierra. Tu victoria privada de hoy sostiene la pública de mañana." },
];

export const PREGUNTAS_H1 = [
  { id:"p1", label:"H1 — Energía",   pregunta:"¿Puse mi energía en lo que puedo controlar?",         ayuda:"SÍ = me enfoqué en mi Círculo de Influencia. NO = gasté energía en preocupaciones fuera de mi control." },
  { id:"p2", label:"H1 — Lenguaje",  pregunta:"¿Usé lenguaje proactivo durante el día?",             ayuda:"SÍ = evité 'tengo que', 'no puedo', 'me hizo'. NO = caí en lenguaje reactivo." },
  { id:"p3", label:"H1 — Respuesta", pregunta:"¿Respondí desde mis valores en lugar de reaccionar?", ayuda:"SÍ = actué desde mis valores ante situaciones difíciles. NO = reaccioné automáticamente." },
];

export const PREGUNTA_H2 = {
  id:"p4", label:"H2 — Alineación",
  pregunta:"¿Lo que hice hoy estuvo alineado con la persona que quiero ser?",
  ayuda:"SÍ = mis acciones de hoy reflejan mi misión y roles. NO = el día fue tomado por urgencias ajenas a lo que importa.",
};

export const PREGUNTAS_SEMANA = [
  { id:"s1", pregunta:"¿Cuál fue el rol más descuidado esta semana?",                       placeholder:"Ej: Facundito — no generé momentos de conexión con Flo." },
  { id:"s2", pregunta:"¿Qué decisión tomé esta semana que estuvo alineada con mi misión?",  placeholder:"Ej: Prioricé el entreno aunque estaba cansado." },
  { id:"s3", pregunta:"¿Qué quiero hacer diferente la semana que viene?",                   placeholder:"Ej: Bloquear el miércoles para avanzar con Riglos." },
];

export const PREGUNTAS_TRIMESTRE = [
  { id:"t1", pregunta:"¿Qué rol descuidé más este trimestre, y qué voy a ajustar para el próximo?",                              placeholder:"Ej: Facundito — poca conexión real con Flo por el ritmo de trabajo." },
  { id:"t2", pregunta:"Repasando mi misión y visión: ¿siguen representando quién quiero ser, o hay algo que necesito actualizar?", placeholder:"Ej: Siguen vigentes, pero quiero sumar foco en..." },
  { id:"t3", pregunta:"De las cuatro dimensiones de \"Afilar la sierra\" (cuerpo, mente, vínculos, espíritu), ¿cuál quedó más floja este trimestre?", placeholder:"Ej: Cuerpo — dejé de entrenar en las últimas semanas." },
];

export const PREGUNTAS_ANUAL = [
  { id:"a1", pregunta:"Mirando el año que termina, ¿qué decisión o hábito tuvo más impacto positivo en mi vida?", placeholder:"Ej: Empezar a entrenar temprano cambió mi energía todo el año." },
  { id:"a2", pregunta:"¿Qué rol o vínculo quedó más descuidado durante el año, y qué voy a cambiar?",             placeholder:"Ej: Amigos — bajé mucho la frecuencia de encuentros con el grupo." },
  { id:"a3", pregunta:"¿Mi misión, visión y roles siguen vigentes, o hay algo que quiero reescribir para este nuevo año?", placeholder:"Ej: Siguen firmes, ajusto el rol de Emprendedor con foco en Riglos." },
  { id:"a4", pregunta:"¿Cuál es la piedra grande — lo más importante — para este año que arranca?",               placeholder:"Ej: Consolidar la libertad financiera con el proyecto Riglos." },
];
