
import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const PHASES = [
  { id:1, name:"Python Power-Up", weeks:"Wk 1–2", e:"🐍", color:"#7C3AED", pale:"#EDE9FE",
    topics:[
      {id:"p1t1",name:"NumPy & Pandas for text data",tag:"Core",hrs:8},
      {id:"p1t2",name:"OOP & Python best practices",tag:"Core",hrs:6},
      {id:"p1t3",name:"RegEx & string manipulation",tag:"Core",hrs:4},
      {id:"p1t4",name:"Git, GitHub & project structure",tag:"Core",hrs:4},
      {id:"p1t5",name:"Jupyter → Python scripts workflow",tag:"Core",hrs:3},
      {id:"p1t6",name:"Virtual envs, pip, requirements.txt",tag:"Core",hrs:2},
      {id:"p1t7",name:"PROJECT: CLI Sentiment Scorer",tag:"Project",hrs:8,proj:true},
    ]},
  { id:2, name:"ML Fundamentals", weeks:"Wk 3–4", e:"📊", color:"#059669", pale:"#D1FAE5",
    topics:[
      {id:"p2t1",name:"Probability & Bayes for NLP",tag:"Core",hrs:6},
      {id:"p2t2",name:"TF-IDF & Bag-of-Words",tag:"Core",hrs:5},
      {id:"p2t3",name:"Logistic Regression & SVMs for text",tag:"Core",hrs:6},
      {id:"p2t4",name:"Cross-validation & sklearn pipelines",tag:"Core",hrs:4},
      {id:"p2t5",name:"Precision, Recall, F1 — NLP metrics",tag:"Interview",hrs:4},
      {id:"p2t6",name:"Naive Bayes spam classifier",tag:"Core",hrs:8},
      {id:"p2t7",name:"PROJECT: FastAPI Text Classifier",tag:"Project",hrs:10,proj:true},
    ]},
  { id:3, name:"NLP & Transformers", weeks:"Wk 5–8", e:"🤖", color:"#2563EB", pale:"#DBEAFE",
    topics:[
      {id:"p3t1",name:"Word embeddings: Word2Vec, GloVe",tag:"Core",hrs:6},
      {id:"p3t2",name:"RNNs & LSTMs for sequences",tag:"Core",hrs:8},
      {id:"p3t3",name:"Attention mechanism from scratch",tag:"Core",hrs:8},
      {id:"p3t4",name:"Transformer architecture deep dive",tag:"Core",hrs:10},
      {id:"p3t5",name:"BERT: pre-training & fine-tuning",tag:"Interview",hrs:10},
      {id:"p3t6",name:"HuggingFace Trainer API",tag:"Core",hrs:6},
      {id:"p3t7",name:"PROJECT: Fine-tuned BERT Sentiment",tag:"Project",hrs:12,proj:true},
      {id:"p3t8",name:"GPT architecture & causal LM",tag:"Core",hrs:6},
    ]},
  { id:4, name:"LLMs & RAG", weeks:"Wk 9–11", e:"💬", color:"#D97706", pale:"#FEF3C7",
    topics:[
      {id:"p4t1",name:"Prompt engineering & few-shot learning",tag:"Core",hrs:6},
      {id:"p4t2",name:"LangChain fundamentals",tag:"Core",hrs:8},
      {id:"p4t3",name:"Vector DBs: FAISS & ChromaDB",tag:"Core",hrs:8},
      {id:"p4t4",name:"RAG pipeline from scratch",tag:"Core",hrs:12},
      {id:"p4t5",name:"LLM evaluation: BLEU, ROUGE, RAGAS",tag:"Core",hrs:5},
      {id:"p4t6",name:"OpenAI / Anthropic API integration",tag:"Core",hrs:4},
      {id:"p4t7",name:"PROJECT: PDF RAG Chatbot (Streamlit)",tag:"Project",hrs:15,proj:true},
    ]},
  { id:5, name:"Deploy & MLOps", weeks:"Wk 12–13", e:"🚀", color:"#DC2626", pale:"#FEE2E2",
    topics:[
      {id:"p5t1",name:"Docker — containerise NLP app",tag:"Core",hrs:8},
      {id:"p5t2",name:"FastAPI for LLM serving",tag:"Core",hrs:6},
      {id:"p5t3",name:"CI/CD with GitHub Actions",tag:"Core",hrs:5},
      {id:"p5t4",name:"Deploy to AWS / GCP",tag:"Core",hrs:8},
      {id:"p5t5",name:"PROJECT: Cloud-deployed LLM App",tag:"Project",hrs:12,proj:true},
    ]},
  { id:6, name:"Interview Blitz", weeks:"Wk 14–24", e:"🎯", color:"#16A34A", pale:"#F0FDF4",
    topics:[
      {id:"p6t1",name:"LeetCode Blind 75 (arrays, trees, DP)",tag:"Interview",hrs:20},
      {id:"p6t2",name:"SQL window functions & optimisation",tag:"Interview",hrs:8},
      {id:"p6t3",name:"ML & NLP theory flashcards (300+)",tag:"Interview",hrs:10},
      {id:"p6t4",name:"LLM system design — FAANG format",tag:"Interview",hrs:10},
      {id:"p6t5",name:"Behavioural STAR stories (Amazon LPs)",tag:"Interview",hrs:6},
      {id:"p6t6",name:"10 mock interviews — Pramp + io",tag:"Interview",hrs:15},
    ]},
];

