const { useState, useEffect, useRef, useCallback } = React;

/* ── Pull Framer Motion from the loaded UMD bundle ── */
const { motion, AnimatePresence } = window.Motion || window.FramerMotion || (() => {
  /* graceful fallback — plain divs if FM didn't load */
  const Noop = ({ children, ...rest }) => React.createElement('div', rest, children);
  return { motion: { div: Noop }, AnimatePresence: ({ children }) => children };
})();

/* ─── Translations ──────────────────────────────────────── */
const T = {
  en: {
    appName:"StreetConnect", tagline:"Live vendors near you",
    searchPlaceholder:"Search vendors, items...",
    categories:"Categories",
    favorites:"Frequently Visited",
    catList:["All","Tea","Coffee","Snacks","Stationary","Fancy Items"],
    live:"LIVE", busy:"BUSY", closing:"CLOSING",
    distance:"away", availAt:"Usually here at", items:"Items",
    intercept:"Catch Vendor", interceptOn:"Intercept ON",
    meetAt:"Meet in", mins:"mins", meters:"m",
    notify:"Notify Me", happyHour:"Happy Hour",
    notifications:"Notifications", noNotifs:"No alerts yet.",
    homeAlert:"Your favourite vendor is near your Home!",
    clearAll:"Clear all", home:"HOME",
  },
  hi: {
    appName:"स्ट्रीटकनेक्ट", tagline:"पास के विक्रेता लाइव",
    searchPlaceholder:"विक्रेता, आइटम खोजें...",
    categories:"श्रेणियाँ",
    favorites:"अक्सर देखे गए",
    catList:["सभी","चाय","कॉफ़ी","नाश्ता","स्टेशनरी","फैंसी आइटम"],
    live:"लाइव", busy:"व्यस्त", closing:"बंद",
    distance:"दूर", availAt:"यहाँ मिलते हैं", items:"आइटम",
    intercept:"विक्रेता पकड़ें", interceptOn:"इंटरसेप्ट चालू",
    meetAt:"मिलें", mins:"मिनट में", meters:"मी",
    notify:"सूचित करें", happyHour:"हैप्पी आवर",
    notifications:"सूचनाएं", noNotifs:"कोई अलर्ट नहीं।",
    homeAlert:"आपका पसंदीदा विक्रेता घर के पास है!",
    clearAll:"सभी हटाएं", home:"घर",
  },
  te: {
    appName:"స్ట్రీట్‌కనెక్ట్", tagline:"దగ్గర వ్యాపారులు లైవ్",
    searchPlaceholder:"వ్యాపారులు, వస్తువులు వెతకండి...",
    categories:"వర్గాలు",
    favorites:"తరచుగా సందర్శించారు",
    catList:["అన్నీ","టీ","కాఫీ","స్నాక్స్","స్టేషనరీ","ఫాన్సీ"],
    live:"లైవ్", busy:"బిజీ", closing:"మూసేస్తారు",
    distance:"దూరం", availAt:"సాధారణంగా ఇక్కడ", items:"వస్తువులు",
    intercept:"వ్యాపారిని పట్టుకోండి", interceptOn:"ఇంటర్‌సెప్ట్ ఆన్",
    meetAt:"కలవండి", mins:"నిమిషాల్లో", meters:"మీ",
    notify:"తెలియజేయి", happyHour:"హ్యాపీ అవర్",
    notifications:"నోటిఫికేషన్లు", noNotifs:"అలర్ట్‌లు లేవు.",
    homeAlert:"మీకు ఇష్టమైన వ్యాపారి ఇంటి దగ్గర ఉన్నారు!",
    clearAll:"అన్నీ తొలగించు", home:"ఇల్లు",
  },
};

/* ─── Constants ─────────────────────────────────────────── */
const HOME_POS  = { x:88, y:305 };
const CATS_KEY  = ["All","Tea","Coffee","Snacks","Stationary","Fancy Items"];
const CAT_ICON  = { Tea:"☕", Coffee:"☕", Snacks:"🥪", Fruits:"🍎", Stationary:"✏️", "Fancy Items":"✨", All:"🌐" };
const CAT_GRAD  = {
  Tea:"linear-gradient(135deg,#f59e0b,#d97706)",
  Coffee:"linear-gradient(135deg,#92400e,#78350f)",
  Snacks:"linear-gradient(135deg,#f97316,#ea580c)",
  Stationary:"linear-gradient(135deg,#8b5cf6,#7c3aed)",
  "Fancy Items":"linear-gradient(135deg,#ec4899,#be185d)",
  All:"linear-gradient(135deg,#38bdf8,#6366f1)",
};
const STATUS_COL= { live:"#22C55E", busy:"#F59E0B", closing:"#64748B" };
const FAV_GLOW  = { Tea:"rgba(251,191,36,.35)", Coffee:"rgba(146,64,14,.4)", Snacks:"rgba(251,146,60,.3)", Stationary:"rgba(167,139,250,.3)", "Fancy Items":"rgba(236,72,153,.3)", All:"rgba(56,189,248,.3)" };

