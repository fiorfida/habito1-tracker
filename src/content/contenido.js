// ─── Contenido fijo ────────────────────────────────────────────────────
export const MISION = `Soy Facundo Iorfida y soy dueño de mi vida: la vivo como yo defino, en base a lo que creo y valoro.

Me guío por estos principios: libertad, honestidad, transparencia y servicio.

Para eso, voy a:

• Hacerme cargo de mis cosas: lo que está bajo mi control depende 100% de mis decisiones y mi actitud.
• Ponerle pasión a todo lo que haga, disfrutar el proceso y estar presente de verdad, sin vivir a medias.
• Ser un padre presente y amoroso, acompañando a Francesca con el amor y los valores necesarios para que crezca libre, sana, feliz y buena persona.
• Apostar a mi crecimiento personal, conociéndome más, y cuidar mi cuerpo, mi mente y mi espíritu, porque son la base de mi energía, claridad y mejor versión.
• Cuidar y nutrir mis relaciones, priorizando el amor, el respeto y el apoyo mutuo con Flo, mi familia y mis amigos.
• Construir mi libertad financiera y laboral, como base para vivir con autonomía y poder ayudar a otros con impacto.

Elijo vivir con intención, sabiendo que cada día me da la chance de escribir una historia única y hacen que todo valga la pena.`;

// La visión se muestra como imagen (public/vision.webp).
export const VISION_ALT = "Visión personal a 5 años: familia, paternidad, trabajo, libertad financiera, familia extendida, amigos y comunidad, Racing.";

// La identidad de cada rol es `num`: los registros guardan el número, nunca el nombre.
export const ROLES = [
  { num:"1", nombre:"Facundo",              desc:"Desarrollo personal, hábitos, cuerpo y mente." },
  { num:"2", nombre:"Papá de Francesca",    desc:"Padre presente, amoroso, que lidera con el ejemplo." },
  { num:"3", nombre:"Facundito",            desc:"Compañero, presente, que elige a Flo todos los días." },
  { num:"4", nombre:"Iorfida",              desc:"Hijo, nieto, tío de Josefina. Familia extensa unida." },
  { num:"5", nombre:"Iorfi/a",              desc:"Amigo presente que cultiva los vínculos con EPG, EC, Vi y Lu." },
  { num:"6", nombre:"PLSC Specialist — Tecpetrol", desc:"Planning & Process SUCH · 2 reportes directos (Mati Y, Tincho P) · Mayor influencia; balance entre tareas de manager y de analista." },
  { num:"7", nombre:"Emprendedor",          desc:"Freelance (IJ, Yungo, Lubich) + proyecto inmobiliario Riglos." },
  { num:"8", nombre:"Referente CCBP",       desc:"Comunidad, organización, presencia deportiva y comisión." },
];

// Citas con fuente primaria verificada (ver Fase 1). Se muestran frase + autor.
export const FRASES = [
  { texto:"Al hombre se le puede arrebatar todo, salvo la última de las libertades humanas: elegir su actitud ante las circunstancias.", autor:"Viktor Frankl" },
  { texto:"Cuando ya no podemos cambiar una situación, tenemos el desafío de cambiarnos a nosotros mismos.", autor:"Viktor Frankl" },
  { texto:"Quien tiene un porqué para vivir soporta casi cualquier cómo.", autor:"Friedrich Nietzsche" },
  { texto:"Hay mil que podan las ramas del mal por cada uno que golpea la raíz.", autor:"Henry David Thoreau" },
  { texto:"No conozco hecho más alentador que la incuestionable capacidad del hombre para elevar su vida mediante el esfuerzo consciente.", autor:"Henry David Thoreau" },
  { texto:"Las cadenas del hábito suelen ser demasiado livianas para sentirlas, hasta que son demasiado fuertes para romperlas.", autor:"Samuel Johnson" },
  { texto:"El hábito es un cable: tejemos un hilo cada día y al final no podemos romperlo.", autor:"Horace Mann" },
  { texto:"Si tratamos a las personas como son, las empeoramos; si las tratamos como lo que deberían ser, las llevamos adonde pueden llegar.", autor:"Goethe" },
  { texto:"Lo que heredaste de tus padres, conquistalo para poseerlo.", autor:"Goethe" },
  { texto:"El corazón tiene razones que la razón no conoce.", autor:"Blaise Pascal" },
  { texto:"Mi vida es mi mensaje.", autor:"Mahatma Gandhi" },
  { texto:"La pregunta más persistente y urgente de la vida es: ¿qué estás haciendo por los demás?", autor:"Martin Luther King Jr." },
  { texto:"Tenés que hacer aquello que creés que no podés hacer.", autor:"Eleanor Roosevelt" },
  { texto:"No nos perturban las cosas, sino las opiniones que tenemos sobre ellas.", autor:"Epicteto" },
  { texto:"Primero decite qué querés ser; después hacé lo que tengas que hacer.", autor:"Epicteto" },
  { texto:"Dejá de discutir cómo debe ser un hombre bueno: sé uno.", autor:"Marco Aurelio" },
  { texto:"El alma se tiñe del color de sus pensamientos.", autor:"Marco Aurelio" },
  { texto:"No es que tengamos poco tiempo, sino que perdemos mucho.", autor:"Séneca" },
  { texto:"Ningún viento es favorable para quien no sabe a qué puerto va.", autor:"Séneca" },
  { texto:"Mientras la postergamos, la vida pasa.", autor:"Séneca" },
  { texto:"Una vida sin examen no merece ser vivida.", autor:"Sócrates" },
  { texto:"Nos volvemos justos haciendo actos justos, moderados haciendo actos moderados, y valientes haciendo actos valientes.", autor:"Aristóteles" },
  { texto:"Un viaje de mil millas empieza con un solo paso.", autor:"Lao Tsé" },
  { texto:"Aprender sin pensar es inútil; pensar sin aprender es peligroso.", autor:"Confucio" },
  { texto:"Soy el amo de mi destino, soy el capitán de mi alma.", autor:"William Ernest Henley" },
  { texto:"El mérito es de quien está realmente en la arena.", autor:"Theodore Roosevelt" },
  { texto:"Damos forma a nuestros edificios; después, ellos nos dan forma a nosotros.", autor:"Winston Churchill" },
  { texto:"Bien hecho es mejor que bien dicho.", autor:"Benjamin Franklin" },
  { texto:"Nada grande se logró jamás sin entusiasmo.", autor:"Ralph Waldo Emerson" },
  { texto:"La vida es como andar en bicicleta: para mantener el equilibrio hay que seguir en movimiento.", autor:"Albert Einstein" },
  { texto:"La vida es una aventura audaz o no es nada.", autor:"Helen Keller" },
];

