import { useState, useEffect, useCallback } from "react";
import { logout, onAuthChange } from "./firebase";
import "./responsive.css";

import { C } from "./theme";
import { Escudo, AvisoSync } from "./components/ui";
import { todayBsAs, relevantWeekStart, getWeekStart, dateRange, formatDate, nocheDisponible } from "./lib/fechas";
import { ventanaTrimestral, ventanaAnual, ventanaMensual, nombreTrimestre, nombreMes, mesAnterior } from "./lib/periodos";
import { HABITOS_SEGUIDOS, cumplimientoHabito } from "./lib/habitos";
import { fraseDelDia } from "./lib/frases";
import { semanaPlanDe, esV2, revisionCompleta } from "./lib/semanal";
import { CHISPA_DEFAULT, aplicarContenido } from "./content/contenido";
import {
  KEY_NOCHE, KEY_MANANA, KEY_SEMANA, KEY_TRIMESTRE, KEY_ANUAL,
  fbGet, fbSet, leerPendientes, escribirPendientes, descargarBackup, nuevoId,
} from "./lib/datos";

import Login from "./views/Login";
import Home from "./views/Home";
import Manana from "./views/Manana";
import Noche from "./views/Noche";
import Historial from "./views/Historial";
import Periodica from "./views/Periodica";
import Resumen from "./views/Resumen";