const RESOURCES = [
  {ph:1,name:"Python OOP — Real Python",type:"Free",url:"https://realpython.com/python3-object-oriented-programming/",desc:"Best OOP guide"},
  {ph:1,name:"Git & GitHub Crash Course — Traversy",type:"Free",url:"https://www.youtube.com/watch?v=SWYqp7iY_Tc",desc:"YouTube · 32 min"},
  {ph:1,name:"regex101.com",type:"Tool",url:"https://regex101.com",desc:"Live regex tester"},
  {ph:2,name:"StatQuest — Naive Bayes",type:"Free",url:"https://www.youtube.com/watch?v=O2L2Uv9pdDA",desc:"YouTube · Josh Starmer"},
  {ph:2,name:"Hands-On ML — Aurélien Géron",type:"Book",url:"https://www.oreilly.com/library/view/hands-on-machine-learning/9781492032632/",desc:"Best practical ML book"},
  {ph:2,name:"FastAPI Full Course — freeCodeCamp",type:"Free",url:"https://www.youtube.com/watch?v=0sOvCWFmrtA",desc:"YouTube · build REST APIs"},
  {ph:2,name:"Scikit-learn User Guide",type:"Free",url:"https://scikit-learn.org/stable/user_guide.html",desc:"Official docs"},
  {ph:3,name:"Illustrated Transformer — Jay Alammar",type:"Free",url:"https://jalammar.github.io/illustrated-transformer/",desc:"Best visual guide"},
  {ph:3,name:"Karpathy — Zero to Hero",type:"Free",url:"https://www.youtube.com/watch?v=kCc8FmEb1nY",desc:"YouTube · build GPT from scratch"},
  {ph:3,name:"HuggingFace NLP Course",type:"Free",url:"https://huggingface.co/learn/nlp-course",desc:"Transformers, BERT, fine-tuning"},
  {ph:3,name:"Andrew Ng — DL Specialization",type:"Free",url:"https://www.coursera.org/specializations/deep-learning",desc:"Coursera · audit free"},
  {ph:4,name:"LangChain Crash Course — Patrick Loeber",type:"Free",url:"https://www.youtube.com/watch?v=LbT1yp6quS8",desc:"YouTube · LangChain basics"},
  {ph:4,name:"FAISS Tutorial — James Briggs",type:"Free",url:"https://www.youtube.com/watch?v=sKyvsdEv6rk",desc:"YouTube · vector search"},
  {ph:4,name:"Build RAG App — Alejandro AO",type:"Free",url:"https://www.youtube.com/watch?v=dXxQ0LR-3Hg",desc:"YouTube · full RAG build"},
  {ph:4,name:"OpenAI Prompt Engineering Guide",type:"Free",url:"https://platform.openai.com/docs/guides/prompt-engineering",desc:"Official guide"},
  {ph:5,name:"Docker Tutorial — TechWorld with Nana",type:"Free",url:"https://www.youtube.com/watch?v=3c-iBn73dDE",desc:"YouTube · full course"},
  {ph:5,name:"GitHub Actions Docs",type:"Free",url:"https://docs.github.com/en/actions",desc:"CI/CD official docs"},
  {ph:5,name:"Designing ML Systems — Chip Huyen",type:"Book",url:"https://www.oreilly.com/library/view/designing-machine-learning/9781098107956/",desc:"Must-read for FAANG"},
  {ph:6,name:"NeetCode Roadmap",type:"Free",url:"https://neetcode.io/roadmap",desc:"Best Blind 75 guide"},
  {ph:6,name:"ML Interview Q&A — GitHub",type:"Free",url:"https://github.com/khangich/machine-learning-interview",desc:"500+ ML questions"},
  {ph:6,name:"Pramp — free mock interviews",type:"Free",url:"https://www.pramp.com",desc:"Peer coding mocks"},
  {ph:6,name:"Grokking ML Interview",type:"Paid",url:"https://www.educative.io/courses/grokking-the-machine-learning-interview",desc:"System design for ML"},
];

const MILESTONES = [
  {week:"End Wk 2", title:"CLI Sentiment Scorer",    detail:"GitHub repo + README live",        ph:1},
  {week:"End Wk 4", title:"FastAPI Text Classifier",  detail:"Live URL on Render (free)",         ph:2},
  {week:"End Wk 8", title:"Fine-tuned BERT App",      detail:"HuggingFace Spaces URL",            ph:3},
  {week:"End Wk 11",title:"PDF RAG Chatbot",          detail:"Streamlit Cloud / HF Spaces",       ph:4},
  {week:"End Wk 13",title:"Cloud LLM App",            detail:"Docker + AWS/GCP live URL",         ph:5},
  {week:"Wk 17+",   title:"Job Offer Signed",         detail:"5+ apps/week → offer in hand",      ph:6},
];