// ─── Chispa interior (Superhábitos) ────────────────────────────────────
export const CHISPA_DEFINICION = "La zona donde se cruzan mis pasiones (lo que amo hacer), mis talentos (lo que hago naturalmente bien y puedo desarrollar) y mis principios (lo que sé que es correcto y defiendo), puesta al servicio de necesidades de otros. Como hábito: usarla como criterio cada vez que decido dónde invertir mi tiempo y mi energía, incluidas las actividades puntuales de la semana.";
export const CHISPA_PROPOSITO = "Al planificar: ¿esto lo hago yo, o lo delego a alguien más apto?";

// Valores por defecto; lo editado se guarda en Firestore (config/chispa).
export const CHISPA_DEFAULT = {
  pasiones: [
    "Estar con mi familia y amigos.",
    "Competir (ej.: fútbol), crecer y desafiarme constantemente.",
    "Leer y aprender (IA, automatización, tecnología).",
    "Desarrollar y liderar un negocio propio.",
    "Contribuir a mi comunidad, especialmente en Banco.",
    "Analizar, planificar y mejorar procesos.",
  ],
  talentos: [
    "Pensamiento estratégico y orientación a resultados.",
    "Gestión y mejora de procesos (con y sin tecnología).",
    "Escucha activa y sentido común aplicado.",
    "Alta capacidad de análisis, planificación y organización.",
    "Resiliencia, adaptabilidad y consistencia.",
    "Conocimiento técnico en Supply Chain y tecnología aplicada.",
  ],
  principios: [
    "Integridad, colaboración, y desarrollo personal.",
    "Agregar valor real y ser útil a otros.",
    "Familia, comunidad y ayudar cuando hace falta.",
    "Disfrutar el camino, no solo la meta.",
    "Hacer lo correcto, aunque no sea lo fácil.",
  ],
  necesidades: ["Digitalizar", "Eficiencia", "Automatizar", "Accesibilidad", "Reducir costos"],
  imagen: "Consultor para optimizar procesos. Una empresa me contrata y yo: relevo, defino KPIs, planteo mejoras, implemento, hago seguimiento de resultados y sostengo la mejora continua.",
  pesos: [3, 3, 3, 1, 1, 1],
};

export const CHISPA_BLOQUES = [
  { id:"pasiones",    icono:"❤️", titulo:"Pasiones" },
  { id:"talentos",    icono:"💪", titulo:"Talentos" },
  { id:"principios",  icono:"🧭", titulo:"Principios" },
  { id:"necesidades", icono:"🤝", titulo:"Necesidades que puedo ayudar a resolver" },
];

// Matriz de decisión: el peso de cada criterio vive en chispa.pesos (mismo orden).
export const MATRIZ_CRITERIOS = [
  "¿Me apasiona esta opción?",
  "¿Aplica mis talentos naturales?",
  "¿Respeta y refuerza mis principios?",
  "¿Agrega valor real a otros?",
  "¿Me hace crecer como persona?",
  "¿Me permite vivir con disfrute?",
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