// ─── App ──────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser]       = useState(undefined); // undefined=loading, null=logged out
  const [view, setView]       = useState("home");
  const [syncing, setSyncing] = useState(false);

  const [registros,   setRegistros]   = useState({});
  const [mananaLog,   setMananaLog]   = useState({});
  const [semanaLog,   setSemanaLog]   = useState({});
  const [trimestreLog,setTrimestreLog]= useState({});
  const [anualLog,    setAnualLog]    = useState({});
  const [planLog,     setPlanLog]     = useState({}); // plan/{domingo de la semana planificada}
  const [todos,       setTodos]       = useState({}); // pendientes (To Do's)
  const [objetivos,   setObjetivos]   = useState({}); // objetivos/{id} anuales por rol
  const [planTrim,    setPlanTrim]    = useState({}); // planTrimestral/{AAAA-QN}
  const [mensualLog,  setMensualLog]  = useState({}); // mensual/{AAAA-MM} del mes revisado
  const [frasesExtra, setFrasesExtra] = useState([]); // config/lenguaje: frases reactivas propias
  const [contenidoCfg,setContenidoCfg]= useState(null); // config/contenido: misión y roles editados
  const [agenda,      setAgenda]      = useState(null); // config/agenda: trimestrales y semanal
  const [habitos,     setHabitos]     = useState({}); // habitos/{id} del plan anual
  const [chispaCfg,   setChispaCfg]   = useState(null); // lo guardado en config/chispa (null = usar valores por defecto)
  const [, setReloj] = useState(0); // re-render cada minuto: habilita la Noche a las 19:00 y cambia de día a medianoche

  const [errorCarga,   setErrorCarga]   = useState(null);
  const [pendientes,   setPendientes]   = useState(leerPendientes);
  const [reintentando, setReintentando] = useState(false);
  const [backupEstado, setBackupEstado] = useState(null); // null | "descargando" | "error"

  const [form, setForm] = useState({
    fecha:todayBsAs(), p1:null,p1_nota:"",p2:null,p2_nota:"",p3:null,p3_nota:"",p4:null,p4_nota:"",
    conflicto:null, conflicto_nota:"", compromisoCumplido:null, tareaClaveHecha:null,
  });
  const [savedNoche,  setSavedNoche]  = useState(false);
  const [periodicaSub,   setPeriodicaSub]   = useState("semanal");

  // ── Auth listener ──
  useEffect(() => {
    const unsub = onAuthChange(u => setUser(u || null));
    return unsub;
  }, []);

  // ── Reloj ──
  useEffect(() => {
    const id = setInterval(() => setReloj(n => n+1), 60000);
    return () => clearInterval(id);
  }, []);

  // ── Load data when user logs in ──
  const loadFromFirebase = useCallback(async (uid) => {
    setSyncing(true);
    const [r, m, s, t, a, cfg, pl, td, ob, pt, me, hb] = await Promise.all([
      fbGet(uid, "noche"),
      fbGet(uid, "manana"),
      fbGet(uid, "semana"),
      fbGet(uid, "trimestre"),
      fbGet(uid, "anual"),
      fbGet(uid, "config"),
      fbGet(uid, "plan"),
      fbGet(uid, "pendientes"),
      fbGet(uid, "objetivos"),
      fbGet(uid, "planTrimestral"),
      fbGet(uid, "mensual"),
      fbGet(uid, "habitos"),
    ]);
    const fallidas = [["Noche",r],["Mañana",m],["Semanal",s],["Trimestral",t],["Anual",a],["Configuración",cfg],["Plan",pl],["Pendientes",td],["Objetivos",ob],["Plan trimestral",pt],["Mensual",me],["Hábitos",hb]]
      .filter(([,v])=>v===null).map(([n])=>n);
    setErrorCarga(fallidas.length ? fallidas : null);
    if (r) { setRegistros(r); try { localStorage.setItem(KEY_NOCHE,  JSON.stringify(r)); } catch {} }
    if (m) { setMananaLog(m); try { localStorage.setItem(KEY_MANANA, JSON.stringify(m)); } catch {} }
    if (s) { setSemanaLog(s); try { localStorage.setItem(KEY_SEMANA, JSON.stringify(s)); } catch {} }
    if (t) { setTrimestreLog(t); try { localStorage.setItem(KEY_TRIMESTRE, JSON.stringify(t)); } catch {} }
    if (a) { setAnualLog(a); try { localStorage.setItem(KEY_ANUAL, JSON.stringify(a)); } catch {} }
    // Cada documento de config guarda su contenido bajo una clave con su mismo nombre.
    if (cfg) {
      setChispaCfg(cfg.chispa?.chispa || null); setFrasesExtra(cfg.lenguaje?.lenguaje?.extras || []);
      setContenidoCfg(cfg.contenido?.contenido || null); setAgenda(cfg.agenda?.agenda || null);
    }
    if (pl) setPlanLog(pl);
    if (td) setTodos(td);
    if (ob) setObjetivos(ob);
    if (pt) setPlanTrim(pt);
    if (me) setMensualLog(me);
    if (hb) setHabitos(hb);
    setSyncing(false);
  }, []);

  useEffect(() => {
    if (user) {
      loadFromFirebase(user.uid);
    } else if (user === null) {
      // Load from localStorage as fallback
      try {
        const r = localStorage.getItem(KEY_NOCHE);  if (r) setRegistros(JSON.parse(r));
        const m = localStorage.getItem(KEY_MANANA); if (m) setMananaLog(JSON.parse(m));
        const s = localStorage.getItem(KEY_SEMANA); if (s) setSemanaLog(JSON.parse(s));
        const t = localStorage.getItem(KEY_TRIMESTRE); if (t) setTrimestreLog(JSON.parse(t));
        const a = localStorage.getItem(KEY_ANUAL);     if (a) setAnualLog(JSON.parse(a));
      } catch {}
    }
  }, [user, loadFromFirebase]);

  // ── Pre-fill noche form ──
  useEffect(() => {
    const r = registros[form.fecha];
    if (r) {
      setForm(f => ({...f, p1:r.p1, p1_nota:r.p1_nota??"", p2:r.p2, p2_nota:r.p2_nota??"",
        p3:r.p3, p3_nota:r.p3_nota??"", p4:r.p4??null, p4_nota:r.p4_nota??"",
        conflicto:r.conflicto??null, conflicto_nota:r.conflicto_nota??"", compromisoCumplido:r.compromisoCumplido??null, tareaClaveHecha:r.tareaClaveHecha??null}));
    } else {
      setForm(f => ({...f, p1:null,p1_nota:"",p2:null,p2_nota:"",p3:null,p3_nota:"",p4:null,p4_nota:"",
        conflicto:null, conflicto_nota:"", compromisoCumplido:null, tareaClaveHecha:null}));
    }
  }, [form.fecha, registros]);

  // ── Guardado en la nube con cola de pendientes ──
  // Devuelve true si llegó a Firestore. Si falla, el dato queda en el
  // dispositivo y en la cola, y el aviso ofrece reintentar.
  const actualizarPendientes = (fn) => {
    setPendientes(prev => { const next = fn(prev); escribirPendientes(next); return next; });
  };
  const guardarNube = async (col, id, data, label) => {
    if (!user) return false;
    const mismo = p => p.col===col && p.id===id;
    try {
      await fbSet(user.uid, col, id, data);
      actualizarPendientes(prev => prev.filter(p => !mismo(p)));
      return true;
    } catch(e) {
      console.error("fbSet error:", e);
      actualizarPendientes(prev => [...prev.filter(p => !mismo(p)), {col, id, data, label}]);
      return false;
    }
  };
  const handleReintentar = async () => {
    if (!user) return;
    setReintentando(true);
    for (const p of leerPendientes()) {
      await guardarNube(p.col, p.id, p.data, p.label);
    }
    setReintentando(false);
  };
  const handleBackup = async () => {
    if (!user) return;
    setBackupEstado("descargando");
    try { await descargarBackup(user.uid); setBackupEstado(null); }
    catch(e) { console.error("backup:", e); setBackupEstado("error"); }
  };

  // ── Persist helpers ──
  const persistNoche = async (data) => {
    setRegistros(data);
    try { localStorage.setItem(KEY_NOCHE, JSON.stringify(data)); } catch {}
    const fecha = form.fecha;
    return guardarNube("noche", fecha, data[fecha], `Noche ${formatDate(fecha)}`);
  };
  const persistManana = async (data) => {
    setMananaLog(data);
    try { localStorage.setItem(KEY_MANANA, JSON.stringify(data)); } catch {}
    const t = todayBsAs();
    return guardarNube("manana", t, data[t], `Mañana ${formatDate(t)}`);
  };

  const flashGuardado = (setter) => { setter(true); setTimeout(()=>setter(false),2500); };

  // ── Handlers ──
  const handleGuardarNoche = async () => {
    if (form.p1===null||form.p2===null||form.p3===null||form.p4===null) return;
    const updated = {...registros, [form.fecha]:{
      fecha:form.fecha, p1:form.p1, p1_nota:form.p1_nota,
      p2:form.p2, p2_nota:form.p2_nota, p3:form.p3, p3_nota:form.p3_nota,
      p4:form.p4, p4_nota:form.p4_nota,
      conflicto:form.conflicto, conflicto_nota:form.conflicto?form.conflicto_nota:"",
      compromisoCumplido:form.compromisoCumplido, tareaClaveHecha:form.tareaClaveHecha,
    }};
    if (await persistNoche(updated)) flashGuardado(setSavedNoche);
  };

  // Mañana: guarda el avance; `visto` (mañana completada) solo se marca al completar.
  const handleGuardarManana = async (m, completar) => {
    const t = todayBsAs();
    const previo = mananaLog[t] || {};
    const docu = {...previo, ...m, fecha:t, v:2, ...((completar||previo.visto)?{visto:true}:{})};
    return persistManana({...mananaLog, [t]:docu});
  };

  // Revisión semanal: guarda semana/{W} (revisión) y plan/{P} (plan) juntos.
  const handleGuardarRevision = async (rev, plan) => {
    const W = relevantWeekStart(todayBsAs()), P = semanaPlanDe(W);
    setSemanaLog(prev => { const next = {...prev, [W]:rev}; try { localStorage.setItem(KEY_SEMANA, JSON.stringify(next)); } catch {} return next; });
    setPlanLog(prev => ({...prev, [P]:plan}));
    const [a, b] = await Promise.all([
      guardarNube("semana", W, rev, `Revisión semanal ${formatDate(W)}`),
      guardarNube("plan", P, plan, `Plan semana ${formatDate(P)}`),
    ]);
    return a && b;
  };

  // Pendientes (To Do's).
  const handleAgregarTodo = async (texto, rol) => {
    const id = nuevoId();
    const t = { texto, rol, estado:"abierto", creado:todayBsAs() };
    setTodos(prev => ({...prev, [id]:t}));
    return guardarNube("pendientes", id, t, `Pendiente "${texto.length>30?texto.slice(0,30)+"…":texto}"`);
  };
  const handleTodo = async (id, cambios) => {
    const t = {...todos[id], ...cambios, actualizado:todayBsAs()};
    setTodos(prev => ({...prev, [id]:{...prev[id], ...cambios}}));
    return guardarNube("pendientes", id, t, `Pendiente "${(t.texto||"").length>30?t.texto.slice(0,30)+"…":(t.texto||"")}"`);
  };

  // Fase 4: revisión trimestral, plan trimestral y objetivos anuales.
  const handleGuardarTrimestral = async (K, data) => {
    setTrimestreLog(prev => { const next = {...prev, [K]:data}; try { localStorage.setItem(KEY_TRIMESTRE, JSON.stringify(next)); } catch {} return next; });
    return guardarNube("trimestre", K, data, `Revisión ${nombreTrimestre(K)}`);
  };
  const handleGuardarPlanTrim = async (K, data) => {
    setPlanTrim(prev => ({...prev, [K]:data}));
    return guardarNube("planTrimestral", K, data, `Plan ${nombreTrimestre(K)}`);
  };
  const handleGuardarMensual = async (key, data) => {
    setMensualLog(prev => ({...prev, [key]:data}));
    return guardarNube("mensual", key, data, `Cierre de ${nombreMes(key)}`);
  };
  const handleGuardarFrases = async (extras) => {
    setFrasesExtra(extras);
    return guardarNube("config", "lenguaje", {lenguaje:{extras}}, "Frases reactivas");
  };
  // Fase 4c: revisión anual, contenido editable, agenda y hábitos del año.
  const handleGuardarAnual = async (Y, data) => {
    setAnualLog(prev => { const next = {...prev, [Y]:data}; try { localStorage.setItem(KEY_ANUAL, JSON.stringify(next)); } catch {} return next; });
    return guardarNube("anual", String(Y), data, `Revisión anual ${Y}`);
  };
  const handleGuardarContenido = async (cambios) => {
    const nuevo = {...(contenidoCfg||{}), ...cambios};
    setContenidoCfg(nuevo);
    return guardarNube("config", "contenido", {contenido:nuevo}, "Misión y roles");
  };
  const handleGuardarAgenda = async (cambios) => {
    const nueva = {...(agenda||{}), ...cambios};
    setAgenda(nueva);
    return guardarNube("config", "agenda", {agenda:nueva}, "Agenda de revisiones");
  };
  const handleGuardarHabito = async (id, cambios) => {
    const h = {...habitos[id], ...cambios};
    setHabitos(prev => ({...prev, [id]:h}));
    return guardarNube("habitos", id, h, `Hábito "${(h.texto||"").slice(0,30)}"`);
  };
  // Al completar la Parte 1, la evaluación de cada objetivo queda en el objetivo.
  const persistirEvaluaciones = async (evaluaciones) => {
    for (const [id, ev] of Object.entries(evaluaciones||{})) {
      if (ev?.categoria && objetivos[id]) await handleGuardarObjetivo(id, {estado:ev.categoria, evaluacion:ev});
    }
  };
  const handleGuardarObjetivo = async (id, cambios) => {
    const o = {...objetivos[id], ...cambios};
    setObjetivos(prev => ({...prev, [id]:o}));
    return guardarNube("objetivos", id, o, `Objetivo "${(o.titulo||"").slice(0,30)}"`);
  };

  // Guarda cambios parciales de la chispa (contenido o pesos) en config/chispa.
  const handleGuardarChispa = async (cambios) => {
    const nueva = {...chispa, ...cambios};
    setChispaCfg(nueva);
    return guardarNube("config", "chispa", {chispa:nueva}, "Chispa interior");
  };

  // ── Computed ──
  const today       = todayBsAs();
  const allDates    = [...new Set([...Object.keys(registros), ...Object.keys(mananaLog)])].sort();
  const firstDate   = allDates[0]||today;
  const allDays     = dateRange(firstDate, today);
  const tracked     = allDays.filter(d=>registros[d]);
  const missed      = allDays.filter(d=>!registros[d]&&d!==today);
  // Hoy solo cuenta si ya se hizo: el día no es "incumplido" hasta que termina.
  const totalNoche  = allDays.filter(d=>d<today||registros[d]).length;
  const totalManana = allDays.filter(d=>d<today||mananaLog[d]?.visto).length;
  const consistency = totalNoche>0?Math.round((tracked.length/totalNoche)*100):0;
  const mananasHechas = allDays.filter(d=>mananaLog[d]?.visto).length;
  const stats = { allDays, tracked, missed, totalNoche, totalManana, consistency, mananasHechas };
  const mananHoy    = !!(mananaLog[today]?.visto);
  const nocheHoy    = !!(registros[today]);
  const nocheDisp   = nocheDisponible(today);
  const frase       = fraseDelDia();
  const chispa      = {...CHISPA_DEFAULT, ...(chispaCfg||{})};
  aplicarContenido(contenidoCfg); // misión y roles vigentes (editables desde la anual)

  // Semanal: nunca "vencida" (la herramienta es sierva, no ama).
  const W            = relevantWeekStart(today);
  const P            = semanaPlanDe(W);
  const revW         = semanaLog[W];
  const diaSemanal   = agenda?.semanal?.dia ?? 6; // sábado por defecto
  const esSabado     = new Date(today+"T12:00:00").getDay()===diaSemanal;
  const semanaEstado = revisionCompleta(revW) ? "completada"
    : esV2(revW) ? "encurso" : esSabado ? "hoy" : "espera";

  // Trimestral y anual: dentro de su ventana, o "Próxima: dd/mm" (nunca vencidas).
  const ventanaT    = ventanaTrimestral(today, agenda);
  const revT        = ventanaT.abierta ? trimestreLog[ventanaT.key] : null;
  const trimEstado  = !ventanaT.abierta ? "espera" : revT?.estado==="completa" ? "completada" : revT?.v===2 ? "encurso" : "hoy";
  const ventanaM    = ventanaMensual(today);
  const revM        = ventanaM.abierta ? mensualLog[ventanaM.key] : null;
  const mensualEstado = !ventanaM.abierta ? "espera" : revM?.estado==="completa" ? "completada" : revM ? "encurso" : "hoy";
  const ventanaA    = ventanaAnual(today);
  const partesA     = ventanaA.abierta ? (anualLog[ventanaA.key]?.partes||{}) : {};
  const nCompletas  = [1,2,3,4,5].filter(n=>partesA[n]?.estado==="completa").length;
  const anualEstado = !ventanaA.abierta ? "espera" : nCompletas===5 ? "completada" : Object.keys(partesA).length ? "encurso" : "hoy";
  // Relato del día a fin de año (Parte 5 de la anual anterior): se muestra en semanas bajas.
  const relatoAnio  = anualLog[String(Number(today.slice(0,4))-1)]?.partes?.[5]?.relato || "";

  const periodicaPendiente = [semanaEstado, mensualEstado, trimEstado].some(e=>e==="hoy"||e==="encurso");

  const badges = {
    home:      (!mananHoy||(nocheDisp&&!nocheHoy)||periodicaPendiente)?1:0,
    manana:    mananHoy?0:1,
    noche:     (nocheDisp&&!nocheHoy)?1:0,
    periodica: periodicaPendiente?1:0,
  };

  // Mañana: cualidad del mes (elegida en el cierre del mes anterior) y hábitos del mes en curso.
  const enFoco = {
    cualidad: mensualLog[mesAnterior(today.slice(0,7))]?.cualidad || "",
    habitos: HABITOS_SEGUIDOS.map(h=>({nombre:h.nombre, ...cumplimientoHabito(h, today.slice(0,7)+"-01", today, today, {registros, mananaLog})})),
  };

  const irA = (v, sub) => { setView(v); if (sub) setPeriodicaSub(sub); };

  // ── Loading state ──
  if (user === undefined) {
    return (
      <div style={{minHeight:"100vh",background:C.navy,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{color:C.white,fontSize:16,fontFamily:"'DM Sans',sans-serif"}}>Cargando...</div>
      </div>
    );
  }

  // ── Login screen ──
  if (user === null) return <Login/>;

  const linkHeader = {fontSize:10,color:"rgba(255,255,255,0.35)",background:"none",border:"none",cursor:"pointer",padding:0,fontFamily:"inherit"};

  // ── Main app ──
  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'DM Sans',sans-serif",color:C.textPrimary}}>

      {/* Header */}
      <div style={{background:C.navy,position:"sticky",top:0,zIndex:20,boxShadow:"0 2px 12px rgba(0,31,91,0.3)"}}>
        <div className="container" style={{padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <Escudo size={34}/>
            <div>
              <div style={{fontSize:9,letterSpacing:3,color:C.celesteLight,textTransform:"uppercase",marginBottom:1}}>Los 7 Hábitos · Covey</div>
              <div style={{fontSize:15,fontFamily:"'Playfair Display',serif",color:C.white}}>Centro de Mando <em style={{color:C.celesteLight}}>Personal</em></div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {syncing && <div style={{fontSize:11,color:C.celesteLight}}>↑↓</div>}
            <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end"}}>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.6)"}}>{user.displayName?.split(" ")[0]}</div>
              <button onClick={logout} style={linkHeader}>salir</button>
              <button onClick={handleBackup} disabled={backupEstado==="descargando"} title="Descargar backup completo en JSON"
                style={{...linkHeader,color:backupEstado==="error"?"#fca5a5":linkHeader.color}}>
                {backupEstado==="descargando"?"backup…":backupEstado==="error"?"backup falló":"backup"}
              </button>
            </div>
            {user.photoURL && <img src={user.photoURL} alt="" style={{width:30,height:30,borderRadius:"50%",border:`2px solid ${C.celeste}`}}/>}
          </div>
        </div>

        {/* Nav */}
        <div className="container" style={{display:"flex",borderTop:"1px solid rgba(255,255,255,0.1)",overflowX:"auto"}}>
          {[
            {id:"home",    label:"Home",     badge:badges.home},
            {id:"manana",  label:"Mañana",   badge:badges.manana},
            {id:"noche",   label:"Noche",    badge:badges.noche},
            {id:"periodica",label:"Periódica",badge:badges.periodica},
            {id:"resumen", label:"Resumen",  badge:0},
            {id:"historial",label:"Historial",badge:0},
          ].map(tab => (
            <button key={tab.id} onClick={()=>setView(tab.id)} style={{
              flex:"1 0 auto",padding:"10px 8px",border:"none",cursor:"pointer",
              background:"transparent",
              color:view===tab.id?C.white:"rgba(255,255,255,0.4)",
              fontSize:12,fontFamily:"inherit",fontWeight:view===tab.id?600:400,
              borderBottom:view===tab.id?`3px solid ${C.celeste}`:"3px solid transparent",
              transition:"all 0.2s",position:"relative",whiteSpace:"nowrap",
            }}>
              {tab.label}
              {tab.badge>0 && <span style={{position:"absolute",top:6,right:4,width:7,height:7,borderRadius:"50%",background:C.warn,border:`1px solid ${C.navy}`}}/>}
            </button>
          ))}
        </div>
      </div>

      <div className="container" style={{padding:"20px 16px 80px"}}>

        <AvisoSync errorCarga={errorCarga} pendientes={pendientes} reintentando={reintentando} onReintentar={handleReintentar}/>

        {view==="home" && (
          <Home today={today} mananHoy={mananHoy} nocheHoy={nocheHoy} nocheDisp={nocheDisp}
            semanaEstado={semanaEstado} trimEstado={trimEstado} anualEstado={anualEstado} irA={irA}
            mensualEstado={mensualEstado} mensualEtiqueta={ventanaM.abierta?(mensualEstado==="hoy"?"Disponible":undefined):`Próxima ${formatDate(ventanaM.proxima).slice(0,5)}`}
            trimEtiqueta={ventanaT.abierta?undefined:`Próxima ${formatDate(ventanaT.proxima).slice(0,5)}`}
            anualEtiqueta={ventanaA.abierta?(anualEstado==="hoy"?"Disponible":undefined):`Próxima ${formatDate(ventanaA.proxima).slice(0,5)}`}/>
        )}

        {view==="manana" && <Manana key={today+(syncing?"-cargando":"")} today={today} doc={mananaLog[today]} plan={planLog[getWeekStart(today)]} mananaLog={mananaLog} frase={frase} onGuardar={handleGuardarManana} enFoco={enFoco}/>}

        {view==="noche" && (
          <Noche form={form} setForm={setForm} today={today} registros={registros} manana={mananaLog[form.fecha]}
            onGuardar={handleGuardarNoche} savedNoche={savedNoche}/>
        )}

        {view==="historial" && (
          <Historial stats={stats} registros={registros} mananaLog={mananaLog} semanaLog={semanaLog} planLog={planLog} today={today} nocheDisp={nocheDisp}/>
        )}

        {view==="periodica" && (
          <Periodica sub={periodicaSub} setSub={setPeriodicaSub}
            semanaEstado={semanaEstado} trimEstado={trimEstado} anualEstado={anualEstado}
            W={W} P={P} semanaLog={semanaLog} planLog={planLog} registros={registros} mananaLog={mananaLog}
            onGuardarRevision={handleGuardarRevision} todos={todos} onAgregarTodo={handleAgregarTodo} onTodo={handleTodo}
            ventanaM={ventanaM} mensualEstado={mensualEstado} mensualLog={mensualLog} frasesExtra={frasesExtra}
            onGuardarMensual={handleGuardarMensual} onGuardarFrases={handleGuardarFrases}
            ventanaT={ventanaT} ventanaA={ventanaA} trimestreLog={trimestreLog} planTrim={planTrim} objetivos={objetivos}
            onGuardarTrimestral={handleGuardarTrimestral} onGuardarPlanTrim={handleGuardarPlanTrim} onGuardarObjetivo={handleGuardarObjetivo}
            chispa={chispa} onGuardarChispa={handleGuardarChispa}
            anualLog={anualLog} habitos={habitos} contenidoCfg={contenidoCfg} agenda={agenda} relatoAnio={relatoAnio}
            onGuardarAnual={handleGuardarAnual} onGuardarContenido={handleGuardarContenido} onGuardarAgenda={handleGuardarAgenda}
            onGuardarHabito={handleGuardarHabito} persistirEvaluaciones={persistirEvaluaciones}/>
        )}

        {view==="resumen" && (
          <Resumen stats={stats} registros={registros} semanaLog={semanaLog}
            trimestreLog={trimestreLog} anualLog={anualLog} today={today}/>
        )}

      </div>
    </div>
  );
}
