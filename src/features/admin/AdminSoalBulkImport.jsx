// src/features/admin/AdminSoalBulkImport.jsx
import { useState, useRef, useEffect, useMemo } from "react";
import {
  Search, X, ChevronRight, Upload, Trash2, ChevronDown, ChevronUp,
  CheckCircle2, AlertCircle, Loader2, Plus,
} from "lucide-react";
import api from "../../lib/api";

// ── helpers ──────────────────────────────────────────────────────────────────

const VALID_TIPE = [
  "pilihan_ganda","isian_singkat","isian_numerik",
  "checklist","multiple_choice_table","menjodohkan","isian_multi",
];

const DIFFICULTY_MAP = { easy:1, medium:2, hard:3, mudah:1, sedang:2, sulit:3, susah:3 };

function parseDiff(val) {
  if (val === undefined || val === null) return null;
  if (typeof val === "number" && [1,2,3].includes(val)) return val;
  return DIFFICULTY_MAP[String(val).toLowerCase()] ?? null;
}

function parseTipe(val) {
  if (!val) return null;
  const v = String(val).toLowerCase().replace(/[\s-]/g,"_");
  return VALID_TIPE.includes(v) ? v : null;
}

function parseJsonArray(raw) {
  let text = raw.trim()
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi,"")
    .replace(/```json/gi,"").replace(/```/g,"").trim();
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error("Tidak ditemukan JSON array dalam teks");
  return JSON.parse(match[0]);
}

function normalizeAnswer(s) {
  if (typeof s.answer === "string") {
    if (["pilihan_ganda","checklist"].includes(s.tipe)) return [s.answer];
    return s.answer;
  }
  return s.answer;
}

// ── SubtopikPicker ────────────────────────────────────────────────────────────