const STAGES = ["Applied","OA","Phone Screen","Technical","System Design","Onsite","Offer","Rejected"];
const STAGE_CLR = {Applied:"#6B7280",OA:"#7C3AED","Phone Screen":"#2563EB",Technical:"#D97706","System Design":"#059669",Onsite:"#F59E0B",Offer:"#16A34A",Rejected:"#9CA3AF"};

// ─── STORAGE ───────────────────────────────────────────────────
const UK = u => `nlp_tracker_v3_${u}`;
async function loadUser(u) {
  try { const r = await window.storage.get(UK(u)); return r ? JSON.parse(r.value) : null; }
  catch { return null; }
}
async function saveUser(u, d) {
  try { await window.storage.set(UK(u), JSON.stringify(d)); } catch {}
}
async function listUsers() {
  try { const r = await window.storage.list("nlp_tracker_v3_"); return r ? r.keys.map(k=>k.replace("nlp_tracker_v3_","")) : []; }
  catch { return []; }
}
function mkDefault() {
  const rm = {};
  PHASES.forEach(p => p.topics.forEach(t => { rm[t.id] = "todo"; }));
  return { roadmap:rm, interviews:[], theme:"dark", startDate:new Date().toISOString().slice(0,10) };
}

// ─── UTILS ─────────────────────────────────────────────────────
const phasePct = (ph,rm) => Math.round(ph.topics.filter(t=>rm[t.id]==="done").length/ph.topics.length*100);
function overallStats(rm) {
  let done=0,prog=0,todo=0;
  PHASES.forEach(p=>p.topics.forEach(t=>{ if(rm[t.id]==="done") done++; else if(rm[t.id]==="in_progress") prog++; else todo++; }));
  return {done,prog,todo,total:done+prog+todo,pct:Math.round(done/(done+prog+todo)*100)||0};
}
const cycle = s => s==="todo"?"in_progress":s==="in_progress"?"done":"todo";
const stateIcon = s => s==="done"?"✅":s==="in_progress"?"🔵":"⭕";
const stateLabel = s => s==="done"?"Done":s==="in_progress"?"In Progress":"To Do";

// ─── THEMES ────────────────────────────────────────────────────
const TH = {
  dark:  { bg:"#07071A", surf:"#0D0D24", card:"#111128", border:"#1E1E40", text:"#E4E2FF", sub:"#706898", accent:"#7C3AED", pill:"#161630", input:"#131330" },
  light: { bg:"#F2F1FF", surf:"#FFFFFF",  card:"#FFFFFF",  border:"#E3E0FF", text:"#1A1740", sub:"#6B63A8", accent:"#7C3AED", pill:"#ECEAFF", input:"#F2F1FF" },
};
const TAG_CLR = { Core:["#10B98115","#10B981"], Interview:["#7C3AED15","#7C3AED"], Project:["#D9770615","#D97706"] };
const TYPE_CLR = { Free:["#D1FAE5","#065F46"], Book:["#EDE9FE","#4C1D95"], Paid:["#FEF3C7","#92400E"], Tool:["#DBEAFE","#1E40AF"] };

