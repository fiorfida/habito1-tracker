import { useState, useEffect, useCallback } from "react";
import { logout, onAuthChange } from "./firebase";
import "./responsive.css";

import { C } from "./theme";
import { Escudo, AvisoSync } from "./components/ui";
import { todayBsAs, relevantWeekStart, dateRange, trimestralStatus, anualStatus, formatDate } from "./lib/fechas";
import { emptyMetas, mergeMetas } from "./lib/metas";
import { fraseDelDia } from "./lib/frases";
import {
  KEY_NOCHE, KEY_MANANA, KEY_SEMANA, KEY_TRIMESTRE, KEY_ANUAL,
  fbGet, fbSet, fbDelete, migrarSemanaLog, leerPendientes, escribirPendientes, descargarBackup,
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

  const [errorCarga,   setErrorCarga]   = useState(null);
  const [pendientes,   setPendientes]   = useState(leerPendientes);
  const [reintentando, setReintentando] = useState(false);
  const [backupEstado, setBackupEstado] = useState(null); // null | "descargando" | "error"

  const [form, setForm] = useState({
    fecha:todayBsAs(), p1:null,p1_nota:"",p2:null,p2_nota:"",p3:null,p3_nota:"",p4:null,p4_nota:"",
  });
  const [savedNoche,  setSavedNoche]  = useState(false);
  const [semanaForm,  setSemanaForm]  = useState({s1:"",s2:"",s3:"",metas:emptyMetas()});
  const [savedSemana, setSavedSemana] = useState(false);
  const [trimestreForm,  setTrimestreForm]  = useState({t1:"",t2:"",t3:""});
  const [savedTrimestre, setSavedTrimestre] = useState(false);
  const [anualForm,      setAnualForm]      = useState({a1:"",a2:"",a3:"",a4:""});
  const [savedAnual,     setSavedAnual]     = useState(false);
  const [periodicaSub,   setPeriodicaSub]   = useState("semanal");

  // ── Auth listener ──
  useEffect(() => {
    const unsub = onAuthChange(u => setUser(u || null));
    return unsub;
  }, []);

  // ── Load data when user logs in ──
  const loadFromFirebase = useCallback(async (uid) => {
    setSyncing(true);
    const [r, m, s, t, a] = await Promise.all([
      fbGet(uid, "noche"),
      fbGet(uid, "manana"),
      fbGet(uid, "semana"),
      fbGet(uid, "trimestre"),
      fbGet(uid, "anual"),
    ]);
    const fallidas = [["Noche",r],["Mañana",m],["Semanal",s],["Trimestral",t],["Anual",a]]
      .filter(([,v])=>v===null).map(([n])=>n);
    setErrorCarga(fallidas.length ? fallidas : null);
    if (r) { setRegistros(r); try { localStorage.setItem(KEY_NOCHE,  JSON.stringify(r)); } catch {} }
    if (m) { setMananaLog(m); try { localStorage.setItem(KEY_MANANA, JSON.stringify(m)); } catch {} }
    if (s) {
      const { migrated, cambios } = migrarSemanaLog(s);
      setSemanaLog(migrated);
      try { localStorage.setItem(KEY_SEMANA, JSON.stringify(migrated)); } catch {}
      for (const {antes,despues} of cambios) {
        try {
          await fbSet(uid, "semana", despues, migrated[despues]);
          await fbDelete(uid, "semana", antes);
        } catch(e) { console.error("migración semana:", e); }
      }
    }
    if (t) { setTrimestreLog(t); try { localStorage.setItem(KEY_TRIMESTRE, JSON.stringify(t)); } catch {} }
    if (a) { setAnualLog(a); try { localStorage.setItem(KEY_ANUAL, JSON.stringify(a)); } catch {} }
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
        const s = localStorage.getItem(KEY_SEMANA);
        if (s) {
          const { migrated } = migrarSemanaLog(JSON.parse(s));
          setSemanaLog(migrated);
          try { localStorage.setItem(KEY_SEMANA, JSON.stringify(migrated)); } catch {}
        }
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
        p3:r.p3, p3_nota:r.p3_nota??"", p4:r.p4??null, p4_nota:r.p4_nota??""}));
    } else {
      setForm(f => ({...f, p1:null,p1_nota:"",p2:null,p2_nota:"",p3:null,p3_nota:"",p4:null,p4_nota:""}));
    }
  }, [form.fecha, registros]);

  // ── Pre-fill semana form ──
  useEffect(() => {
    const wk = relevantWeekStart(todayBsAs());
    const s = semanaLog[wk];
    if (s) setSemanaForm({s1:s.s1??"",s2:s.s2??"",s3:s.s3??"",metas:mergeMetas(s.metas)});
    else setSemanaForm({s1:"",s2:"",s3:"",metas:emptyMetas()});
  }, [semanaLog]);

  // ── Pre-fill trimestre form ──
  useEffect(() => {
    const { key } = trimestralStatus(todayBsAs());
    const t = trimestreLog[key];
    if (t) setTrimestreForm({t1:t.t1??"",t2:t.t2??"",t3:t.t3??""});
    else setTrimestreForm({t1:"",t2:"",t3:""});
  }, [trimestreLog]);

  // ── Pre-fill anual form ──
  useEffect(() => {
    const { key } = anualStatus(todayBsAs());
    const a = anualLog[key];
    if (a) setAnualForm({a1:a.a1??"",a2:a.a2??"",a3:a.a3??"",a4:a.a4??""});
    else setAnualForm({a1:"",a2:"",a3:"",a4:""});
  }, [anualLog]);

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
  const persistSemana = async (data) => {
    setSemanaLog(data);
    try { localStorage.setItem(KEY_SEMANA, JSON.stringify(data)); } catch {}
    const wk = relevantWeekStart(todayBsAs());
    return guardarNube("semana", wk, data[wk], `Semanal ${formatDate(wk)}`);
  };
  const persistTrimestre = async (data) => {
    setTrimestreLog(data);
    try { localStorage.setItem(KEY_TRIMESTRE, JSON.stringify(data)); } catch {}
    const { key } = trimestralStatus(todayBsAs());
    return guardarNube("trimestre", key, data[key], `Trimestral ${key.replace("-Q"," T")}`);
  };
  const persistAnual = async (data) => {
    setAnualLog(data);
    try { localStorage.setItem(KEY_ANUAL, JSON.stringify(data)); } catch {}
    const { key } = anualStatus(todayBsAs());
    return guardarNube("anual", key, data[key], `Anual ${key}`);
  };

  const flashGuardado = (setter) => { setter(true); setTimeout(()=>setter(false),2500); };

  // ── Handlers ──
  const handleGuardarNoche = async () => {
    if (form.p1===null||form.p2===null||form.p3===null||form.p4===null) return;
    const updated = {...registros, [form.fecha]:{
      fecha:form.fecha, p1:form.p1, p1_nota:form.p1_nota,
      p2:form.p2, p2_nota:form.p2_nota, p3:form.p3, p3_nota:form.p3_nota,
      p4:form.p4, p4_nota:form.p4_nota,
    }};
    if (await persistNoche(updated)) flashGuardado(setSavedNoche);
  };

  const handleMarcarManana = async () => {
    const t = todayBsAs();
    const updated = {...mananaLog, [t]:{fecha:t, visto:true}};
    await persistManana(updated);
  };

  const handleGuardarSemana = async () => {
    const wk = relevantWeekStart(todayBsAs());
    const updated = {...semanaLog, [wk]:{...semanaForm, ts:todayBsAs()}};
    if (await persistSemana(updated)) flashGuardado(setSavedSemana);
  };

  const handleMetaChange = (roleNum, idx, value) => {
    setSemanaForm(f => ({...f, metas:{...f.metas, [roleNum]: f.metas[roleNum].map((v,i)=>i===idx?value:v)}}));
  };

  const handleGuardarTrimestre = async () => {
    const { key } = trimestralStatus(todayBsAs());
    const updated = {...trimestreLog, [key]:{...trimestreForm, ts:todayBsAs()}};
    if (await persistTrimestre(updated)) flashGuardado(setSavedTrimestre);
  };

  const handleGuardarAnual = async () => {
    const { key } = anualStatus(todayBsAs());
    const updated = {...anualLog, [key]:{...anualForm, ts:todayBsAs()}};
    if (await persistAnual(updated)) flashGuardado(setSavedAnual);
  };

  // ── Computed ──
  const today       = todayBsAs();
  const allDates    = [...new Set([...Object.keys(registros), ...Object.keys(mananaLog)])].sort();
  const firstDate   = allDates[0]||today;
  const allDays     = dateRange(firstDate, today);
  const tracked     = allDays.filter(d=>registros[d]);
  const missed      = allDays.filter(d=>!registros[d]&&d!==today);
  const totalDays   = allDays.length;
  const consistency = totalDays>0?Math.round((tracked.length/totalDays)*100):0;
  const mananasHechas = allDays.filter(d=>mananaLog[d]?.visto).length;
  const stats = { allDays, tracked, missed, totalDays, consistency, mananasHechas };
  const mananHoy    = !!(mananaLog[today]);
  const nocheHoy    = !!(registros[today]);
  const frase       = fraseDelDia();

  const wkStart      = relevantWeekStart(today);
  const semanaHecha  = !!(semanaLog[wkStart]);
  const semanaVentanaAbierta = new Date(today+"T12:00:00").getDay()===6;
  const semanaEstado = semanaHecha?"completada":(semanaVentanaAbierta?"pendiente":"vencida");

  const trimInfo    = trimestralStatus(today);
  const trimHecho   = !!(trimestreLog[trimInfo.key]);
  const trimEstado  = trimHecho?"completada":(trimInfo.ventanaAbierta?"pendiente":"vencida");

  const anualInfo   = anualStatus(today);
  const anualHecho  = !!(anualLog[anualInfo.key]);
  const anualEstado = anualHecho?"completada":(anualInfo.ventanaAbierta?"pendiente":"vencida");

  const periodicaPendiente = semanaEstado!=="completada"||trimEstado!=="completada"||anualEstado!=="completada";

  const badges = {
    home:      (!mananHoy||!nocheHoy||periodicaPendiente)?1:0,
    manana:    mananHoy?0:1,
    noche:     nocheHoy?0:1,
    periodica: periodicaPendiente?1:0,
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
          <Home today={today} mananHoy={mananHoy} nocheHoy={nocheHoy}
            semanaEstado={semanaEstado} trimEstado={trimEstado} anualEstado={anualEstado} irA={irA}/>
        )}

        {view==="manana" && <Manana mananHoy={mananHoy} frase={frase} onMarcar={handleMarcarManana}/>}

        {view==="noche" && (
          <Noche form={form} setForm={setForm} today={today} registros={registros}
            onGuardar={handleGuardarNoche} savedNoche={savedNoche}/>
        )}

        {view==="historial" && (
          <Historial stats={stats} registros={registros} mananaLog={mananaLog} semanaLog={semanaLog} today={today}/>
        )}

        {view==="periodica" && (
          <Periodica sub={periodicaSub} setSub={setPeriodicaSub}
            semanaEstado={semanaEstado} trimEstado={trimEstado} anualEstado={anualEstado}
            wkStart={wkStart} semanaForm={semanaForm} setSemanaForm={setSemanaForm}
            onMetaChange={handleMetaChange} onGuardarSemana={handleGuardarSemana} savedSemana={savedSemana} semanaLog={semanaLog}
            trimInfo={trimInfo} trimestreForm={trimestreForm} setTrimestreForm={setTrimestreForm}
            onGuardarTrimestre={handleGuardarTrimestre} savedTrimestre={savedTrimestre} trimestreLog={trimestreLog}
            anualInfo={anualInfo} anualForm={anualForm} setAnualForm={setAnualForm}
            onGuardarAnual={handleGuardarAnual} savedAnual={savedAnual} anualLog={anualLog}/>
        )}

        {view==="resumen" && (
          <Resumen stats={stats} registros={registros} semanaLog={semanaLog}
            trimestreLog={trimestreLog} anualLog={anualLog} today={today}/>
        )}

      </div>
    </div>
  );
}