function SubtopikPicker({ struktur, subtopikId, onChange }) {
  const [query, setQuery]   = useState("");
  const [open, setOpen]     = useState(false);
  const inputRef = useRef(null);
  const dropRef  = useRef(null);

  const topikMap   = useMemo(() => Object.fromEntries(struktur.topik.map(t=>[t.id,t])),       [struktur.topik]);
  const mapelMap   = useMemo(() => Object.fromEntries(struktur.mapel.map(m=>[m.id,m])),       [struktur.mapel]);
  const subjMap    = useMemo(() => Object.fromEntries(struktur.subjenjang.map(s=>[s.id,s])), [struktur.subjenjang]);
  const jenjangMap = useMemo(() => Object.fromEntries(struktur.jenjang.map(j=>[j.id,j])),   [struktur.jenjang]);

  const enriched = useMemo(() => struktur.subtopik.map(st => {
    const topik   = topikMap[st.topik_id]        || {};
    const mapel   = mapelMap[topik.mapel_id]     || {};
    const subj    = subjMap[mapel.subjenjang_id] || {};
    const jenjang = jenjangMap[subj.jenjang_id]  || {};
    return { ...st, topik, mapel, subj, jenjang,
      fullText: [jenjang.nama,subj.nama,mapel.nama,topik.nama,st.nama].filter(Boolean).join(" ").toLowerCase() };
  }), [struktur.subtopik, topikMap, mapelMap, subjMap, jenjangMap]);

  const results = useMemo(() => {
    if (!query.trim()) return enriched.slice(0,50);
    const q = query.toLowerCase();
    return enriched.filter(s=>s.fullText.includes(q)).slice(0,60);
  }, [enriched, query]);

  const selected = useMemo(() => enriched.find(s=>s.id==subtopikId)||null, [enriched, subtopikId]);

  useEffect(() => {
    const h = e => {
      if (dropRef.current&&!dropRef.current.contains(e.target)&&inputRef.current&&!inputRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown",h);
    return ()=>document.removeEventListener("mousedown",h);
  },[]);

  const handleSelect = st => { onChange(st.id); setQuery(""); setOpen(false); };
  const handleClear  = () => { onChange(""); setQuery(""); setTimeout(()=>inputRef.current?.focus(),50); };

  const Crumb = ({text,dim}) => (
    <span style={{fontSize:"11px",color:dim?"#b4b2a9":"#6b6860",fontWeight:dim?400:500}}>{text}</span>
  );
  const Breadcrumb = ({st,large}) => (
    <div style={{display:"flex",alignItems:"center",gap:"4px",flexWrap:"wrap"}}>
      {st.jenjang?.nama&&<><Crumb text={st.jenjang.nama} dim/><ChevronRight size={10} color="#d4d0c8"/></>}
      {st.subj?.nama&&<><Crumb text={st.subj.nama} dim/><ChevronRight size={10} color="#d4d0c8"/></>}
      {st.mapel?.nama&&<><Crumb text={st.mapel.nama} dim/><ChevronRight size={10} color="#d4d0c8"/></>}
      {st.topik?.nama&&<><Crumb text={st.topik.nama} dim/><ChevronRight size={10} color="#d4d0c8"/></>}
      <span style={{fontSize:large?"14px":"12px",fontWeight:"700",color:"#0f0e17"}}>{st.nama}</span>
    </div>
  );

  return (
    <div>
      <label style={{fontSize:"13px",fontWeight:"600",color:"#0f0e17",display:"block",marginBottom:"8px"}}>
        Subtopik Tujuan <span style={{color:"#e84c2b"}}>*</span>
      </label>
      <div style={{position:"relative"}}>
        <div style={{display:"flex",alignItems:"center",gap:"10px",padding:"10px 14px",borderRadius:"10px",border:`1.5px solid ${open?"#e84c2b":"#e2ddd5"}`,background:"white",transition:"border-color .15s"}}>
          <Search size={16} color={open?"#e84c2b":"#b4b2a9"} style={{flexShrink:0}}/>
          <input ref={inputRef} value={query} onChange={e=>{setQuery(e.target.value);setOpen(true);}}
            onFocus={()=>setOpen(true)} placeholder="Cari subtopik..."
            style={{flex:1,border:"none",outline:"none",fontSize:"14px",fontFamily:"inherit",color:"#0f0e17",background:"transparent",minWidth:0}}/>
          {query&&<button type="button" onClick={()=>{setQuery("");setOpen(true);inputRef.current?.focus();}}
            style={{background:"none",border:"none",cursor:"pointer",color:"#b4b2a9",display:"flex",padding:0}}><X size={15}/></button>}
        </div>

        {open&&(
          <div ref={dropRef} style={{position:"absolute",top:"calc(100% + 6px)",left:0,right:0,background:"white",border:"1.5px solid #e2ddd5",borderRadius:"12px",boxShadow:"0 8px 32px rgba(0,0,0,.12)",zIndex:200,maxHeight:"280px",overflowY:"auto"}}>
            {results.length===0
              ? <div style={{padding:"18px",fontSize:"13px",color:"#b4b2a9",textAlign:"center"}}>Tidak ditemukan "{query}"</div>
              : results.map(st=>(
                  <button key={st.id} type="button" onClick={()=>handleSelect(st)}
                    style={{display:"block",width:"100%",textAlign:"left",padding:"10px 14px",border:"none",background:st.id==subtopikId?"#fff3f0":"transparent",cursor:"pointer",borderBottom:"1px solid #f0ede6",fontFamily:"inherit"}}
                    onMouseEnter={e=>{if(st.id!=subtopikId)e.currentTarget.style.background="#faf9f6";}}
                    onMouseLeave={e=>{if(st.id!=subtopikId)e.currentTarget.style.background="transparent";}}>
                    <Breadcrumb st={st}/>
                  </button>
                ))
            }
          </div>
        )}
      </div>

      {selected&&(
        <div style={{marginTop:"10px",padding:"10px 14px",borderRadius:"10px",background:"#fff3f0",border:"1.5px solid #fca5a5",display:"flex",alignItems:"center",justifyContent:"space-between",gap:"12px"}}>
          <div style={{minWidth:0}}>
            <div style={{fontSize:"11px",fontWeight:"700",color:"#e84c2b",textTransform:"uppercase",letterSpacing:".05em",marginBottom:"3px"}}>Dipilih</div>
            <Breadcrumb st={selected} large/>
          </div>
          <button type="button" onClick={handleClear}
            style={{flexShrink:0,display:"flex",alignItems:"center",gap:"4px",padding:"5px 10px",borderRadius:"7px",border:"1px solid #fca5a5",background:"white",color:"#e84c2b",fontSize:"12px",fontWeight:"600",cursor:"pointer",fontFamily:"inherit"}}>
            <X size={12}/> Ganti
          </button>
        </div>
      )}
    </div>
  );
}

// ── SoalCard ─────────────────────────────────────────────────────────────────

const taStyle = {padding:"10px 12px",borderRadius:"8px",border:"1px solid #e2ddd5",fontSize:"13px",fontFamily:"inherit",lineHeight:"1.6",resize:"vertical",outline:"none",color:"#0f0e17"};
const inStyle = {flex:1,padding:"7px 10px",borderRadius:"8px",border:"1px solid #e2ddd5",fontSize:"13px",fontFamily:"inherit",outline:"none",color:"#0f0e17"};
const focusRed = e=>(e.target.style.borderColor="#e84c2b");
const blurGray = e=>(e.target.style.borderColor="#e2ddd5");

const DIFF_LABEL = {1:"Easy",2:"Medium",3:"Hard"};
const DIFF_COLOR = {1:"#1a8a6e",2:"#854F0B",3:"#e84c2b"};
const DIFF_BG    = {1:"#e4f5f0",2:"#faeeda",3:"#fff3f0"};

function Field({label,children}){
  return (
    <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
      <label style={{fontSize:"11px",fontWeight:"700",color:"#6b6860",textTransform:"uppercase",letterSpacing:".05em"}}>{label}</label>
      {children}
    </div>
  );
}

function DiffBadge({diff,onChange}){
  return (
    <div style={{display:"flex",gap:"4px"}}>
      {[1,2,3].map(v=>(
        <button key={v} type="button" onClick={()=>onChange(v)}
          style={{padding:"2px 10px",borderRadius:"99px",border:`1.5px solid ${diff===v?DIFF_COLOR[v]:"#e2ddd5"}`,background:diff===v?DIFF_BG[v]:"white",color:diff===v?DIFF_COLOR[v]:"#b4b2a9",fontSize:"11px",fontWeight:"600",cursor:"pointer",fontFamily:"inherit"}}>
          {DIFF_LABEL[v]}
        </button>
      ))}
    </div>
  );
}

function PGFields({soal,u}){
  const opts=soal.options||[];
  const ans=Array.isArray(soal.answer)?soal.answer[0]:soal.answer;
  const upOpt=(i,text)=>{const n=[...opts];n[i]={...n[i],text};u("options",n);};
  return(
    <Field label="Pilihan Jawaban">
      {opts.map((opt,i)=>{
        const lbl=opt.label||String.fromCharCode(65+i);
        const isAns=ans===lbl;
        return(
          <div key={i} style={{display:"flex",alignItems:"center",gap:"8px"}}>
            <span onClick={()=>u("answer",[lbl])} title="Tandai jawaban benar"
              style={{width:"28px",height:"28px",borderRadius:"6px",background:isAns?"#e84c2b":"#f2efe8",color:isAns?"white":"#6b6860",fontSize:"12px",fontWeight:"700",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:"pointer"}}>{lbl}</span>
            <input value={opt.text||""} onChange={e=>upOpt(i,e.target.value)} style={inStyle} onFocus={focusRed} onBlur={blurGray}/>
          </div>
        );
      })}
      <p style={{fontSize:"11px",color:"#b4b2a9",margin:0}}>Klik huruf untuk tandai jawaban benar.</p>
    </Field>
  );
}

function IsianFields({soal,u}){
  const ans=Array.isArray(soal.answer)?soal.answer[0]:soal.answer;
  return(
    <Field label="Kunci Jawaban">
      <input value={ans||""} onChange={e=>u("answer",e.target.value)} style={{...inStyle,flex:"none"}} onFocus={focusRed} onBlur={blurGray}/>
    </Field>
  );
}

function ChecklistFields({soal,u}){
  const opts=soal.options||[];
  const ans=Array.isArray(soal.answer)?soal.answer:[];
  const toggle=lbl=>{const n=ans.includes(lbl)?ans.filter(a=>a!==lbl):[...ans,lbl].sort();u("answer",n);};
  const upOpt=(i,text)=>{const n=[...opts];n[i]={...n[i],text};u("options",n);};
  return(
    <Field label="Pilihan (bisa lebih dari satu benar)">
      {opts.map((opt,i)=>{
        const lbl=opt.label||String.fromCharCode(65+i);
        const isAns=ans.includes(lbl);
        return(
          <div key={i} style={{display:"flex",alignItems:"center",gap:"8px"}}>
            <span onClick={()=>toggle(lbl)} style={{width:"28px",height:"28px",borderRadius:"6px",background:isAns?"#e84c2b":"#f2efe8",color:isAns?"white":"#6b6860",fontSize:"12px",fontWeight:"700",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:"pointer"}}>{lbl}</span>
            <input value={opt.text||""} onChange={e=>upOpt(i,e.target.value)} style={inStyle} onFocus={focusRed} onBlur={blurGray}/>
          </div>
        );
      })}
      <p style={{fontSize:"11px",color:"#b4b2a9",margin:0}}>Jawaban benar: <strong>{ans.join(", ")||"—"}</strong></p>
    </Field>
  );
}

function MCTFields({soal,u}){
  const rows=Array.isArray(soal.options)?soal.options:[];
  const ans=(typeof soal.answer==="object"&&!Array.isArray(soal.answer))?soal.answer:{};
  const cols=rows[0]?.cols||["Benar","Salah"];
  const upRow=(i,text)=>{const n=[...rows];n[i]={...n[i],text};u("options",n);};
  return(
    <Field label="Tabel Pernyataan">
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:"13px"}}>
          <thead><tr>
            <th style={{textAlign:"left",padding:"6px 8px",color:"#6b6860",fontWeight:"600"}}>Pernyataan</th>
            {cols.map(c=><th key={c} style={{padding:"6px 12px",color:"#6b6860",fontWeight:"600"}}>{c}</th>)}
          </tr></thead>
          <tbody>{rows.map((row,i)=>(
            <tr key={i} style={{borderTop:"1px solid #f0ede6"}}>
              <td style={{padding:"6px 8px"}}>
                <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
                  <span style={{color:"#b4b2a9",fontSize:"11px",fontWeight:"700",minWidth:"16px"}}>{row.label}</span>
                  <input value={row.text||""} onChange={e=>upRow(i,e.target.value)} style={{...inStyle,flex:1}} onFocus={focusRed} onBlur={blurGray}/>
                </div>
              </td>
              {cols.map(c=>(
                <td key={c} style={{padding:"6px 12px",textAlign:"center"}}>
                  <input type="radio" name={`mct-${soal._key}-${i}`} checked={ans[row.label]===c} onChange={()=>u("answer",{...ans,[row.label]:c})} style={{accentColor:"#e84c2b",width:"16px",height:"16px",cursor:"pointer"}}/>
                </td>
              ))}
            </tr>
          ))}</tbody>
        </table>
      </div>
    </Field>
  );
}