/* ─── Vendor Data ───────────────────────────────────────── */
const VENDORS = [
  {
    id:1, cat:"Tea", status:"live",
    name:"Ramu Chai Wala", nameHi:"रामू चाय वाला", nameTe:"రాము చాయ్ వాల్",
    x:155, y:192, dist:180, time:"6:00 AM – 10:00 AM", happyHour:false,
    items:[{n:"Cutting Chai",p:10},{n:"Ginger Tea",p:15},{n:"Bun Maska",p:20}],
    path:[{x:155,y:192},{x:125,y:240},{x:98,y:295}],
    intercept:{x:98,y:295,mins:3,dist:250},
  },
  {
    id:2, cat:"Coffee", status:"busy",
    name:"Priya Coffee Cart", nameHi:"प्रिया कॉफ़ी कार्ट", nameTe:"ప్రియా కాఫీ కార్ట్",
    x:308, y:142, dist:220, time:"7:00 AM – 11:00 AM", happyHour:true,
    items:[{n:"Espresso",p:40,op:60},{n:"Cold Coffee",p:55,op:80},{n:"Latte",p:50,op:70}],
    path:[{x:308,y:142},{x:200,y:218},{x:105,y:298}],
    intercept:{x:105,y:298,mins:4,dist:310},
  },
  {
    id:3, cat:"Snacks", status:"live",
    name:"Venkat Snacks", nameHi:"वेंकट स्नैक्स", nameTe:"వెంకట్ స్నాక్స్",
    x:442, y:232, dist:95, time:"4:00 PM – 9:00 PM", happyHour:false,
    items:[{n:"Mirchi Bajji",p:30},{n:"Samosa",p:15},{n:"Vada",p:12}],
    path:[{x:442,y:232},{x:308,y:268},{x:96,y:308}],
    intercept:{x:96,y:308,mins:2,dist:180},
  },
  {
    id:4, cat:"Stationary", status:"closing",
    name:"Ravi Stationery", nameHi:"रवि स्टेशनरी", nameTe:"రవి స్టేషనరీ",
    x:198, y:338, dist:310, time:"9:00 AM – 6:00 PM", happyHour:false,
    items:[{n:"Notebook",p:40},{n:"Pens (Set)",p:25},{n:"Ruler",p:15}],
    path:[{x:198,y:338},{x:145,y:322},{x:95,y:308}],
    intercept:{x:95,y:308,mins:5,dist:360},
  },
  {
    id:5, cat:"Fancy Items", status:"live",
    name:"Kalyan Fancy Store", nameHi:"कल्याण फैंसी स्टोर", nameTe:"కళ్యాణ్ ఫాన్సీ స్టోర్",
    x:365, y:308, dist:210, time:"10:00 AM – 8:00 PM", happyHour:true,
    items:[{n:"Hair Clips",p:30,op:50},{n:"Bangles",p:20,op:35},{n:"Ribbons",p:10,op:18}],
    path:[{x:365,y:308},{x:220,y:308},{x:100,y:310}],
    intercept:{x:100,y:310,mins:3,dist:270},
  },
  {
    id:6, cat:"Tea", status:"busy",
    name:"Sunita Chai Corner", nameHi:"सुनीता चाय कॉर्नर", nameTe:"సునీత చాయ్ కార్నర్",
    x:80, y:160, dist:420, time:"5:00 AM – 9:00 AM", happyHour:false,
    items:[{n:"Masala Chai",p:12},{n:"Lemon Tea",p:15},{n:"Rusk",p:8}],
    path:[{x:80,y:160},{x:88,y:220},{x:90,y:300}],
    intercept:{x:90,y:300,mins:6,dist:410},
  },
  {
    id:7, cat:"Stationary", status:"live",
    name:"Abdul Pen Wala", nameHi:"अब्दुल पेन वाला", nameTe:"అబ్దుల్ పెన్ వాలా",
    x:470, y:350, dist:260, time:"8:00 AM – 7:00 PM", happyHour:false,
    items:[{n:"Ball Pen",p:5},{n:"Sketch Pens",p:35},{n:"Eraser Set",p:20}],
    path:[{x:470,y:350},{x:280,y:330},{x:95,y:310}],
    intercept:{x:95,y:310,mins:4,dist:290},
  },
];

const DEFAULT_FAVS = [1,2,5];
const INITIAL_NOTIFS = [
  {id:101,icon:"🥘",text:"Raju Samosa was nearby at 5:30 PM",time:"5:30 PM",isNew:false},
  {id:102,icon:"☕",text:"Ramu Chai Wala passed your street at 7:15 AM",time:"7:15 AM",isNew:false},
  {id:103,icon:"✨",text:"Kalyan Fancy Store near Home — yesterday",time:"Yesterday",isNew:false},
];

function dist2D(ax,ay,bx,by){ return Math.sqrt((ax-bx)**2+(ay-by)**2); }

