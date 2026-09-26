// ─── Racing Club palette ───────────────────────────────────────────────
export const C = {
  bg:"#f0f4f8", surface:"#ffffff", surfaceAlt:"#e8eef5", border:"#c5d5e8",
  navy:"#001f5b", navyLight:"#0a3080", celeste:"#2176c7", celesteLight:"#5ba3e8",
  celestePale:"#ddeeff", white:"#ffffff", textPrimary:"#0d1f3c",
  textSecond:"#4a6285", textMuted:"#8aa3c0",
  yes:"#1a7a3c", yesBg:"#d4f0df", no:"#b91c1c", noBg:"#fde8e8",
  warn:"#b45309", warnBg:"#fef3c7",
  perfect:"#2176c7", good:"#1a7a3c", mid:"#b45309", bad:"#b91c1c", skip:"#c5d5e8",
  gold:"#d97706", goldBg:"#fef9ec",
};

// ─── Estilos compartidos ───────────────────────────────────────────────
export const card = {
  background:"#ffffff",border:`1px solid #c5d5e8`,borderRadius:12,
  padding:"18px 16px",marginBottom:14,boxShadow:"0 1px 4px rgba(0,31,91,0.06)",
};
export const inp = {
  width:"100%",boxSizing:"border-box",background:"#f0f4f8",
  border:`1px solid #c5d5e8`,borderRadius:8,color:"#0d1f3c",
  padding:"10px 12px",fontSize:14,fontFamily:"inherit",
};
export const lbl = {
  fontSize:11,letterSpacing:2,color:"#8aa3c0",
  textTransform:"uppercase",display:"block",marginBottom:6,
};
export const btnPrimario = {
  width:"100%",padding:14,borderRadius:10,border:"none",cursor:"pointer",
  background:C.navy,color:C.white,fontSize:15,fontFamily:"inherit",fontWeight:600,
};

export function scoreColor(pct){ return pct>=80?C.good:pct>=50?C.mid:C.bad; }
export function dotColor(reg){
  if(!reg) return C.skip;
  const s=[reg.p1,reg.p2,reg.p3].filter(Boolean).length;
  return s===3?C.perfect:s===2?C.good:s===1?C.mid:C.bad;
}