function MenjodohkanFields({soal,u}){
  const opts=(soal.options?.left!==undefined)?soal.options:{left:[],right:[]};
  const ans=(typeof soal.answer==="object"&&!Array.isArray(soal.answer))?soal.answer:{};
  const upL=(i,v)=>{const l=[...opts.left];l[i]=v;u("options",{...opts,left:l});};
  const upR=(i,v)=>{const r=[...opts.right];r[i]=v;u("options",{...opts,right:r});};
  return(
    <Field label="Pasangan Jawaban">
      <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:"8px",alignItems:"start"}}>
        <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
          <span style={{fontSize:"11px",fontWeight:"700",color:"#6b6860"}}>KIRI</span>
          {opts.left.map((item,i)=><input key={i} value={item} onChange={e=>upL(i,e.target.value)} style={inStyle} onFocus={focusRed} onBlur={blurGray}/>)}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:"6px",paddingTop:"20px"}}>
          {opts.left.map((_,i)=>(
            <select key={i} value={ans[String(i)]??""} onChange={e=>u("answer",{...ans,[String(i)]:Number(e.target.value)})}
              style={{padding:"7px 4px",borderRadius:"8px",border:"1px solid #e2ddd5",fontSize:"12px",outline:"none",cursor:"pointer"}}>
              <option value="">→</option>
              {opts.right.map((_r,ri)=><option key={ri} value={ri}>{ri+1}</option>)}
            </select>
          ))}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
          <span style={{fontSize:"11px",fontWeight:"700",color:"#6b6860"}}>KANAN</span>
          {opts.right.map((item,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:"4px"}}>
              <span style={{fontSize:"11px",color:"#b4b2a9",minWidth:"14px"}}>{i+1}.</span>
              <input value={item} onChange={e=>upR(i,e.target.value)} style={inStyle} onFocus={focusRed} onBlur={blurGray}/>
            </div>
          ))}
        </div>
      </div>
    </Field>
  );
}