/* ─── SVG Icons (Lucide-style, inline) ─────────────────── */
function IconFilter({ size=16, color="currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
    </svg>
  );
}
function IconChevronDown({ size=14, color="currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  );
}
function IconBell({ size=18, color="currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  );
}
function IconSearch({ size=15, color="currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}
function IconCheck({ size=14, color="currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}
function IconX({ size=13, color="currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}

/* ─── Toast ─────────────────────────────────────────────── */
function Toast({ message, show, onClose }) {
  return (
    <div className={`toast${show?" show":""}`}>
      <span style={{fontSize:20,flexShrink:0}}>📍</span>
      <div style={{flex:1}}>
        <div style={{fontWeight:700,fontSize:13,lineHeight:1.3}}>{message}</div>
        <div style={{fontSize:11,color:"rgba(255,255,255,.55)",marginTop:2}}>Just now · Tap to view</div>
      </div>
      <button className="toast-close" onClick={onClose}><IconX size={11} color="white"/></button>
    </div>
  );
}

/* ─── Notif Panel ────────────────────────────────────────── */
function NotifPanel({ notifs, t, onClose, onClear }) {
  return (
    <div className="notif-panel">
      <div className="notif-backdrop" onClick={onClose}/>
      <div className="notif-drawer">
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <span style={{fontWeight:700,fontSize:16,color:"#F1F5F9"}}>{t.notifications}</span>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {notifs.length>0 &&
              <button onClick={onClear} style={{border:"none",background:"none",color:"#38BDF8",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{t.clearAll}</button>}
            <button onClick={onClose} style={{border:"none",background:"#1E293B",color:"#94A3B8",borderRadius:"50%",width:28,height:28,cursor:"pointer",fontSize:13,fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <IconX color="#94A3B8"/>
            </button>
          </div>
        </div>
        {notifs.length===0
          ? <div style={{textAlign:"center",padding:"28px 0",color:"#475569",fontSize:14}}>{t.noNotifs}</div>
          : notifs.map(n=>(
            <div key={n.id} className="notif-item">
              <div style={{fontSize:22,lineHeight:1,flexShrink:0}}>{n.icon}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:500,color:"#CBD5E1",lineHeight:1.4}}>{n.text}</div>
                <div style={{fontSize:11,color:"#475569",marginTop:3}}>{n.time}</div>
              </div>
              <div className={`notif-dot${n.isNew?"":" old"}`}/>
            </div>
          ))}
      </div>
    </div>
  );
}

/* ─── Category Overlay (Framer Motion pop-in) ───────────── */
function CategoryOverlay({ open, onClose, catList, catIdx, onSelect, lang }) {
  /* Map translated label → canonical key index */
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* backdrop */}
          <motion.div
            key="cat-backdrop"
            initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            transition={{duration:.18}}
            onClick={onClose}
            style={{position:"absolute",inset:0,zIndex:60,background:"rgba(0,0,0,.55)"}}
          />
          {/* panel */}
          <motion.div
            key="cat-panel"
            initial={{opacity:0, scale:.88, y:-18}}
            animate={{opacity:1, scale:1,   y:0}}
            exit={{opacity:0,   scale:.88, y:-18}}
            transition={{type:"spring", stiffness:380, damping:28}}
            style={{
              position:"absolute", top:108, left:14, right:14, zIndex:61,
              background:"#0F172A",
              border:"1px solid #1E293B",
              borderRadius:22,
              padding:"14px 12px",
              boxShadow:"0 24px 64px rgba(0,0,0,.7)",
              transformOrigin:"top right",
            }}
          >
            {/* header */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10,paddingLeft:4,paddingRight:4}}>
              <span style={{fontSize:13,fontWeight:700,color:"#94A3B8",letterSpacing:"0.06em",textTransform:"uppercase"}}>
                {lang==="hi"?"श्रेणियाँ":lang==="te"?"వర్గాలు":"Categories"}
              </span>
              <button onClick={onClose} style={{border:"none",background:"#1E293B",borderRadius:"50%",width:26,height:26,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <IconX color="#64748B" size={12}/>
              </button>
            </div>

            {catList.map((label, i) => {
              const key  = CATS_KEY[i];
              const isAct= i===catIdx;
              return (
                <motion.div
                  key={key}
                  className={`cat-item${isAct?" active":""}`}
                  whileHover={{x:3}}
                  whileTap={{scale:.97}}
                  onClick={()=>{ onSelect(i); onClose(); }}
                >
                  {/* icon badge */}
                  <div style={{
                    width:38, height:38, borderRadius:12, flexShrink:0,
                    background: isAct ? CAT_GRAD[key]||CAT_GRAD.All : "#1E293B",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:18, transition:"background .2s",
                  }}>
                    {CAT_ICON[key]}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:600,color: isAct?"#F1F5F9":"#CBD5E1"}}>{label}</div>
                    {key!=="All" && (
                      <div style={{fontSize:11,color:"#475569",marginTop:1}}>
                        {VENDORS.filter(v=>v.cat===key).length} vendors nearby
                      </div>
                    )}
                  </div>
                  {isAct && (
                    <div style={{width:22,height:22,borderRadius:"50%",background:"#38BDF8",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <IconCheck color="#0F172A" size={12}/>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── Map ────────────────────────────────────────────────── */
function VendorMap({ vendors, selected, onSelect, intercept, lang, t, favIds, viewOffset }) {
  const selV = vendors.find(v=>v.id===selected);
  const tx   = viewOffset ? -viewOffset.dx*0.3 : 0;
  const ty   = viewOffset ? -viewOffset.dy*0.3 : 0;

  return (
    <svg viewBox="0 0 560 430" width="100%" height="100%" style={{display:"block"}}>
      <g style={{transition:"transform .55s cubic-bezier(.32,.72,0,1)"}} transform={`translate(${tx},${ty})`}>
        <rect x="-200" y="-200" width="960" height="830" fill="#E8EFF5"/>
        {/* Roads H */}
        <rect x="0"   y="116" width="560" height="26" fill="#C8D4DD"/>
        <rect x="0"   y="276" width="560" height="26" fill="#C8D4DD"/>
        {/* Roads V */}
        <rect x="123" y="0"   width="26" height="430" fill="#C8D4DD"/>
        <rect x="313" y="0"   width="26" height="430" fill="#C8D4DD"/>
        <rect x="473" y="0"   width="26" height="430" fill="#C8D4DD"/>
        {/* Dashes H */}
        <line x1="0" y1="129" x2="560" y2="129" stroke="white" strokeWidth="1.5" strokeDasharray="18 12" opacity=".7"/>
        <line x1="0" y1="289" x2="560" y2="289" stroke="white" strokeWidth="1.5" strokeDasharray="18 12" opacity=".7"/>
        {/* Dashes V */}
        <line x1="136" y1="0" x2="136" y2="430" stroke="white" strokeWidth="1.5" strokeDasharray="18 12" opacity=".7"/>
        <line x1="326" y1="0" x2="326" y2="430" stroke="white" strokeWidth="1.5" strokeDasharray="18 12" opacity=".7"/>
        <line x1="486" y1="0" x2="486" y2="430" stroke="white" strokeWidth="1.5" strokeDasharray="18 12" opacity=".7"/>
        {/* Blocks */}
        {[[0,0,123,116],[149,0,164,116],[339,0,134,116],[499,0,61,116],
          [0,142,123,134],[149,142,164,134],[339,142,134,134],[499,142,61,134],
          [0,302,123,128],[149,302,164,128],[339,302,134,128],[499,302,61,128],
        ].map(([x,y,w,h],i)=><rect key={i} x={x} y={y} width={w} height={h} fill="#EEF3F8" rx="3"/>)}
        {/* Buildings */}
        {[[8,8,42,40],[58,8,30,50],[96,8,18,27],[8,60,26,30],[42,54,26,34],[86,50,22,38],
          [158,8,50,36],[220,12,56,26],[158,60,42,32],[216,54,50,36],[282,62,16,30],
          [348,8,56,36],[416,10,26,44],[348,60,50,36],[412,54,44,34],[500,8,42,48],[500,65,34,36],
          [8,158,50,50],[66,154,40,56],[8,226,56,36],[80,220,26,46],
          [158,160,54,42],[224,154,52,52],[292,160,20,34],
          [348,160,56,50],[416,156,36,48],[348,224,50,32],[410,220,42,38],[500,154,42,42],[500,208,34,38],
          [8,315,50,46],[70,318,34,40],[8,370,48,44],[68,366,40,40],
          [158,315,56,36],[230,312,46,50],[296,320,16,34],
          [348,315,56,36],[416,318,32,44],[348,368,54,38],[414,362,38,38],[500,315,42,38],[500,362,34,40],
        ].map(([x,y,w,h],i)=><rect key={i} x={x} y={y} width={w} height={h} fill="#DCE6EE" rx="2"/>)}
        {/* Trees */}
        {[[141,70],[141,238],[141,385],[330,70],[330,385],[491,238]].map(([x,y],i)=>(
          <g key={i}>
            <circle cx={x} cy={y} r="9" fill="#86EFAC" opacity=".75"/>
            <circle cx={x-4} cy={y+4} r="5.5" fill="#4ADE80" opacity=".55"/>
          </g>
        ))}
        {/* HOME */}
        <g transform={`translate(${HOME_POS.x},${HOME_POS.y})`}>
          <circle r="24" fill="rgba(56,189,248,.18)" stroke="#38BDF8" strokeWidth="2" className="home-pulse"/>
          <circle r="16" fill="#0EA5E9"/>
          <polygon points="0,-9 10,1 7,1 7,9 -7,9 -7,1 -10,1" fill="white"/>
          <rect x="-3.5" y="2" width="7" height="7" fill="#0EA5E9" rx="1"/>
        </g>
        <text x={HOME_POS.x} y={HOME_POS.y+36} textAnchor="middle"
          fill="#38BDF8" fontSize="8" fontWeight="700" fontFamily="Inter,system-ui,sans-serif">{t.home}</text>
        {/* YOU */}
        <circle cx="275" cy="208" r="20" fill="#818CF8" opacity=".12"/>
        <circle cx="275" cy="208" r="13" fill="#818CF8" opacity=".2"/>
        <circle cx="275" cy="208" r="8"  fill="#6366F1"/>
        <circle cx="275" cy="208" r="3.5" fill="white"/>
        <text x="283" y="190" fill="#818CF8" fontSize="10" fontWeight="700" fontFamily="Inter,system-ui,sans-serif">You</text>
        {/* Intercept */}
        {intercept && selV && (()=>{
          const pts = selV.path.map(p=>`${p.x},${p.y}`).join(" ");
          const ip  = selV.intercept;
          return (
            <g>
              <polyline points={pts} fill="none" stroke="#A78BFA" strokeWidth="3.5"
                strokeLinecap="round" className="dash-path" opacity=".9"/>
              <circle cx={ip.x} cy={ip.y} r="16" fill="rgba(167,139,250,.22)" stroke="#A78BFA" strokeWidth="2.5"/>
              <text x={ip.x} y={ip.y+5} textAnchor="middle" fill="#A78BFA"
                fontSize="13" fontWeight="700" fontFamily="Inter,system-ui,sans-serif">✕</text>
              <rect x={ip.x-52} y={ip.y-44} width="104" height="23" rx="12" fill="#7C3AED"/>
              <text x={ip.x} y={ip.y-28} textAnchor="middle" fill="white"
                fontSize="9.5" fontWeight="600" fontFamily="Inter,system-ui,sans-serif">
                {t.meetAt} {ip.mins} {t.mins} ({ip.dist}{t.meters})
              </text>
            </g>
          );
        })()}
        {/* Markers */}
        {vendors.map(v=>{
          const col  = STATUS_COL[v.status];
          const isSel= v.id===selected;
          const isFav= favIds.has(v.id);
          const nm   = lang==="hi"?v.nameHi:lang==="te"?v.nameTe:v.name;
          const short= nm.split(" ").slice(0,2).join(" ");
          return (
            <g key={v.id} style={{cursor:"pointer"}} onClick={()=>onSelect(v.id)}>
              {v.status==="live"  && <circle cx={v.x} cy={v.y} r="10" fill={col} opacity=".4" className="pulse-green"/>}
              {v.status==="busy"  && <circle cx={v.x} cy={v.y} r="10" fill={col} opacity=".35" className="pulse-orange"/>}
              {isSel              && <circle cx={v.x} cy={v.y} r="29" fill={col} opacity=".13"/>}
              {isFav && !isSel    && <circle cx={v.x} cy={v.y} r="22" fill="none" stroke="#F59E0B" strokeWidth="2" strokeDasharray="4 3"/>}
              <circle cx={v.x} cy={v.y} r="18" fill={col} stroke="white" strokeWidth="2.5"/>
              <text x={v.x} y={v.y+6} textAnchor="middle" fontSize="12"
                fontFamily="Apple Color Emoji,Segoe UI Emoji,sans-serif">{CAT_ICON[v.cat]}</text>
              {v.happyHour &&
                <text x={v.x+11} y={v.y-11} fontSize="12" className="flame"
                  fontFamily="Apple Color Emoji,Segoe UI Emoji,sans-serif">🔥</text>}
              <rect x={v.x-31} y={v.y+22} width="62" height="16" rx="5"
                fill="white" opacity=".92" stroke={col} strokeWidth="1"/>
              <text x={v.x} y={v.y+33} textAnchor="middle"
                fill={v.status==="live"?"#166534":v.status==="busy"?"#92400E":"#475569"}
                fontSize="7.5" fontWeight="600" fontFamily="Inter,system-ui,sans-serif">{short}</text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}

/* ─── Bottom Sheet ───────────────────────────────────────── */
function BottomSheet({ vendor, lang, t, onClose, intercept, setIntercept, favIds, toggleFav }) {
  if(!vendor) return null;
  const name = lang==="hi"?vendor.nameHi:lang==="te"?vendor.nameTe:vendor.name;
  const sCls = {live:"s-live",busy:"s-busy",closing:"s-closing"};
  const sLbl = {live:t.live,busy:t.busy,closing:t.closing};
  const isFav= favIds.has(vendor.id);
  return (
    <div className="sheet">
      <div className="handle" onClick={onClose}/>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:11}}>
        <div style={{display:"flex",alignItems:"center",gap:7}}>
          <span className={`sc ${sCls[vendor.status]}`}>
            {vendor.status==="live"?"● ":vendor.status==="busy"?"◉ ":"○ "}{sLbl[vendor.status]}
          </span>
          {vendor.happyHour &&
            <span className="sc" style={{background:"rgba(251,146,60,.13)",color:"#FB923C",border:"1px solid rgba(251,146,60,.22)"}}>
              <span className="flame" style={{marginRight:3}}>🔥</span>{t.happyHour}
            </span>}
        </div>
        <button onClick={onClose} style={{border:"none",background:"#1E293B",borderRadius:"50%",width:28,height:28,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"inherit"}}>
          <IconX color="#64748B"/>
        </button>
      </div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:5}}>
        <div style={{display:"flex",alignItems:"center",gap:5}}>
          <h2 style={{fontSize:19,fontWeight:700,color:"#F1F5F9"}}>{name}</h2>
          <button className="heart-btn" onClick={()=>toggleFav(vendor.id)}>{isFav?"❤️":"🤍"}</button>
        </div>
        <span style={{fontSize:13,color:"#64748B",fontWeight:500,flexShrink:0,marginLeft:6}}>
          {vendor.dist}{t.meters} {t.distance}
        </span>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:14}}>
        <span style={{fontSize:13}}>🕐</span>
        <span style={{fontSize:12,color:"#64748B",fontWeight:500}}>{t.availAt}: {vendor.time}</span>
      </div>
      <div style={{marginBottom:15}}>
        <div style={{fontSize:11,fontWeight:600,color:"#475569",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:8}}>{t.items}</div>
        <div>
          {vendor.items.map((item,i)=>(
            <span key={i} className={`ip ${vendor.happyHour?"ip-f":"ip-n"}`}>
              {item.n} — {item.op
                ?<><span className="strikethrough">₹{item.op}</span><strong>₹{item.p}</strong></>
                :<strong>₹{item.p}</strong>}
            </span>
          ))}
        </div>
      </div>
      <div style={{display:"flex",gap:8}}>
        <button className={`intercept-btn${intercept?" on":""}`} onClick={()=>setIntercept(v=>!v)}>
          <span>{intercept?"🟣":"🔵"}</span>
          {intercept?t.interceptOn:t.intercept}
        </button>
        <button className="notify-btn">{t.notify}</button>
      </div>
      {intercept && (
        <div className="intercept-info">
          <span>🚀</span>
          {t.meetAt} <strong style={{margin:"0 3px"}}>{vendor.intercept.mins} {t.mins}</strong>
          &nbsp;•&nbsp;{vendor.intercept.dist}{t.meters} {t.distance}
        </div>
      )}
    </div>
  );
}

/* ─── App ────────────────────────────────────────────────── */
function App() {
  const [lang,       setLang]      = useState("en");
  const [catIdx,     setCatIdx]    = useState(0);       /* index into CATS_KEY */
  const [catOpen,    setCatOpen]   = useState(false);
  const [selectedId, setSelected]  = useState(null);
  const [intercept,  setIntercept] = useState(false);
  const [favIds,     setFavIds]    = useState(new Set(DEFAULT_FAVS));
  const [searchText, setSearch]    = useState("");
  const [searchFocus,setSFocus]    = useState(false);
  const [showNotifs, setShowNotifs]= useState(false);
  const [notifs,     setNotifs]    = useState(INITIAL_NOTIFS);
  const [toast,      setToast]     = useState({show:false,message:""});
  const [viewOffset, setViewOff]   = useState(null);
  const toastTimer  = useRef(null);
  const alertedIds  = useRef(new Set());
  const t           = T[lang];

  /* proximity alerts */
  useEffect(()=>{
    VENDORS.forEach(v=>{
      if(dist2D(v.x,v.y,HOME_POS.x,HOME_POS.y)<135 && !alertedIds.current.has(v.id)){
        alertedIds.current.add(v.id);
        const nm = lang==="hi"?v.nameHi:lang==="te"?v.nameTe:v.name;
        fireToast(`${nm} — ${t.homeAlert}`, v);
      }
    });
  // eslint-disable-next-line
  },[lang]);

  function fireToast(msg, vendor){
    clearTimeout(toastTimer.current);
    setToast({show:true,message:msg});
    setNotifs(prev=>[{
      id:Date.now(), icon:CAT_ICON[vendor.cat]||"📍",
      text:`${vendor.name} is near your Home!`,
      time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),
      isNew:true,
    },...prev]);
    toastTimer.current = setTimeout(()=>setToast(s=>({...s,show:false})),4800);
  }

  const toggleFav = id => setFavIds(prev=>{ const n=new Set(prev); n.has(id)?n.delete(id):n.add(id); return n; });

  const handleFavTap = id => {
    const v = VENDORS.find(vv=>vv.id===id); if(!v) return;
    setSelected(id); setIntercept(false); setCatIdx(0);
    setViewOff({dx:v.x-275,dy:v.y-208});
    setTimeout(()=>setViewOff(null),900);
  };

  const handleMarker = id => {
    if(id===selectedId){setSelected(null);setIntercept(false);}
    else{setSelected(id);setIntercept(false);}
  };

  /* filter vendors */
  const activeCat   = CATS_KEY[catIdx];
  const byCategory  = activeCat==="All" ? VENDORS : VENDORS.filter(v=>v.cat===activeCat);
  const searchRes   = searchText.trim().length>0
    ? VENDORS.filter(v=>{
        const q = searchText.toLowerCase();
        return `${v.name} ${v.nameHi} ${v.nameTe}`.toLowerCase().includes(q)
          || v.items.map(i=>i.n).join(" ").toLowerCase().includes(q)
          || v.cat.toLowerCase().includes(q);
      })
    : [];
  const displayedVendors = searchText.trim().length>0 ? searchRes : byCategory;
  const selected    = VENDORS.find(v=>v.id===selectedId)||null;
  const liveCount   = displayedVendors.filter(v=>v.status==="live").length;
  const newNotifCnt = notifs.filter(n=>n.isNew).length;

  /* header height: 36(notch)+10(top-pad)+32(brand)+10+44(search)+10+fav(~68)+8 ≈ 218 */
  const headerH = favIds.size>0 ? 222 : 154;

  return (
    <div style={{width:"100%",height:"100%",position:"relative",background:"#1E293B",overflow:"hidden"}}>

      <Toast message={toast.message} show={toast.show}
        onClose={()=>{clearTimeout(toastTimer.current);setToast(s=>({...s,show:false}));}}/>

      {showNotifs && <NotifPanel notifs={notifs} t={t} onClose={()=>setShowNotifs(false)} onClear={()=>setNotifs([])}/>}

      {/* ── Category Overlay ── */}
      <CategoryOverlay
        open={catOpen}
        onClose={()=>setCatOpen(false)}
        catList={t.catList}
        catIdx={catIdx}
        onSelect={i=>{ setCatIdx(i); setSelected(null); setIntercept(false); }}
        lang={lang}
      />

      {/* ══ HEADER ══ */}
      <div style={{
        position:"absolute",top:0,left:0,right:0,zIndex:30,
        background:"#0F172A",
        borderBottom:"1px solid rgba(255,255,255,.06)",
        padding:"36px 14px 0",
      }}>
        {/* Brand row */}
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
          <div style={{width:32,height:32,borderRadius:10,background:"linear-gradient(135deg,#38BDF8,#6366F1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>
            📡
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:17,fontWeight:800,color:"#F1F5F9",letterSpacing:"-0.3px"}}>{t.appName}</div>
            <div style={{fontSize:10,color:"#475569",fontWeight:500}}>{t.tagline}</div>
          </div>
          {/* Bell */}
          <button onClick={()=>setShowNotifs(true)} style={{
            position:"relative",border:"none",background:"#1E293B",
            borderRadius:"50%",width:36,height:36,cursor:"pointer",
            display:"flex",alignItems:"center",justifyContent:"center",
            boxShadow:"inset 0 0 0 1px #334155",
          }}>
            <IconBell color="#94A3B8"/>
            {newNotifCnt>0 && <span style={{position:"absolute",top:6,right:6,width:8,height:8,background:"#EF4444",borderRadius:"50%",border:"1.5px solid #0F172A"}}/>}
          </button>
          {/* Lang */}
          <div style={{display:"flex",gap:2,background:"#1E293B",borderRadius:20,padding:"2px",border:"1px solid #334155"}}>
            {["en","hi","te"].map(l=>(
              <button key={l} className={`lang-btn${lang===l?" active":""}`} onClick={()=>setLang(l)}>
                {l==="en"?"A":l==="hi"?"अ":"అ"}
              </button>
            ))}
          </div>
        </div>

        {/* ── SPLIT SEARCH BAR ── */}
        <div style={{display:"flex",gap:8,marginBottom:10,position:"relative"}}>
          {/* Search input — 75% */}
          <div style={{
            flex:3, display:"flex", alignItems:"center", gap:8,
            background:"#1E293B", borderRadius:14, padding:"10px 13px",
            border:`1.5px solid ${searchFocus?"#38BDF8":"#1E293B"}`,
            transition:"border-color .18s",
          }}
            onClick={()=>document.getElementById("sc-search").focus()}
          >
            <IconSearch color="#475569" size={15}/>
            <input
              id="sc-search"
              className="search-input"
              placeholder={t.searchPlaceholder}
              value={searchText}
              onChange={e=>setSearch(e.target.value)}
              onFocus={()=>setSFocus(true)}
              onBlur={()=>setTimeout(()=>setSFocus(false),160)}
            />
            {searchText && (
              <button onClick={()=>setSearch("")} style={{border:"none",background:"#334155",borderRadius:"50%",width:18,height:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <IconX color="#94A3B8" size={11}/>
              </button>
            )}
          </div>

          {/* Categories button — 25% */}
          <button
            onClick={()=>setCatOpen(o=>!o)}
            style={{
              flex:1, display:"flex", flexDirection:"column",
              alignItems:"center", justifyContent:"center", gap:3,
              background: catOpen ? "rgba(56,189,248,.12)" : "#1E293B",
              border:`1.5px solid ${catOpen?"#38BDF8":"#334155"}`,
              borderRadius:14, padding:"8px 6px",
              cursor:"pointer", transition:"all .18s", fontFamily:"inherit",
              minWidth:72,
            }}
          >
            <div style={{display:"flex",alignItems:"center",gap:4}}>
              <IconFilter size={14} color={catOpen?"#38BDF8":"#64748B"}/>
              <IconChevronDown size={12} color={catOpen?"#38BDF8":"#64748B"}/>
            </div>
            <span style={{
              fontSize:10, fontWeight:600, lineHeight:1,
              color: catOpen?"#38BDF8":"#64748B",
              whiteSpace:"nowrap",
            }}>
              {catIdx===0 ? (lang==="hi"?"श्रेणियाँ":lang==="te"?"వర్గాలు":t.categories)
                          : t.catList[catIdx]}
            </span>
            {catIdx!==0 && (
              <div style={{width:5,height:5,borderRadius:"50%",background:"#38BDF8"}}/>
            )}
          </button>
        </div>

        {/* Search dropdown */}
        {searchFocus && searchText.trim().length>0 && (
          <div style={{
            position:"absolute",left:14,right:14,top:130,
            background:"#0F172A",borderRadius:"0 0 18px 18px",
            boxShadow:"0 16px 40px rgba(0,0,0,.5)",zIndex:50,overflow:"hidden",
            border:"1px solid #1E293B",borderTop:"none",
          }}>
            {searchRes.length>0 ? searchRes.map(v=>{
              const nm = lang==="hi"?v.nameHi:lang==="te"?v.nameTe:v.name;
              return (
                <div key={v.id} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",cursor:"pointer",transition:"background .12s"}}
                  onMouseDown={()=>{setSelected(v.id);setSearch("");setCatIdx(0);}}>
                  <div style={{width:34,height:34,borderRadius:"50%",background:"#1E293B",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0,border:"1px solid #334155"}}>
                    {CAT_ICON[v.cat]}
                  </div>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:"#E2E8F0"}}>{nm}</div>
                    <div style={{fontSize:11,color:"#64748B"}}>{v.dist}{t.meters} {t.distance} · {v.cat}</div>
                  </div>
                  <span style={{marginLeft:"auto",fontSize:10,fontWeight:600,padding:"3px 8px",borderRadius:10,
                    background:v.status==="live"?"rgba(34,197,94,.15)":v.status==="busy"?"rgba(245,158,11,.15)":"rgba(100,116,139,.15)",
                    color:v.status==="live"?"#4ADE80":v.status==="busy"?"#FCD34D":"#94A3B8",
                    border:`1px solid ${v.status==="live"?"rgba(74,222,128,.2)":v.status==="busy"?"rgba(252,211,77,.2)":"rgba(148,163,184,.2)"}`,
                  }}>
                    {v.status==="live"?t.live:v.status==="busy"?t.busy:t.closing}
                  </span>
                </div>
              );
            }) : (
              <div style={{padding:"14px",textAlign:"center",color:"#475569",fontSize:13}}>No vendors found</div>
            )}
          </div>
        )}

        {/* ── Frequently Visited ── */}
        {favIds.size>0 && (
          <div style={{marginBottom:0}}>
            <div style={{fontSize:10,fontWeight:600,color:"#475569",letterSpacing:"0.07em",textTransform:"uppercase",paddingLeft:2,marginBottom:8}}>{t.favorites}</div>
            <div className="fav-scroll" style={{paddingLeft:2,paddingRight:2}}>
              {VENDORS.filter(v=>favIds.has(v.id)).map(v=>{
                const nm   = lang==="hi"?v.nameHi:lang==="te"?v.nameTe:v.name;
                const short= nm.split(" ")[0];
                const isAct= selectedId===v.id;
                return (
                  <div key={v.id} className="fav-chip" onClick={()=>handleFavTap(v.id)}>
                    <div className={`fav-avatar${isAct?" active":""}`}
                      style={{
                        boxShadow: isAct?`0 0 0 2.5px #38BDF8,0 0 12px ${FAV_GLOW[v.cat]||"rgba(56,189,248,.3)"}`:
                                   `0 0 8px ${FAV_GLOW[v.cat]||"transparent"}`,
                        borderColor:isAct?"#38BDF8":"transparent",
                      }}>
                      <span style={{fontSize:20}}>{CAT_ICON[v.cat]}</span>
                    </div>
                    <span className="fav-label">{short}</span>
                    <span style={{width:6,height:6,borderRadius:"50%",background:STATUS_COL[v.status],display:"block",boxShadow:`0 0 4px ${STATUS_COL[v.status]}`}}/>
                  </div>
                );
              })}
              <div className="fav-chip" style={{opacity:.35}}>
                <div className="fav-avatar" style={{border:"1.5px dashed #334155"}}>
                  <span style={{fontSize:18,color:"#475569"}}>+</span>
                </div>
                <span className="fav-label" style={{color:"#475569"}}>More</span>
              </div>
            </div>
          </div>
        )}

        {/* Active category pill */}
        {catIdx!==0 && (
          <div style={{paddingBottom:8,paddingTop:4,display:"flex",alignItems:"center",gap:6}}>
            <div style={{
              display:"inline-flex",alignItems:"center",gap:6,
              background:"rgba(56,189,248,.1)",border:"1px solid rgba(56,189,248,.22)",
              borderRadius:20,padding:"4px 10px 4px 8px",
            }}>
              <span style={{fontSize:13}}>{CAT_ICON[CATS_KEY[catIdx]]}</span>
              <span style={{fontSize:12,fontWeight:600,color:"#38BDF8"}}>{t.catList[catIdx]}</span>
              <button onClick={()=>setCatIdx(0)} style={{border:"none",background:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",padding:0,marginLeft:2}}>
                <IconX color="#38BDF8" size={11}/>
              </button>
            </div>
            <span style={{fontSize:11,color:"#475569"}}>{displayedVendors.length} vendor{displayedVendors.length!==1?"s":""}</span>
          </div>
        )}
      </div>

      {/* ══ MAP ══ */}
      <div style={{position:"absolute",top:headerH,left:0,right:0,bottom:0}}>
        <VendorMap
          vendors={displayedVendors}
          selected={selectedId}
          onSelect={handleMarker}
          intercept={intercept}
          lang={lang}
          t={t}
          favIds={favIds}
          viewOffset={viewOffset}
        />
      </div>

      {/* Live badge */}
      <div style={{
        position:"absolute",top:headerH+8,right:14,zIndex:25,
        background:"#0F172A",border:"1px solid #1E293B",
        borderRadius:20,padding:"5px 12px",fontSize:12,fontWeight:600,
        color:"#CBD5E1",boxShadow:"0 4px 14px rgba(0,0,0,.4)",
      }}>
        <span style={{color:"#22C55E",marginRight:4,textShadow:"0 0 7px #22C55E"}}>●</span>
        {liveCount} {t.live}
      </div>

      {/* Legend */}
      <div className="legend-box" style={{bottom:selected?248:16}}>
        {[["#22C55E",t.live,"0 0 6px #22C55E"],["#F59E0B",t.busy,"0 0 6px #F59E0B"],["#64748B",t.closing,"none"]].map(([c,l,sh])=>(
          <div key={l} style={{display:"flex",alignItems:"center"}}>
            <span className="legend-dot" style={{background:c,boxShadow:sh}}/>
            <span style={{fontSize:11,color:"#94A3B8",fontWeight:500}}>{l}</span>
          </div>
        ))}
        <div style={{display:"flex",alignItems:"center",marginTop:2,paddingTop:4,borderTop:"1px solid #1E293B"}}>
          <div style={{width:9,height:9,flexShrink:0,border:"1.5px dashed #F59E0B",borderRadius:"50%",marginRight:6}}/>
          <span style={{fontSize:11,color:"#94A3B8",fontWeight:500}}>Favourite</span>
        </div>
      </div>

      {/* Bottom Sheet */}
      <BottomSheet
        vendor={selected}
        lang={lang}
        t={t}
        onClose={()=>{setSelected(null);setIntercept(false);}}
        intercept={intercept}
        setIntercept={setIntercept}
        favIds={favIds}
        toggleFav={toggleFav}
      />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("app-shell")).render(<App/>);