// ══════════════════════════════════════════════════════════════
// LOGIN
// ══════════════════════════════════════════════════════════════
function Login({ onLogin, loading, th }) {
  const [name, setName] = useState("");
  const [users, setUsers] = useState([]);
  useEffect(() => { listUsers().then(setUsers); }, []);
  const go = () => { if(name.trim()) onLogin(name.trim()); };
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:th.bg,padding:"1rem"}}>
      <div style={{width:"100%",maxWidth:420}}>
        <div style={{textAlign:"center",marginBottom:"2rem"}}>
          <div style={{width:68,height:68,borderRadius:20,background:"linear-gradient(135deg,#7C3AED,#2563EB)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,margin:"0 auto 1rem",boxShadow:"0 12px 40px #7C3AED50"}}>🧠</div>
          <h1 style={{fontSize:26,fontWeight:800,color:th.text,margin:"0 0 6px",letterSpacing:"-0.02em"}}>NLP / LLM Tracker</h1>
          <p style={{fontSize:14,color:th.sub,margin:0}}>6-month Google & Amazon interview prep</p>
        </div>
        <div style={{background:th.card,border:`1px solid ${th.border}`,borderRadius:20,padding:"2rem",boxShadow:"0 32px 80px #00000060"}}>
          {users.length > 0 && (<>
            <p style={{fontSize:11,color:th.sub,textTransform:"uppercase",letterSpacing:"0.08em",margin:"0 0 8px"}}>Continue as</p>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:"1.25rem"}}>
              {users.map(u=>(
                <button key={u} onClick={()=>onLogin(u)} style={{padding:"6px 16px",borderRadius:8,border:`1.5px solid ${th.accent}`,background:"transparent",color:th.accent,fontSize:13,fontWeight:700,cursor:"pointer"}}>
                  {u}
                </button>
              ))}
            </div>
            <div style={{borderTop:`1px solid ${th.border}`,marginBottom:"1.25rem"}} />
            <p style={{fontSize:11,color:th.sub,textTransform:"uppercase",letterSpacing:"0.08em",margin:"0 0 8px"}}>Or new account</p>
          </>)}
          <div style={{display:"flex",gap:8}}>
            <input value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()} placeholder="Your name..."
              style={{flex:1,padding:"11px 14px",borderRadius:10,border:`1.5px solid ${name?th.accent:th.border}`,background:th.input,color:th.text,fontSize:14,outline:"none",transition:"border-color 0.15s"}} />
            <button onClick={go} disabled={!name.trim()||loading}
              style={{padding:"11px 22px",borderRadius:10,background:"linear-gradient(135deg,#7C3AED,#2563EB)",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",border:"none",opacity:(!name.trim()||loading)?0.45:1,boxShadow:"0 4px 20px #7C3AED50",transition:"opacity 0.15s"}}>
              {loading?"…":"Start →"}
            </button>
          </div>
          <p style={{fontSize:12,color:th.sub,textAlign:"center",margin:"12px 0 0"}}>Same name loads your saved progress.</p>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// SIDEBAR
// ══════════════════════════════════════════════════════════════
function Sidebar({ page, setPage, user, data, th, dark, toggleTheme, logout }) {
  const rm = data?.roadmap || {};
  const nav = [{id:"dashboard",e:"📊",label:"Dashboard"},{id:"roadmap",e:"🗺️",label:"Roadmap"},{id:"resources",e:"📚",label:"Resources"},{id:"interviews",e:"💼",label:"Interviews"}];
  return (
    <div style={{width:220,minWidth:220,height:"100vh",background:th.surf,borderRight:`1px solid ${th.border}`,display:"flex",flexDirection:"column",padding:"1rem 0.75rem",gap:2,flexShrink:0,overflowY:"auto"}}>
      <div style={{padding:"0.5rem 0.75rem 1rem",marginBottom:4}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#7C3AED,#2563EB)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>🧠</div>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:th.text,lineHeight:1.2}}>NLP Tracker</div>
            <div style={{fontSize:11,color:th.sub}}>6-month plan</div>
          </div>
        </div>
      </div>
      {nav.map(n=>{
        const active=page===n.id;
        return (
          <button key={n.id} onClick={()=>setPage(n.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:10,background:active?`${th.accent}18`:"transparent",border:active?`1px solid ${th.accent}30`:"1px solid transparent",color:active?th.accent:th.sub,fontSize:13,fontWeight:active?700:400,cursor:"pointer",textAlign:"left",transition:"all 0.15s"}}>
            <span style={{fontSize:14}}>{n.e}</span>{n.label}
            {active&&<div style={{marginLeft:"auto",width:5,height:5,borderRadius:"50%",background:th.accent}} />}
          </button>
        );
      })}
      <div style={{height:1,background:th.border,margin:"8px 4px"}} />
      <div style={{padding:"10px 12px",borderRadius:10,background:th.pill}}>
        <div style={{fontSize:11,color:th.sub,marginBottom:8,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em"}}>Phase Progress</div>
        {PHASES.map(ph=>{
          const pct = phasePct(ph,rm);
          return (
            <div key={ph.id} style={{marginBottom:6}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                <span style={{fontSize:10,color:th.sub}}>{ph.e} P{ph.id}</span>
                <span style={{fontSize:10,color:pct>0?ph.color:th.sub,fontWeight:600}}>{pct}%</span>
              </div>
              <div style={{height:3,borderRadius:2,background:th.border}}>
                <div style={{height:"100%",borderRadius:2,background:ph.color,width:`${pct}%`,transition:"width 0.5s"}} />
              </div>
            </div>
          );
        })}
      </div>
      <div style={{flex:1}} />
      <button onClick={toggleTheme} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",borderRadius:10,border:`1px solid ${th.border}`,background:"transparent",color:th.sub,fontSize:12,cursor:"pointer",marginBottom:6}}>
        <span>{dark?"☀️":"🌙"}</span>{dark?"Light mode":"Dark mode"}
      </button>
      <div style={{padding:"10px 12px",borderRadius:10,background:th.pill,border:`1px solid ${th.border}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontSize:13,fontWeight:700,color:th.text}}>@{user}</div><div style={{fontSize:10,color:th.sub}}>Active learner</div></div>
          <button onClick={logout} style={{fontSize:11,color:th.sub,background:"transparent",border:`1px solid ${th.border}`,padding:"4px 8px",borderRadius:6,cursor:"pointer"}}>Out</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════════════════════
function Dashboard({ data, th, setPage }) {
  const rm = data.roadmap;
  const st = overallStats(rm);
  const interviews = data.interviews||[];
  const offers = interviews.filter(i=>i.stage==="Offer").length;
  const active = interviews.filter(i=>!["Offer","Rejected"].includes(i.stage)).length;
  const curPhase = PHASES.find(p=>phasePct(p,rm)<100)||PHASES[5];
  const days = Math.max(1,Math.floor((Date.now()-new Date(data.startDate))/86400000));
  const donut = [{name:"Done",v:st.done},{name:"Prog",v:st.prog},{name:"Todo",v:st.todo||1}];
  const DC = ["#10B981","#7C3AED","#1E1E42"];
  const bars = PHASES.map((p,i)=>({n:`P${i+1}`,pct:phasePct(p,rm)}));
  const C = ({children,style={}}) => <div style={{background:th.card,border:`1px solid ${th.border}`,borderRadius:14,padding:"1.25rem",...style}}>{children}</div>;
  const lbl = t => <div style={{fontSize:11,color:th.sub,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600,marginBottom:6}}>{t}</div>;
  return (
    <div style={{maxWidth:1080}}>
      <div style={{marginBottom:"1.5rem"}}>
        <h1 style={{fontSize:22,fontWeight:800,color:th.text,margin:"0 0 4px",letterSpacing:"-0.02em"}}>Dashboard</h1>
        <p style={{fontSize:13,color:th.sub,margin:0}}>Target: Google · Amazon · Product-based · NLP / LLM roles</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:14}}>
        {[
          {l:"Overall Progress",v:`${st.pct}%`,s:`${st.done}/${st.total} topics done`,c:"#7C3AED",e:"🎯"},
          {l:"Current Phase",v:`P${PHASES.indexOf(curPhase)+1}`,s:curPhase.name,c:curPhase.color,e:curPhase.e},
          {l:"Applications",v:interviews.length,s:`${active} active · ${offers} offer${offers!==1?"s":""}`,c:"#2563EB",e:"💼"},
          {l:"Days Studying",v:days,s:`Started ${data.startDate}`,c:"#D97706",e:"📅"},
        ].map((s,i)=>(
          <C key={i}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              {lbl(s.l)}<span style={{fontSize:20,opacity:0.85}}>{s.e}</span>
            </div>
            <div style={{fontSize:32,fontWeight:800,color:s.c,letterSpacing:"-0.03em",lineHeight:1}}>{s.v}</div>
            <div style={{fontSize:12,color:th.sub,marginTop:6}}>{s.s}</div>
          </C>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"240px 1fr",gap:12,marginBottom:14}}>
        <C style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
          {lbl("Overall Progress")}
          <div style={{position:"relative",marginTop:4}}>
            <PieChart width={160} height={160}>
              <Pie data={donut} dataKey="v" cx={80} cy={80} innerRadius={52} outerRadius={72} strokeWidth={0}>
                {donut.map((_,i)=><Cell key={i} fill={DC[i]} />)}
              </Pie>
            </PieChart>
            <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center",pointerEvents:"none"}}>
              <div style={{fontSize:24,fontWeight:800,color:th.text}}>{st.pct}%</div>
              <div style={{fontSize:10,color:th.sub}}>complete</div>
            </div>
          </div>
          <div style={{display:"flex",gap:16,marginTop:10}}>
            {[["Done","#10B981",st.done],["Active","#7C3AED",st.prog],["Todo","#374151",st.todo]].map(([l,c,v])=>(
              <div key={l} style={{textAlign:"center"}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:c,margin:"0 auto 3px"}} />
                <div style={{fontSize:11,color:th.sub}}>{l}</div>
                <div style={{fontSize:14,fontWeight:700,color:th.text}}>{v}</div>
              </div>
            ))}
          </div>
        </C>
        <C>
          {lbl("Progress by Phase")}
          <ResponsiveContainer width="100%" height={165}>
            <BarChart data={bars} margin={{top:0,right:4,bottom:0,left:-20}}>
              <XAxis dataKey="n" tick={{fill:th.sub,fontSize:11}} axisLine={false} tickLine={false} />
              <YAxis tick={{fill:th.sub,fontSize:10}} axisLine={false} tickLine={false} domain={[0,100]} tickFormatter={v=>`${v}%`} />
              <Tooltip contentStyle={{background:th.card,border:`1px solid ${th.border}`,borderRadius:8,fontSize:12,color:th.text}} formatter={v=>[`${v}%`,"Complete"]} cursor={{fill:`${th.accent}10`}} />
              <Bar dataKey="pct" radius={[5,5,0,0]}>
                {bars.map((_,i)=><Cell key={i} fill={PHASES[i].color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </C>
      </div>
      <C>
        {lbl("Project Milestones — Deployables that get you hired")}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginTop:4}}>
          {MILESTONES.map((m,i)=>{
            const ph=PHASES[m.ph-1]; const pct=phasePct(ph,rm); const done=pct===100;
            return (
              <div key={i} style={{padding:"12px",borderRadius:10,background:done?`${ph.color}12`:th.surf,border:`1.5px solid ${done?ph.color:th.border}`,transition:"all 0.3s"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                  <span style={{fontSize:10,fontWeight:700,color:ph.color,textTransform:"uppercase",letterSpacing:"0.06em"}}>{m.week}</span>
                  <span style={{fontSize:16}}>{done?"✅":"⭕"}</span>
                </div>
                <div style={{fontSize:13,fontWeight:700,color:th.text,marginBottom:2}}>{m.title}</div>
                <div style={{fontSize:11,color:th.sub,marginBottom:pct>0&&!done?8:0}}>{m.detail}</div>
                {pct>0&&!done&&<div style={{height:3,borderRadius:2,background:th.border}}><div style={{height:"100%",borderRadius:2,background:ph.color,width:`${pct}%`,transition:"width 0.4s"}} /></div>}
              </div>
            );
          })}
        </div>
      </C>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ROADMAP
// ══════════════════════════════════════════════════════════════
function Roadmap({ data, update, th }) {
  const [open, setOpen] = useState({1:true});
  const rm = data.roadmap;
  const tog = id => setOpen(o=>({...o,[id]:!o[id]}));
  const handleTopic = async (tid) => { await update({roadmap:{...rm,[tid]:cycle(rm[tid])}}); };

  return (
    <div style={{maxWidth:780}}>
      <div style={{marginBottom:"1.5rem"}}>
        <h1 style={{fontSize:22,fontWeight:800,color:th.text,margin:"0 0 4px",letterSpacing:"-0.02em"}}>Roadmap</h1>
        <p style={{fontSize:13,color:th.sub,margin:0}}>Click any topic to cycle: ⭕ To Do → 🔵 In Progress → ✅ Done</p>
      </div>
      {PHASES.map(ph=>{
        const done=ph.topics.filter(t=>rm[t.id]==="done").length;
        const prog=ph.topics.filter(t=>rm[t.id]==="in_progress").length;
        const pct=Math.round(done/ph.topics.length*100);
        const isOpen=open[ph.id];
        return (
          <div key={ph.id} style={{marginBottom:10,background:th.card,border:`1.5px solid ${isOpen?ph.color:th.border}`,borderRadius:14,overflow:"hidden",transition:"border-color 0.2s"}}>
            <div onClick={()=>tog(ph.id)} style={{padding:"14px 18px",cursor:"pointer",display:"flex",alignItems:"center",gap:12,background:isOpen?`${ph.color}0A`:"transparent",userSelect:"none"}}>
              <div style={{width:38,height:38,borderRadius:10,background:`${ph.color}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,flexShrink:0}}>{ph.e}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
                  <span style={{fontSize:14,fontWeight:700,color:th.text}}>{ph.name}</span>
                  <span style={{fontSize:10,padding:"2px 8px",borderRadius:20,background:`${ph.color}18`,color:ph.color,fontWeight:700}}>{ph.weeks}</span>
                  {pct===100&&<span style={{fontSize:10,padding:"2px 8px",borderRadius:20,background:"#10B98118",color:"#10B981",fontWeight:700}}>Complete ✓</span>}
                </div>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:160,height:4,borderRadius:2,background:th.border}}>
                    <div style={{height:"100%",borderRadius:2,background:ph.color,width:`${pct}%`,transition:"width 0.4s"}} />
                  </div>
                  <span style={{fontSize:11,color:th.sub,whiteSpace:"nowrap"}}>{done}/{ph.topics.length} done{prog>0?` · ${prog} active`:""}</span>
                </div>
              </div>
              <span style={{fontSize:20,color:th.sub,transition:"transform 0.2s",transform:isOpen?"rotate(180deg)":"none",lineHeight:1}}>⌄</span>
            </div>
            {isOpen&&(
              <div style={{borderTop:`1px solid ${th.border}`}}>
                {ph.topics.map((t,ti)=>{
                  const state=rm[t.id]||"todo";
                  return (
                    <div key={t.id} onClick={()=>handleTopic(t.id)} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 18px",borderBottom:ti<ph.topics.length-1?`1px solid ${th.border}`:"none",cursor:"pointer",background:state==="done"?"#10B98106":state==="in_progress"?`${ph.color}07`:"transparent",transition:"background 0.15s"}}>
                      <span style={{fontSize:18,flexShrink:0}}>{stateIcon(state)}</span>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                          <span style={{fontSize:13,fontWeight:t.proj?700:400,color:state==="done"?th.sub:th.text,textDecoration:state==="done"?"line-through":"none"}}>{t.name}</span>
                          {t.proj&&<span style={{fontSize:9,padding:"1px 7px",borderRadius:20,background:`${ph.color}22`,color:ph.color,fontWeight:800,textDecoration:"none",flexShrink:0}}>PROJECT</span>}
                        </div>
                        <div style={{display:"flex",gap:8,marginTop:3,alignItems:"center"}}>
                          <span style={{fontSize:10,color:th.sub}}>{t.hrs}h est.</span>
                          <span style={{fontSize:10,padding:"1px 7px",borderRadius:20,background:(TAG_CLR[t.tag]||["#eee","#333"])[0],color:(TAG_CLR[t.tag]||["#eee","#333"])[1],fontWeight:600}}>{t.tag}</span>
                        </div>
                      </div>
                      <span style={{fontSize:11,color:th.sub,whiteSpace:"nowrap",flexShrink:0}}>{stateLabel(state)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// RESOURCES
// ══════════════════════════════════════════════════════════════
function Resources({ th }) {
  const [ph, setPh] = useState(0);
  const [type, setType] = useState("All");
  const filtered = RESOURCES.filter(r=>(ph===0||r.ph===ph)&&(type==="All"||r.type===type));
  return (
    <div style={{maxWidth:900}}>
      <div style={{marginBottom:"1.5rem"}}>
        <h1 style={{fontSize:22,fontWeight:800,color:th.text,margin:"0 0 4px",letterSpacing:"-0.02em"}}>Resources</h1>
        <p style={{fontSize:13,color:th.sub,margin:0}}>Curated learning materials for every phase</p>
      </div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
        {[{id:0,n:"All",e:"🔍",c:th.accent},...PHASES.map(p=>({id:p.id,n:`P${p.id}`,e:p.e,c:p.color}))].map(f=>{
          const active=ph===f.id;
          return <button key={f.id} onClick={()=>setPh(f.id)} style={{padding:"5px 14px",borderRadius:20,fontSize:12,fontWeight:600,cursor:"pointer",background:active?`${f.c}20`:"transparent",border:`1.5px solid ${active?f.c:th.border}`,color:active?f.c:th.sub,transition:"all 0.15s"}}>{f.e} {f.n}</button>;
        })}
      </div>
      <div style={{display:"flex",gap:6,marginBottom:16}}>
        {["All","Free","Book","Paid","Tool"].map(t=>(
          <button key={t} onClick={()=>setType(t)} style={{padding:"4px 12px",borderRadius:6,fontSize:12,fontWeight:600,cursor:"pointer",background:type===t?th.accent:"transparent",border:`1px solid ${type===t?th.accent:th.border}`,color:type===t?"#fff":th.sub}}>{t}</button>
        ))}
      </div>
      {filtered.length===0?<div style={{background:th.card,border:`1px solid ${th.border}`,borderRadius:14,padding:"3rem",textAlign:"center",color:th.sub}}>No resources match this filter.</div>:(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(255px,1fr))",gap:10}}>
          {filtered.map((r,i)=>{
            const phObj=PHASES[r.ph-1];
            const [tbg,tfg]=(TYPE_CLR[r.type]||["#f3f4f6","#374151"]);
            return (
              <div key={i} style={{background:th.card,border:`1px solid ${th.border}`,borderRadius:12,padding:"1rem",display:"flex",flexDirection:"column",gap:8}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:`${phObj.color}18`,color:phObj.color,fontWeight:700}}>{phObj.e} P{r.ph}</span>
                  <span style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:tbg,color:tfg,fontWeight:700}}>{r.type}</span>
                </div>
                <div style={{fontSize:13,fontWeight:700,color:th.text,lineHeight:1.35}}>{r.name}</div>
                <div style={{fontSize:12,color:th.sub,flex:1}}>{r.desc}</div>
                <a href={r.url} target="_blank" rel="noopener noreferrer" style={{display:"block",textAlign:"center",padding:"8px",borderRadius:8,background:`${phObj.color}14`,border:`1px solid ${phObj.color}35`,color:phObj.color,fontSize:12,fontWeight:700,textDecoration:"none"}}>
                  Open Resource →
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// INTERVIEWS
// ══════════════════════════════════════════════════════════════
function Interviews({ data, update, th }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({company:"",role:"",date:new Date().toISOString().slice(0,10),stage:"Applied",notes:""});
  const interviews = data.interviews||[];
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const add = async () => {
    if (!form.company.trim()) return;
    const ni = {id:Date.now(),...form,company:form.company.trim(),role:form.role.trim(),notes:form.notes.trim()};
    await update({interviews:[ni,...interviews]});
    setForm(f=>({...f,company:"",role:"",notes:""}));
    setShowForm(false);
  };
  const updateStage = async (id,stage) => await update({interviews:interviews.map(i=>i.id===id?{...i,stage}:i)});
  const del = async (id) => await update({interviews:interviews.filter(i=>i.id!==id)});

  const stats = [
    {l:"Total Applied",v:interviews.length,c:"#7C3AED"},
    {l:"Active Pipelines",v:interviews.filter(i=>!["Offer","Rejected"].includes(i.stage)).length,c:"#2563EB"},
    {l:"Offers",v:interviews.filter(i=>i.stage==="Offer").length,c:"#16A34A"},
    {l:"Rejected",v:interviews.filter(i=>i.stage==="Rejected").length,c:"#9CA3AF"},
  ];

  const inp = (ph,k,type="text") => (
    <input type={type} value={form[k]} onChange={e=>set(k,e.target.value)} placeholder={ph} style={{width:"100%",padding:"9px 12px",borderRadius:8,border:`1px solid ${th.border}`,background:th.input,color:th.text,fontSize:13,outline:"none",boxSizing:"border-box"}} />
  );

  return (
    <div style={{maxWidth:780}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:"1.5rem"}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:800,color:th.text,margin:"0 0 4px",letterSpacing:"-0.02em"}}>Interview Log</h1>
          <p style={{fontSize:13,color:th.sub,margin:0}}>Track every application from applied → offer</p>
        </div>
        <button onClick={()=>setShowForm(f=>!f)} style={{padding:"9px 20px",borderRadius:10,background:showForm?"transparent":"linear-gradient(135deg,#7C3AED,#2563EB)",color:showForm?th.sub:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",border:`1px solid ${showForm?th.border:"transparent"}`,transition:"all 0.15s"}}>
          {showForm?"Cancel":"+ Add Application"}
        </button>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
        {stats.map((s,i)=>(
          <div key={i} style={{background:th.card,border:`1px solid ${th.border}`,borderRadius:12,padding:"1rem",textAlign:"center"}}>
            <div style={{fontSize:28,fontWeight:800,color:s.c,letterSpacing:"-0.02em"}}>{s.v}</div>
            <div style={{fontSize:11,color:th.sub,marginTop:4}}>{s.l}</div>
          </div>
        ))}
      </div>

      {showForm&&(
        <div style={{background:th.card,border:`1.5px solid ${th.accent}`,borderRadius:14,padding:"1.25rem",marginBottom:14}}>
          <div style={{fontSize:13,fontWeight:700,color:th.text,marginBottom:12}}>New Application</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
            {inp("Company name *","company")} {inp("Role / Position","role")}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
            {inp("Date applied","date","date")}
            <select value={form.stage} onChange={e=>set("stage",e.target.value)} style={{padding:"9px 12px",borderRadius:8,border:`1px solid ${th.border}`,background:th.input,color:th.text,fontSize:13,outline:"none"}}>
              {STAGES.map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
          {inp("Notes (optional)","notes")}
          <div style={{display:"flex",gap:8,marginTop:12}}>
            <button onClick={add} style={{padding:"9px 22px",borderRadius:8,background:"linear-gradient(135deg,#7C3AED,#2563EB)",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",border:"none"}}>Save</button>
            <button onClick={()=>setShowForm(false)} style={{padding:"9px 16px",borderRadius:8,background:"transparent",color:th.sub,fontSize:13,cursor:"pointer",border:`1px solid ${th.border}`}}>Cancel</button>
          </div>
        </div>
      )}

      {interviews.length===0?(
        <div style={{background:th.card,border:`1px solid ${th.border}`,borderRadius:14,padding:"3rem",textAlign:"center"}}>
          <div style={{fontSize:44,marginBottom:12}}>💼</div>
          <div style={{fontSize:14,color:th.sub}}>No applications yet.</div>
          <div style={{fontSize:12,color:th.sub,marginTop:4}}>Start applying from Week 17+. Add your first application above.</div>
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {interviews.map(app=>{
            const sc=STAGE_CLR[app.stage]||"#6B7280";
            const e=app.stage==="Offer"?"🎉":app.stage==="Rejected"?"❌":"🏢";
            return (
              <div key={app.id} style={{background:th.card,border:`1px solid ${th.border}`,borderRadius:12,padding:"12px 16px",display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:40,height:40,borderRadius:10,background:`${sc}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{e}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3,flexWrap:"wrap"}}>
                    <span style={{fontSize:14,fontWeight:700,color:th.text}}>{app.company}</span>
                    {app.role&&<span style={{fontSize:12,color:th.sub}}>· {app.role}</span>}
                  </div>
                  <div style={{display:"flex",gap:10,alignItems:"center"}}>
                    <span style={{fontSize:11,color:th.sub}}>{app.date}</span>
                    {app.notes&&<span style={{fontSize:11,color:th.sub,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:200}}>· {app.notes}</span>}
                  </div>
                </div>
                <select value={app.stage} onChange={e=>updateStage(app.id,e.target.value)} style={{padding:"5px 10px",borderRadius:8,border:`1.5px solid ${sc}`,background:`${sc}14`,color:sc,fontSize:12,fontWeight:700,cursor:"pointer",outline:"none",flexShrink:0}}>
                  {STAGES.map(s=><option key={s}>{s}</option>)}
                </select>
                <button onClick={()=>del(app.id)} style={{padding:"5px 9px",borderRadius:8,border:`1px solid ${th.border}`,background:"transparent",color:th.sub,fontSize:12,cursor:"pointer",flexShrink:0}}>✕</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// APP
// ══════════════════════════════════════════════════════════════
export default function App() {
  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [dark, setDark] = useState(true);
  const [loading, setLoading] = useState(false);
  const th = dark ? TH.dark : TH.light;

  const persist = async (d) => { if(user) await saveUser(user, {...d, theme:dark?"dark":"light"}); };
  const update = async (patch) => { const nd={...data,...patch}; setData(nd); await persist(nd); };

  const login = async (name) => {
    setLoading(true);
    let d = await loadUser(name);
    if (!d) { d = mkDefault(); await saveUser(name, d); }
    setDark(d.theme !== "light");
    setData(d); setUser(name);
    setLoading(false);
  };
  const toggleTheme = async () => {
    const nd=!dark; setDark(nd);
    if(data) await saveUser(user, {...data, theme:nd?"dark":"light"});
  };
  const logout = () => { setUser(null); setData(null); setPage("dashboard"); };

  if (!user) return <Login onLogin={login} loading={loading} th={th} />;
  return (
    <div style={{display:"flex",height:"100vh",background:th.bg,color:th.text,fontFamily:"'Segoe UI',system-ui,Arial,sans-serif",overflow:"hidden"}}>
      <Sidebar page={page} setPage={setPage} user={user} data={data} th={th} dark={dark} toggleTheme={toggleTheme} logout={logout} />
      <main style={{flex:1,overflow:"auto",padding:"1.75rem 2rem",minWidth:0}}>
        {page==="dashboard"  && <Dashboard  data={data} th={th} setPage={setPage} />}
        {page==="roadmap"    && <Roadmap    data={data} update={update} th={th} />}
        {page==="resources"  && <Resources  th={th} />}
        {page==="interviews" && <Interviews data={data} update={update} th={th} />}
      </main>
    </div>
  );
}