function IsianMultiFields({soal,u}){
  const opts=Array.isArray(soal.options)?soal.options:[];
  const ans=Array.isArray(soal.answer)?soal.answer:opts.map(()=>"");
  const upAns=(i,v)=>{const n=[...ans];n[i]=v;u("answer",n);};
  const upLabel=(i,v)=>{const n=[...opts];n[i]={...n[i],label:v};u("options",n);};
  const upSatuan=(i,v)=>{const n=[...opts];n[i]={...n[i],satuan:v};u("options",n);};
  const add=()=>{u("options",[...opts,{label:"",satuan:""}]);u("answer",[...ans,""]);};
  const remove=i=>{u("options",opts.filter((_,j)=>j!==i));u("answer",ans.filter((_,j)=>j!==i));};
  return(
    <Field label="Sub-jawaban">
      {opts.map((opt,i)=>(
        <div key={i} style={{background:"#faf9f6",borderRadius:"10px",border:"1px solid #e2ddd5",padding:"12px 14px",display:"flex",flexDirection:"column",gap:"8px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:"11px",fontWeight:"700",color:"#6b6860"}}>Sub-jawaban {i+1}</span>
            {opts.length>1&&<button type="button" onClick={()=>remove(i)} style={{background:"#fff3f0",border:"1px solid #fca5a5",borderRadius:"6px",cursor:"pointer",padding:"2px 6px",color:"#e84c2b",fontSize:"11px"}}>Hapus</button>}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 100px",gap:"8px"}}>
            <div><label style={{fontSize:"11px",color:"#6b6860",fontWeight:"600"}}>Label</label><input value={opt.label||""} onChange={e=>upLabel(i,e.target.value)} style={inStyle} onFocus={focusRed} onBlur={blurGray}/></div>
            <div><label style={{fontSize:"11px",color:"#6b6860",fontWeight:"600"}}>Jawaban</label><input value={ans[i]||""} onChange={e=>upAns(i,e.target.value)} style={inStyle} onFocus={focusRed} onBlur={blurGray}/></div>
            <div><label style={{fontSize:"11px",color:"#6b6860",fontWeight:"600"}}>Satuan</label><input value={opt.satuan||""} onChange={e=>upSatuan(i,e.target.value)} placeholder="cm, kg…" style={inStyle} onFocus={focusRed} onBlur={blurGray}/></div>
          </div>
        </div>
      ))}
      {opts.length<6&&<button type="button" onClick={add} style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"12px",fontWeight:"600",color:"#e84c2b",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit"}}><Plus size={13}/> Tambah Sub-jawaban</button>}
    </Field>
  );
}

function SoalCard({soal,index,onChange,onDelete,status}){
  const [expanded,setExpanded]=useState(true);
  const borderColor=status==="saved"?"#1a8a6e":status==="error"?"#e84c2b":"#e2ddd5";
  const u=(field,val)=>onChange(index,{...soal,[field]:val});
  const preview=(soal.body||"Soal kosong").replace(/\$.*?\$/g,"[rumus]").substring(0,80);

  return(
    <div style={{border:`1.5px solid ${borderColor}`,borderRadius:"12px",background:status==="saved"?"#f0fdf8":"white",overflow:"hidden"}}>
      {/* header */}
      <div style={{display:"flex",alignItems:"center",padding:"12px 16px",gap:"10px",cursor:"pointer",borderBottom:expanded?"1px solid #f0ede6":"none"}} onClick={()=>setExpanded(v=>!v)}>
        <span style={{width:"26px",height:"26px",borderRadius:"8px",background:status==="saved"?"#1a8a6e":"#e84c2b",color:"white",fontSize:"12px",fontWeight:"700",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{index+1}</span>
        <div style={{flex:1,fontSize:"13px",color:"#0f0e17",fontWeight:"500",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{preview}{soal.body?.length>80?"…":""}</div>
        <span style={{fontSize:"11px",color:"#b4b2a9",background:"#f2efe8",padding:"2px 8px",borderRadius:"99px",flexShrink:0}}>{soal.tipe?.replace(/_/g," ")}</span>
        <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
          {status==="saved"&&<CheckCircle2 size={16} color="#1a8a6e"/>}
          {status==="error"&&<AlertCircle size={16} color="#e84c2b"/>}
          <button type="button" onClick={e=>{e.stopPropagation();onDelete(index);}} style={{background:"none",border:"none",cursor:"pointer",color:"#b4b2a9",display:"flex",padding:"2px"}}><Trash2 size={14}/></button>
          {expanded?<ChevronUp size={16} color="#6b6860"/>:<ChevronDown size={16} color="#6b6860"/>}
        </div>
      </div>

      {expanded&&(
        <div style={{padding:"16px",display:"flex",flexDirection:"column",gap:"14px"}}>
          {/* difficulty inline */}
          <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
            <span style={{fontSize:"11px",fontWeight:"700",color:"#6b6860",textTransform:"uppercase",letterSpacing:".05em"}}>Difficulty</span>
            <DiffBadge diff={soal.difficulty||1} onChange={v=>u("difficulty",v)}/>
          </div>
          <Field label="Soal">
            <textarea value={soal.body||""} onChange={e=>u("body",e.target.value)} rows={3} style={taStyle} onFocus={focusRed} onBlur={blurGray}/>
          </Field>
          {soal.tipe==="pilihan_ganda"&&<PGFields soal={soal} u={u}/>}
          {(soal.tipe==="isian_singkat"||soal.tipe==="isian_numerik")&&<IsianFields soal={soal} u={u}/>}
          {soal.tipe==="checklist"&&<ChecklistFields soal={soal} u={u}/>}
          {soal.tipe==="multiple_choice_table"&&<MCTFields soal={soal} u={u}/>}
          {soal.tipe==="menjodohkan"&&<MenjodohkanFields soal={soal} u={u}/>}
          {soal.tipe==="isian_multi"&&<IsianMultiFields soal={soal} u={u}/>}
          <Field label="Pembahasan (opsional)">
            <textarea value={soal.explanation||""} onChange={e=>u("explanation",e.target.value)} rows={2} style={taStyle} onFocus={focusRed} onBlur={blurGray}/>
          </Field>
        </div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function AdminSoalBulkImport({ struktur }) {
  const [step, setStep]           = useState("import"); // import | review | done
  const [subtopikId, setSubtopikId] = useState("");
  const [jsonInput, setJsonInput] = useState("");
  const [parseError, setParseError]   = useState("");
  const [parseSnippet, setParseSnippet] = useState("");
  const [soalList, setSoalList]   = useState([]);
  const [cardStatus, setCardStatus] = useState({});
  const [saving, setSaving]       = useState(false);
  const [saveError, setSaveError] = useState("");

  const CONTOH = `[
  {
    "body": "Teks soal...",
    "options": [{"label":"A","text":"..."},{"label":"B","text":"..."},{"label":"C","text":"..."},{"label":"D","text":"..."}],
    "answer": "A",
    "explanation": "Pembahasan...",
    "tipe": "pilihan_ganda",
    "difficulty": "medium"
  },
  {
    "body": "Soal isian...",
    "options": [],
    "answer": "42",
    "tipe": "isian_numerik",
    "difficulty": "hard"
  }
]`;

  const handleImport = () => {
    setParseError(""); setParseSnippet("");
    if (!subtopikId) { setParseError("Pilih subtopik tujuan dulu"); return; }
    if (!jsonInput.trim()) { setParseError("Paste JSON array dulu"); return; }
    try {
      const arr = parseJsonArray(jsonInput);
      if (!Array.isArray(arr) || arr.length === 0) throw new Error("Bukan array atau kosong");
      const soal = arr.map((s, i) => {
        const tipe = parseTipe(s.tipe) ?? "pilihan_ganda";
        return {
          _key: i,
          subtopik_id: Number(subtopikId),
          tipe,
          difficulty: parseDiff(s.difficulty) ?? 1,
          body: s.body || "",
          options: s.options || [],
          answer: normalizeAnswer({ ...s, tipe }),
          explanation: s.explanation || "",
        };
      });
      setSoalList(soal);
      setCardStatus({});
      setSaveError("");
      setStep("review");
    } catch(e) {
      const msg = e.message || "";
      const posMatch = msg.match(/position (\d+)/i) || msg.match(/at (\d+)/i);
      if (posMatch) {
        const pos = Number(posMatch[1]);
        const src = jsonInput.trim().replace(/```json/gi,"").replace(/```/g,"").trim();
        const start = Math.max(0, pos-40), end = Math.min(src.length, pos+40);
        setParseSnippet(src.slice(start,end)+"\n"+" ".repeat(Math.min(pos-start,40))+"^");
      }
      setParseError("JSON tidak valid — "+msg.replace(/^JSON Parse error: /i,"").replace(/^SyntaxError: /i,""));
    }
  };

  const handleChange = (i, updated) => setSoalList(list => list.map((s,j)=>j===i?updated:s));
  const handleDelete = (i) => setSoalList(list => list.filter((_,j)=>j!==i));

  const handleSave = async () => {
    if (!soalList.length) return;
    setSaving(true); setSaveError("");
    try {
      const res = await api.post("/admin/soal/bulk", { soal: soalList });
      const statusMap = {};
      (res.saved||[]).forEach(({index})=>{statusMap[index]="saved";});
      (res.errors||[]).forEach(({index})=>{statusMap[index]="error";});
      setCardStatus(statusMap);
      if (!(res.errors||[]).length) {
        setStep("done");
      } else {
        setSaveError(`${res.total} soal berhasil, ${res.errors.length} gagal.`);
        setSoalList(list=>list.filter((_,i)=>statusMap[i]!=="saved"));
        setCardStatus({});
      }
    } catch { setSaveError("Gagal menyimpan. Coba lagi."); }
    finally { setSaving(false); }
  };

  const handleReset = () => {
    setStep("import"); setSoalList([]); setCardStatus({}); setSaveError("");
    setJsonInput(""); setParseError(""); setParseSnippet(""); setSubtopikId("");
  };

  return (
    <div style={{maxWidth:"760px"}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>

      {/* ── import ── */}
      {step==="import"&&(
        <div style={{display:"flex",flexDirection:"column",gap:"24px"}}>
          <div>
            <h2 style={{fontSize:"20px",fontWeight:"800",color:"#0f0e17",marginBottom:"6px"}}>Bulk Import JSON</h2>
            <p style={{fontSize:"14px",color:"#6b6860",lineHeight:"1.6"}}>Paste JSON array berisi banyak soal sekaligus, review, lalu simpan.</p>
          </div>

          {/* Subtopik */}
          <div style={{background:"white",border:"1px solid #e2ddd5",borderRadius:"14px",padding:"20px"}}>
            <SubtopikPicker struktur={struktur} subtopikId={subtopikId} onChange={setSubtopikId}/>
          </div>

          {/* JSON input */}
          <div style={{background:"white",border:"1px solid #e2ddd5",borderRadius:"14px",padding:"20px",display:"flex",flexDirection:"column",gap:"14px"}}>
            <div style={{fontSize:"14px",fontWeight:"700",color:"#0f0e17"}}>Paste JSON Array</div>

            <details style={{fontSize:"12px",color:"#6b6860"}}>
              <summary style={{cursor:"pointer",fontWeight:"600",marginBottom:"4px"}}>Lihat contoh format</summary>
              <pre style={{margin:"8px 0 0",padding:"10px 12px",background:"#f2efe8",borderRadius:"8px",fontSize:"11px",overflowX:"auto",lineHeight:"1.6",color:"#0f0e17"}}>{CONTOH}</pre>
              <div style={{marginTop:"8px",fontSize:"11px",lineHeight:"1.7"}}>
                <strong>tipe</strong> (opsional): pilihan_ganda · isian_singkat · isian_numerik · checklist · multiple_choice_table · menjodohkan · isian_multi<br/>
                <strong>difficulty</strong> (opsional): easy · medium · hard — default easy jika tidak ada
              </div>
            </details>

            <textarea
              value={jsonInput}
              onChange={e=>{setJsonInput(e.target.value);setParseError("");setParseSnippet("");}}
              placeholder="[{&quot;body&quot;:&quot;...&quot;, &quot;options&quot;:[...], &quot;answer&quot;:&quot;A&quot;}, ...]"
              rows={12}
              style={{...taStyle,fontSize:"13px",fontFamily:"monospace",border:`1px solid ${parseError?"#fca5a5":"#e2ddd5"}`}}
              onFocus={focusRed} onBlur={blurGray}
            />

            {parseError&&(
              <div style={{background:"#fff3f0",border:"1px solid #fca5a5",color:"#b91c1c",fontSize:"13px",borderRadius:"8px",padding:"10px 14px",display:"flex",flexDirection:"column",gap:"8px"}}>
                <div>{parseError}</div>
                {parseSnippet&&<pre style={{margin:0,padding:"8px 10px",background:"rgba(0,0,0,.06)",borderRadius:"6px",fontSize:"12px",fontFamily:"monospace",overflowX:"auto",whiteSpace:"pre",color:"#7f1d1d",lineHeight:"1.5"}}>{parseSnippet}</pre>}
              </div>
            )}

            <button type="button" onClick={handleImport}
              disabled={!jsonInput.trim()||!subtopikId}
              style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",padding:"12px 24px",borderRadius:"12px",border:"none",background:(!jsonInput.trim()||!subtopikId)?"#e2ddd5":"#e84c2b",color:(!jsonInput.trim()||!subtopikId)?"#b4b2a9":"white",fontSize:"15px",fontWeight:"700",cursor:(!jsonInput.trim()||!subtopikId)?"not-allowed":"pointer",fontFamily:"inherit"}}>
              <Upload size={17}/> Import & Review Soal
            </button>
          </div>
        </div>
      )}

      {/* ── review ── */}
      {step==="review"&&(
        <div style={{display:"flex",flexDirection:"column",gap:"20px"}}>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:"16px",flexWrap:"wrap"}}>
            <div>
              <h2 style={{fontSize:"18px",fontWeight:"800",color:"#0f0e17",marginBottom:"4px"}}>Review {soalList.length} Soal</h2>
              <p style={{fontSize:"13px",color:"#6b6860",margin:0}}>Periksa dan edit sebelum disimpan.</p>
            </div>
            <div style={{display:"flex",gap:"10px"}}>
              <button type="button" onClick={()=>setStep("import")}
                style={{padding:"9px 18px",borderRadius:"10px",border:"1px solid #e2ddd5",background:"white",fontSize:"13px",fontWeight:"600",cursor:"pointer",fontFamily:"inherit",color:"#6b6860"}}>
                ← Kembali
              </button>
              <button type="button" onClick={handleSave} disabled={saving||!soalList.length}
                style={{display:"flex",alignItems:"center",gap:"8px",padding:"9px 20px",borderRadius:"10px",border:"none",background:(saving||!soalList.length)?"#e2ddd5":"#e84c2b",color:(saving||!soalList.length)?"#b4b2a9":"white",fontSize:"14px",fontWeight:"700",cursor:(saving||!soalList.length)?"not-allowed":"pointer",fontFamily:"inherit"}}>
                {saving?<Loader2 size={15} style={{animation:"spin .7s linear infinite"}}/>:<CheckCircle2 size={15}/>}
                {saving?"Menyimpan...":`Simpan Semua (${soalList.length})`}
              </button>
            </div>
          </div>

          {saveError&&<div style={{background:"#fff3f0",border:"1px solid #fca5a5",color:"#b91c1c",fontSize:"13px",borderRadius:"10px",padding:"12px 16px"}}>{saveError}</div>}

          <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
            {soalList.map((soal,i)=>(
              <SoalCard key={soal._key??i} soal={soal} index={i} onChange={handleChange} onDelete={handleDelete} status={cardStatus[i]}/>
            ))}
          </div>

          {soalList.length>0&&(
            <div style={{display:"flex",justifyContent:"flex-end"}}>
              <button type="button" onClick={handleSave} disabled={saving}
                style={{display:"flex",alignItems:"center",gap:"8px",padding:"12px 28px",borderRadius:"12px",border:"none",background:saving?"#e2ddd5":"#e84c2b",color:saving?"#b4b2a9":"white",fontSize:"15px",fontWeight:"700",cursor:saving?"not-allowed":"pointer",fontFamily:"inherit"}}>
                {saving?<Loader2 size={16} style={{animation:"spin .7s linear infinite"}}/>:<CheckCircle2 size={16}/>}
                {saving?"Menyimpan...":`Simpan Semua (${soalList.length} soal)`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── done ── */}
      {step==="done"&&(
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"20px",padding:"60px 0",textAlign:"center"}}>
          <div style={{width:"64px",height:"64px",borderRadius:"50%",background:"#f0fdf8",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <CheckCircle2 size={32} color="#1a8a6e"/>
          </div>
          <div>
            <div style={{fontSize:"20px",fontWeight:"800",color:"#0f0e17",marginBottom:"8px"}}>Semua soal berhasil disimpan!</div>
            <p style={{fontSize:"14px",color:"#6b6860"}}>Soal sudah masuk ke database dan siap digunakan.</p>
          </div>
          <div style={{display:"flex",gap:"12px"}}>
            <button type="button" onClick={handleReset}
              style={{padding:"10px 24px",borderRadius:"12px",border:"1px solid #e2ddd5",background:"white",fontSize:"14px",fontWeight:"600",cursor:"pointer",fontFamily:"inherit",color:"#0f0e17"}}>
              Import Lagi
            </button>
            <a href="/admin/soal"
              style={{padding:"10px 24px",borderRadius:"12px",border:"none",background:"#e84c2b",color:"white",fontSize:"14px",fontWeight:"600",textDecoration:"none",display:"inline-flex",alignItems:"center"}}>
              Lihat Semua Soal
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
