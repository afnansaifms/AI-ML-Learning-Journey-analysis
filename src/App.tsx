import React, { useState, useEffect } from "react";
import type { FC, ReactNode } from "react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { initializeApp } from "firebase/app";
import {
  getAuth, onAuthStateChanged, signOut,
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signInWithPopup, GoogleAuthProvider, updateProfile,
  type User,
} from "firebase/auth";

// ─────────────────────────────────────────────────────────────
// FIREBASE INIT
// ─────────────────────────────────────────────────────────────

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

const app            = initializeApp(firebaseConfig);
const auth           = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

type TaskState = "todo" | "in_progress" | "done";
type ThemeKey  = "dark" | "light";
type NavPage   = "dashboard" | "roadmap" | "videos" | "resources" | "schedule" | "interviews";

interface WeekTask {
  id: string; wk: number; days: string; phase: number;
  subtopic: string; hrs: string; video: string; url: string;
  checkpoint: string; isProject: boolean;
}
interface Interview {
  id: number; company: string; role: string;
  date: string; stage: string; notes: string;
}
interface Resource {
  phase: number; name: string;
  type: "Free" | "Book" | "Paid" | "Tool";
  url: string; desc: string;
}
interface UserData {
  tasks: Record<string, TaskState>;
  videos: Record<string, boolean>;
  interviews: Interview[];
  theme: ThemeKey;
  startDate: string;
}
interface Theme {
  bg: string; surf: string; card: string; border: string;
  text: string; sub: string; accent: string; pill: string; input: string;
}

// ─────────────────────────────────────────────────────────────
// STATIC DATA
// ─────────────────────────────────────────────────────────────

const PHASE_CFG = [
  { id:1, name:"Python Power-Up",    weeks:"Wk 1-2",   e:"🐍", color:"#7C3AED" },
  { id:2, name:"ML Fundamentals",    weeks:"Wk 3-4",   e:"📊", color:"#059669" },
  { id:3, name:"NLP & Transformers", weeks:"Wk 5-8",   e:"🤖", color:"#2563EB" },
  { id:4, name:"LLMs & RAG",         weeks:"Wk 9-11",  e:"💬", color:"#D97706" },
  { id:5, name:"Deploy & MLOps",     weeks:"Wk 12-13", e:"🚀", color:"#DC2626" },
  { id:6, name:"Interview Blitz",    weeks:"Wk 14-24", e:"🎯", color:"#16A34A" },
];

const WEEK_TASKS: WeekTask[] = [
  {id:"w1t1",wk:1,days:"Mon-Tue",phase:1,subtopic:"NumPy arrays, indexing, broadcasting",hrs:"3h",video:"NumPy Full Course — freeCodeCamp",url:"https://youtu.be/QUT1VHiLmmI",checkpoint:"Write 10 array manipulation functions",isProject:false},
  {id:"w1t2",wk:1,days:"Wed-Thu",phase:1,subtopic:"Pandas: DataFrames, groupby, merge, apply",hrs:"3h",video:"Pandas Tutorial — Corey Schafer",url:"https://youtu.be/ZyhVh-qRZPA",checkpoint:"Analyse a CSV dataset end to end",isProject:false},
  {id:"w1t3",wk:1,days:"Fri-Sat",phase:1,subtopic:"OOP: classes, inheritance, dunder methods",hrs:"2.5h",video:"OOP Python — Corey Schafer",url:"https://youtu.be/ZDa-Z5JzLYM",checkpoint:"Build a TextDocument class",isProject:false},
  {id:"w1t4",wk:1,days:"Sun",phase:1,subtopic:"RegEx patterns + string manipulation",hrs:"1.5h",video:"RegEx Python — Corey Schafer",url:"https://youtu.be/K8L6KVGG-7o",checkpoint:"Parse 100 sentences with regex",isProject:false},
  {id:"w2t1",wk:2,days:"Mon-Tue",phase:1,subtopic:"Git: commit, branch, PR, merge conflicts",hrs:"2h",video:"Git & GitHub Crash Course — Traversy",url:"https://youtu.be/SWYqp7iY_Tc",checkpoint:"Push your first repo to GitHub",isProject:false},
  {id:"w2t2",wk:2,days:"Wed",phase:1,subtopic:"Virtual envs, pip, requirements.txt, pyproject",hrs:"1.5h",video:"Python Virtual Environments — Corey Schafer",url:"https://youtu.be/Kg1Yvry_Ydk",checkpoint:"Set up clean project structure",isProject:false},
  {id:"w2t3",wk:2,days:"Thu-Fri",phase:1,subtopic:"File I/O, JSON, CSV, error handling",hrs:"2h",video:"Python File Handling — Tech With Tim",url:"https://youtu.be/Uh2ebFW8OYM",checkpoint:"Build CLI text processor",isProject:false},
  {id:"w2t4",wk:2,days:"Sat-Sun",phase:1,subtopic:"PROJECT: CLI Sentiment Scorer — TextBlob",hrs:"4h",video:"TextBlob Tutorial — Python Engineer",url:"https://youtu.be/u5kFBTywPAo",checkpoint:"Deploy CLI app, push to GitHub",isProject:true},
  {id:"w3t1",wk:3,days:"Mon-Tue",phase:2,subtopic:"Probability, Bayes theorem, distributions",hrs:"3h",video:"Bayes Theorem — 3Blue1Brown",url:"https://youtu.be/HZGCoVF3YvM",checkpoint:"Solve 10 Bayes problems",isProject:false},
  {id:"w3t2",wk:3,days:"Wed-Thu",phase:2,subtopic:"TF-IDF, Bag of Words, CountVectorizer",hrs:"3h",video:"TF-IDF Clearly Explained — StatQuest",url:"https://youtu.be/OymqCnh-AaA",checkpoint:"Transform a corpus to TF-IDF matrix",isProject:false},
  {id:"w3t3",wk:3,days:"Fri-Sat",phase:2,subtopic:"Logistic Regression for text classification",hrs:"2.5h",video:"Logistic Regression — StatQuest",url:"https://youtu.be/yIYKR4sgzI8",checkpoint:"Train spam classifier F1 > 0.85",isProject:false},
  {id:"w3t4",wk:3,days:"Sun",phase:2,subtopic:"Train/val/test split, cross-validation, pipelines",hrs:"1.5h",video:"Cross Validation — StatQuest",url:"https://youtu.be/fSytzGwwBVw",checkpoint:"Build sklearn Pipeline",isProject:false},
  {id:"w4t1",wk:4,days:"Mon-Tue",phase:2,subtopic:"Precision, Recall, F1, ROC-AUC for NLP",hrs:"2.5h",video:"ROC & AUC — StatQuest",url:"https://youtu.be/4jRBRDbJemM",checkpoint:"Plot confusion matrix + ROC curve",isProject:false},
  {id:"w4t2",wk:4,days:"Wed-Thu",phase:2,subtopic:"Naive Bayes, SVM for text — compare models",hrs:"3h",video:"Naive Bayes — StatQuest",url:"https://youtu.be/O2L2Uv9pdDA",checkpoint:"Compare 3 classifiers on same dataset",isProject:false},
  {id:"w4t3",wk:4,days:"Fri-Sat",phase:2,subtopic:"FastAPI basics: routes, request models, async",hrs:"3h",video:"FastAPI Full Course — freeCodeCamp",url:"https://youtu.be/0sOvCWFmrtA",checkpoint:"Build /predict endpoint",isProject:false},
  {id:"w4t4",wk:4,days:"Sun",phase:2,subtopic:"PROJECT: Deploy FastAPI to Render (free hosting)",hrs:"2h",video:"Deploy FastAPI — Patrick Loeber",url:"https://youtu.be/SgC6AZss478",checkpoint:"Live URL for text classifier",isProject:true},
  {id:"w5t1",wk:5,days:"Mon-Tue",phase:3,subtopic:"Word embeddings: Word2Vec, GloVe intuition",hrs:"3h",video:"Word2Vec — StatQuest",url:"https://youtu.be/viZrOnJclY0",checkpoint:"Visualise word vectors with PCA",isProject:false},
  {id:"w5t2",wk:5,days:"Wed-Thu",phase:3,subtopic:"RNNs: vanishing gradients, sequence modelling",hrs:"3h",video:"RNN — StatQuest",url:"https://youtu.be/AsNTP8Kwu80",checkpoint:"Implement RNN in PyTorch",isProject:false},
  {id:"w5t3",wk:5,days:"Fri-Sat",phase:3,subtopic:"LSTMs & GRUs — gating mechanisms",hrs:"2.5h",video:"LSTM — StatQuest",url:"https://youtu.be/YCzL96nL7j0",checkpoint:"Build character-level LSTM",isProject:false},
  {id:"w5t4",wk:5,days:"Sun",phase:3,subtopic:"PyTorch tensors, autograd, training loop",hrs:"1.5h",video:"PyTorch Basics — freeCodeCamp",url:"https://youtu.be/c36lUUr864M",checkpoint:"Implement custom training loop",isProject:false},
  {id:"w6t1",wk:6,days:"Mon-Tue",phase:3,subtopic:"Attention mechanism — build from scratch",hrs:"4h",video:"Attention — Andrej Karpathy nanoGPT",url:"https://youtu.be/kCc8FmEb1nY",checkpoint:"Code self-attention in NumPy",isProject:false},
  {id:"w6t2",wk:6,days:"Wed-Thu",phase:3,subtopic:"Transformer architecture — encoder/decoder",hrs:"3h",video:"Illustrated Transformer — Yannic Kilcher",url:"https://youtu.be/TQQlZhbC5ps",checkpoint:"Draw architecture from memory",isProject:false},
  {id:"w6t3",wk:6,days:"Fri",phase:3,subtopic:"BERT: pre-training objectives (MLM, NSP)",hrs:"2h",video:"BERT Explained — CodeEmporium",url:"https://youtu.be/7kLi8u2dJz0",checkpoint:"Summarise BERT paper in 1 page",isProject:false},
  {id:"w6t4",wk:6,days:"Sat-Sun",phase:3,subtopic:"HuggingFace Tokenizers + AutoModel API",hrs:"3h",video:"HuggingFace Course Ch.1-2 — Official",url:"https://youtu.be/00GKzGyWFEs",checkpoint:"Run inference on 3 different models",isProject:false},
  {id:"w7t1",wk:7,days:"Mon-Tue",phase:3,subtopic:"Fine-tuning BERT with Trainer API",hrs:"4h",video:"Fine-tune BERT — Abhishek Thakur",url:"https://youtu.be/hinZO--TEk4",checkpoint:"Fine-tune on SST-2 F1 > 0.90",isProject:false},
  {id:"w7t2",wk:7,days:"Wed-Thu",phase:3,subtopic:"HuggingFace Datasets + evaluate library",hrs:"2.5h",video:"HuggingFace Course Ch.3 — Official",url:"https://youtu.be/eIqykRdX8ik",checkpoint:"Evaluate fine-tuned model properly",isProject:false},
  {id:"w7t3",wk:7,days:"Fri-Sat",phase:3,subtopic:"PROJECT: Deploy model to HuggingFace Spaces",hrs:"3h",video:"Deploy to HF Spaces — Harshit Tyagi",url:"https://youtu.be/RiCQzBluTxU",checkpoint:"Live demo URL on HuggingFace",isProject:true},
  {id:"w7t4",wk:7,days:"Sun",phase:3,subtopic:"GPT architecture: causal LM, autoregressive",hrs:"1.5h",video:"GPT from scratch — Karpathy",url:"https://youtu.be/kCc8FmEb1nY",checkpoint:"Understand token prediction loop",isProject:false},
  {id:"w8t1",wk:8,days:"Mon-Tue",phase:3,subtopic:"LoRA & PEFT: efficient fine-tuning",hrs:"3h",video:"LoRA Explained — Andrej Karpathy",url:"https://youtu.be/dA-NhCtrrVE",checkpoint:"Fine-tune small model with LoRA",isProject:false},
  {id:"w8t2",wk:8,days:"Wed-Sat",phase:3,subtopic:"PROJECT: Sentiment app — BERT fine-tuned",hrs:"6h",video:"End-to-End NLP Project — Krish Naik",url:"https://youtu.be/D9bgjqpSzqA",checkpoint:"GitHub + HuggingFace Spaces live",isProject:true},
  {id:"w8t3",wk:8,days:"Sun",phase:3,subtopic:"Review week: re-read attention paper",hrs:"1h",video:"Attention Is All You Need — Yannic Kilcher",url:"https://youtu.be/iDulhoQ2pro",checkpoint:"Quiz yourself on transformer math",isProject:false},
  {id:"w9t1",wk:9,days:"Mon-Tue",phase:4,subtopic:"Prompt engineering: zero/few-shot, CoT",hrs:"3h",video:"Prompt Engineering — Andrew Ng",url:"https://youtu.be/H4YK_7MAckk",checkpoint:"Write 20 prompts compare outputs",isProject:false},
  {id:"w9t2",wk:9,days:"Wed-Thu",phase:4,subtopic:"LangChain: chains, prompts, output parsers",hrs:"3h",video:"LangChain Crash Course — Patrick Loeber",url:"https://youtu.be/LbT1yp6quS8",checkpoint:"Build a Q&A chain in LangChain",isProject:false},
  {id:"w9t3",wk:9,days:"Fri-Sat",phase:4,subtopic:"Vector embeddings + FAISS similarity search",hrs:"3h",video:"FAISS Tutorial — James Briggs",url:"https://youtu.be/sKyvsdEv6rk",checkpoint:"Index 1000 sentences query top-5",isProject:false},
  {id:"w9t4",wk:9,days:"Sun",phase:4,subtopic:"RAG architecture: retriever + generator",hrs:"1.5h",video:"RAG Explained — IBM Technology",url:"https://youtu.be/T-D1OfcDW1M",checkpoint:"Draw RAG pipeline diagram",isProject:false},
  {id:"w10t1",wk:10,days:"Mon-Tue",phase:4,subtopic:"ChromaDB: persist, add, query collections",hrs:"2.5h",video:"ChromaDB Tutorial — Sam Witteveen",url:"https://youtu.be/3yPBVii7Ct0",checkpoint:"Build persistent vector store",isProject:false},
  {id:"w10t2",wk:10,days:"Wed-Thu",phase:4,subtopic:"LangChain document loaders: PDF, web, CSV",hrs:"3h",video:"LangChain Document Loaders — Greg Kamradt",url:"https://youtu.be/f9_BWhCI4Zo",checkpoint:"Load and chunk a 50-page PDF",isProject:false},
  {id:"w10t3",wk:10,days:"Fri",phase:4,subtopic:"Text splitting strategies + chunk overlap",hrs:"1.5h",video:"Chunking Strategies — Greg Kamradt",url:"https://youtu.be/8OJC21T2SL4",checkpoint:"Test 3 chunking strategies",isProject:false},
  {id:"w10t4",wk:10,days:"Sat-Sun",phase:4,subtopic:"Streamlit for ML UIs — build fast",hrs:"3h",video:"Streamlit Full Tutorial — Tech With Tim",url:"https://youtu.be/VqgUkExPvLY",checkpoint:"Build chatbot UI in Streamlit",isProject:false},
  {id:"w11t1",wk:11,days:"Mon-Tue",phase:4,subtopic:"OpenAI API: completions, embeddings, functions",hrs:"2.5h",video:"OpenAI API Tutorial — freeCodeCamp",url:"https://youtu.be/c-g6epk3fFE",checkpoint:"Call API handle errors stream output",isProject:false},
  {id:"w11t2",wk:11,days:"Wed-Thu",phase:4,subtopic:"RAG evaluation: RAGAS, BLEU, ROUGE",hrs:"2h",video:"Evaluating RAG — Weights & Biases",url:"https://youtu.be/HiapzW9HngI",checkpoint:"Evaluate your RAG pipeline",isProject:false},
  {id:"w11t3",wk:11,days:"Fri-Sun",phase:4,subtopic:"PROJECT: PDF RAG Chatbot — full build",hrs:"8h",video:"Build RAG App — Alejandro AO",url:"https://youtu.be/dXxQ0LR-3Hg",checkpoint:"Streamlit + LangChain + FAISS live",isProject:true},
  {id:"w12t1",wk:12,days:"Mon-Tue",phase:5,subtopic:"Docker: images, containers, Dockerfile",hrs:"3h",video:"Docker Tutorial — TechWorld with Nana",url:"https://youtu.be/3c-iBn73dDE",checkpoint:"Containerise your RAG chatbot",isProject:false},
  {id:"w12t2",wk:12,days:"Wed",phase:5,subtopic:"Docker Compose for multi-service apps",hrs:"1.5h",video:"Docker Compose — TechWorld with Nana",url:"https://youtu.be/DM65_JyGxCo",checkpoint:"Add Redis + app with compose",isProject:false},
  {id:"w12t3",wk:12,days:"Thu-Fri",phase:5,subtopic:"FastAPI advanced: middleware, auth, async",hrs:"3h",video:"FastAPI Advanced — ArjanCodes",url:"https://youtu.be/iWS9ogMPOI0",checkpoint:"Add auth + rate limiting to API",isProject:false},
  {id:"w12t4",wk:12,days:"Sat-Sun",phase:5,subtopic:"GitHub Actions: CI/CD pipeline for ML",hrs:"3h",video:"GitHub Actions — TechWorld with Nana",url:"https://youtu.be/R8_veQiYBjI",checkpoint:"Auto-test + build on every push",isProject:false},
  {id:"w13t1",wk:13,days:"Mon-Tue",phase:5,subtopic:"AWS EC2 or Lambda: deploy Docker container",hrs:"3.5h",video:"Deploy to AWS — Krish Naik",url:"https://youtu.be/8bucgraphql4",checkpoint:"Get public IP/URL for your app",isProject:false},
  {id:"w13t2",wk:13,days:"Wed",phase:5,subtopic:"MLflow: experiment tracking, model registry",hrs:"2h",video:"MLflow Tutorial — Krish Naik",url:"https://youtu.be/qdcHHrsXA48",checkpoint:"Log all experiments with MLflow",isProject:false},
  {id:"w13t3",wk:13,days:"Thu-Fri",phase:5,subtopic:"Monitoring basics: logging, latency, errors",hrs:"2h",video:"ML Monitoring — Chip Huyen",url:"https://youtu.be/TqATacI_3iI",checkpoint:"Add Prometheus metrics to API",isProject:false},
  {id:"w13t4",wk:13,days:"Sat-Sun",phase:5,subtopic:"PROJECT: Cloud-deployed LLM app — live URL",hrs:"5h",video:"Deploy LLM App AWS — Patrick Loeber",url:"https://youtu.be/SgC6AZss478",checkpoint:"Docker + FastAPI + AWS live URL",isProject:true},
  {id:"w14t1",wk:14,days:"Mon-Wed",phase:6,subtopic:"LeetCode: Arrays & Hashmaps (Blind 75 P1)",hrs:"3h",video:"Arrays — NeetCode",url:"https://youtu.be/KLlXCFG5TnA",checkpoint:"Solve 15 easy/medium array problems",isProject:false},
  {id:"w14t2",wk:14,days:"Thu-Fri",phase:6,subtopic:"LeetCode: Two Pointers & Sliding Window",hrs:"2.5h",video:"Two Pointers — NeetCode",url:"https://youtu.be/jgpkmphgaJE",checkpoint:"Solve 10 two-pointer problems",isProject:false},
  {id:"w14t3",wk:14,days:"Sat-Sun",phase:6,subtopic:"ML theory: loss functions, optimizers, LR",hrs:"3h",video:"Deep Learning Fundamentals — Karpathy",url:"https://youtu.be/VMj-3S1tku0",checkpoint:"Write answers for 30 theory questions",isProject:false},
  {id:"w15t1",wk:15,days:"Mon-Wed",phase:6,subtopic:"LeetCode: Trees & Graphs (Blind 75 P2)",hrs:"3h",video:"Trees — NeetCode",url:"https://youtu.be/OnSn2XEQ4MY",checkpoint:"Solve 12 tree/graph problems",isProject:false},
  {id:"w15t2",wk:15,days:"Thu-Fri",phase:6,subtopic:"LeetCode: Dynamic Programming (Blind 75 P3)",hrs:"3h",video:"DP — NeetCode",url:"https://youtu.be/73r3KWiEvyk",checkpoint:"Solve 10 DP problems",isProject:false},
  {id:"w15t3",wk:15,days:"Sat-Sun",phase:6,subtopic:"NLP theory: BERT, attention, RAG, RLHF, LoRA",hrs:"3h",video:"RLHF Explained — Yannic Kilcher",url:"https://youtu.be/2bonGc9jxbo",checkpoint:"Build Anki deck 100 NLP flashcards",isProject:false},
  {id:"w16t1",wk:16,days:"Mon-Tue",phase:6,subtopic:"SQL: window functions, CTEs, subqueries",hrs:"2.5h",video:"Advanced SQL — Edureka",url:"https://youtu.be/BPHAr4QGGVE",checkpoint:"Solve 20 LeetCode DB problems",isProject:false},
  {id:"w16t2",wk:16,days:"Wed-Thu",phase:6,subtopic:"LLM system design: design a ChatGPT clone",hrs:"3h",video:"LLM System Design — Exponent",url:"https://youtu.be/bSvTVREwSNw",checkpoint:"Write full design doc for RAG system",isProject:false},
  {id:"w16t3",wk:16,days:"Fri-Sat",phase:6,subtopic:"Behavioural: STAR stories, Amazon LPs",hrs:"2.5h",video:"Amazon Behavioural Interview — Exponent",url:"https://youtu.be/6p9Il_j0zjc",checkpoint:"Write 8 STAR stories rehearse 3x",isProject:false},
  {id:"w16t4",wk:16,days:"Sun",phase:6,subtopic:"Mock interview #1 — Pramp",hrs:"1.5h",video:"How to use Pramp — Career Advice",url:"https://youtu.be/dir_rxNfMYM",checkpoint:"Complete + get feedback",isProject:false},
  {id:"w17t1",wk:17,days:"Mon-Wed",phase:6,subtopic:"Resume: quantify impact, ATS keywords",hrs:"2h",video:"ML Resume Tips — Exponent",url:"https://youtu.be/n-NICQ_SWQM",checkpoint:"Get resume reviewed apply to 3 companies",isProject:false},
  {id:"w17t2",wk:17,days:"Thu-Sun",phase:6,subtopic:"Mock interviews #2-4 + revisit weak areas",hrs:"6h",video:"Mock ML Interview — Interviewing.io",url:"https://youtu.be/1qw5ITr3k9E",checkpoint:"Pass 2 of 3 mock technicals",isProject:false},
  {id:"w18t1",wk:18,days:"Mon-Sun",phase:6,subtopic:"APPLY: 5+ applications/week — track all",hrs:"4h/wk",video:"How to get a job at Google — TED Talk",url:"https://youtu.be/CcD9OBPRRok",checkpoint:"5 applications sent this week",isProject:false},
  {id:"w19t1",wk:19,days:"Mon-Sun",phase:6,subtopic:"APPLY: Iterate — prep OAs, phone screens",hrs:"4h/wk",video:"Cracking ML Interviews — Chip Huyen",url:"https://youtu.be/P5JC4p6j4c0",checkpoint:"Complete 2 OAs or phone screens",isProject:false},
  {id:"w20t1",wk:20,days:"Mon-Sun",phase:6,subtopic:"APPLY: System design + onsite prep",hrs:"4h/wk",video:"FAANG ML System Design — Exponent",url:"https://youtu.be/RqTEHSBrYFw",checkpoint:"1 system design mock completed",isProject:false},
  {id:"w21t1",wk:21,days:"Mon-Sun",phase:6,subtopic:"APPLY: Final push — negotiate offers",hrs:"4h/wk",video:"Salary Negotiation — Haseeb Qureshi",url:"https://youtu.be/XY5SeCl_8NE",checkpoint:"Offer in hand negotiate salary",isProject:false},
  {id:"w22t1",wk:22,days:"Mon-Sun",phase:6,subtopic:"Buffer: catch up on any weak phase",hrs:"4h/wk",video:"Review playlist — build your own",url:"",checkpoint:"Review all flagged topics",isProject:false},
  {id:"w23t1",wk:23,days:"Mon-Sun",phase:6,subtopic:"Buffer: extra mock interviews",hrs:"4h/wk",video:"Practice makes perfect",url:"",checkpoint:"5 more applications + 2 mocks",isProject:false},
  {id:"w24t1",wk:24,days:"Mon-Sun",phase:6,subtopic:"OFFER WEEK — final negotiations",hrs:"2h/wk",video:"Job offer negotiation tips",url:"https://youtu.be/XY5SeCl_8NE",checkpoint:"Accept best offer",isProject:false},
];

const VIDEOS = [
  {id:"v1",wk:1,phase:1,title:"NumPy Full Course — freeCodeCamp",url:"https://youtu.be/QUT1VHiLmmI",duration:"3h"},
  {id:"v2",wk:1,phase:1,title:"Pandas Tutorial — Corey Schafer",url:"https://youtu.be/ZyhVh-qRZPA",duration:"3h"},
  {id:"v3",wk:1,phase:1,title:"OOP Python — Corey Schafer",url:"https://youtu.be/ZDa-Z5JzLYM",duration:"2.5h"},
  {id:"v4",wk:1,phase:1,title:"RegEx Python — Corey Schafer",url:"https://youtu.be/K8L6KVGG-7o",duration:"1.5h"},
  {id:"v5",wk:2,phase:1,title:"Git & GitHub Crash Course — Traversy",url:"https://youtu.be/SWYqp7iY_Tc",duration:"2h"},
  {id:"v6",wk:2,phase:1,title:"Python Virtual Environments — Corey Schafer",url:"https://youtu.be/Kg1Yvry_Ydk",duration:"1.5h"},
  {id:"v7",wk:2,phase:1,title:"Python File Handling — Tech With Tim",url:"https://youtu.be/Uh2ebFW8OYM",duration:"2h"},
  {id:"v8",wk:2,phase:1,title:"TextBlob Tutorial — Python Engineer",url:"https://youtu.be/u5kFBTywPAo",duration:"4h"},
  {id:"v9",wk:3,phase:2,title:"Bayes Theorem — 3Blue1Brown",url:"https://youtu.be/HZGCoVF3YvM",duration:"3h"},
  {id:"v10",wk:3,phase:2,title:"TF-IDF Clearly Explained — StatQuest",url:"https://youtu.be/OymqCnh-AaA",duration:"3h"},
  {id:"v11",wk:3,phase:2,title:"Logistic Regression — StatQuest",url:"https://youtu.be/yIYKR4sgzI8",duration:"2.5h"},
  {id:"v12",wk:3,phase:2,title:"Cross Validation — StatQuest",url:"https://youtu.be/fSytzGwwBVw",duration:"1.5h"},
  {id:"v13",wk:4,phase:2,title:"ROC & AUC — StatQuest",url:"https://youtu.be/4jRBRDbJemM",duration:"2.5h"},
  {id:"v14",wk:4,phase:2,title:"Naive Bayes — StatQuest",url:"https://youtu.be/O2L2Uv9pdDA",duration:"3h"},
  {id:"v15",wk:4,phase:2,title:"FastAPI Full Course — freeCodeCamp",url:"https://youtu.be/0sOvCWFmrtA",duration:"3h"},
  {id:"v16",wk:4,phase:2,title:"Deploy FastAPI — Patrick Loeber",url:"https://youtu.be/SgC6AZss478",duration:"2h"},
  {id:"v17",wk:5,phase:3,title:"Word2Vec — StatQuest",url:"https://youtu.be/viZrOnJclY0",duration:"3h"},
  {id:"v18",wk:5,phase:3,title:"RNN — StatQuest",url:"https://youtu.be/AsNTP8Kwu80",duration:"3h"},
  {id:"v19",wk:5,phase:3,title:"LSTM — StatQuest",url:"https://youtu.be/YCzL96nL7j0",duration:"2.5h"},
  {id:"v20",wk:5,phase:3,title:"PyTorch Basics — freeCodeCamp",url:"https://youtu.be/c36lUUr864M",duration:"1.5h"},
  {id:"v21",wk:6,phase:3,title:"Attention — Andrej Karpathy nanoGPT",url:"https://youtu.be/kCc8FmEb1nY",duration:"4h"},
  {id:"v22",wk:6,phase:3,title:"Illustrated Transformer — Yannic Kilcher",url:"https://youtu.be/TQQlZhbC5ps",duration:"3h"},
  {id:"v23",wk:6,phase:3,title:"BERT Explained — CodeEmporium",url:"https://youtu.be/7kLi8u2dJz0",duration:"2h"},
  {id:"v24",wk:6,phase:3,title:"HuggingFace Course Ch.1-2 — Official",url:"https://youtu.be/00GKzGyWFEs",duration:"3h"},
  {id:"v25",wk:7,phase:3,title:"Fine-tune BERT — Abhishek Thakur",url:"https://youtu.be/hinZO--TEk4",duration:"4h"},
  {id:"v26",wk:7,phase:3,title:"HuggingFace Course Ch.3 — Official",url:"https://youtu.be/eIqykRdX8ik",duration:"2.5h"},
  {id:"v27",wk:7,phase:3,title:"Deploy to HuggingFace Spaces — Harshit Tyagi",url:"https://youtu.be/RiCQzBluTxU",duration:"3h"},
  {id:"v28",wk:7,phase:3,title:"GPT from scratch — Karpathy",url:"https://youtu.be/kCc8FmEb1nY",duration:"1.5h"},
  {id:"v29",wk:8,phase:3,title:"LoRA Explained — Andrej Karpathy",url:"https://youtu.be/dA-NhCtrrVE",duration:"3h"},
  {id:"v30",wk:8,phase:3,title:"End-to-End NLP Project — Krish Naik",url:"https://youtu.be/D9bgjqpSzqA",duration:"6h"},
  {id:"v31",wk:8,phase:3,title:"Attention Is All You Need — Yannic Kilcher",url:"https://youtu.be/iDulhoQ2pro",duration:"1h"},
  {id:"v32",wk:9,phase:4,title:"Prompt Engineering — Andrew Ng",url:"https://youtu.be/H4YK_7MAckk",duration:"3h"},
  {id:"v33",wk:9,phase:4,title:"LangChain Crash Course — Patrick Loeber",url:"https://youtu.be/LbT1yp6quS8",duration:"3h"},
  {id:"v34",wk:9,phase:4,title:"FAISS Tutorial — James Briggs",url:"https://youtu.be/sKyvsdEv6rk",duration:"3h"},
  {id:"v35",wk:9,phase:4,title:"RAG Explained — IBM Technology",url:"https://youtu.be/T-D1OfcDW1M",duration:"1.5h"},
  {id:"v36",wk:10,phase:4,title:"ChromaDB Tutorial — Sam Witteveen",url:"https://youtu.be/3yPBVii7Ct0",duration:"2.5h"},
  {id:"v37",wk:10,phase:4,title:"LangChain Document Loaders — Greg Kamradt",url:"https://youtu.be/f9_BWhCI4Zo",duration:"3h"},
  {id:"v38",wk:10,phase:4,title:"Chunking Strategies — Greg Kamradt",url:"https://youtu.be/8OJC21T2SL4",duration:"1.5h"},
  {id:"v39",wk:10,phase:4,title:"Streamlit Full Tutorial — Tech With Tim",url:"https://youtu.be/VqgUkExPvLY",duration:"3h"},
  {id:"v40",wk:11,phase:4,title:"OpenAI API Tutorial — freeCodeCamp",url:"https://youtu.be/c-g6epk3fFE",duration:"2.5h"},
  {id:"v41",wk:11,phase:4,title:"Evaluating RAG — Weights & Biases",url:"https://youtu.be/HiapzW9HngI",duration:"2h"},
  {id:"v42",wk:11,phase:4,title:"Build RAG App — Alejandro AO",url:"https://youtu.be/dXxQ0LR-3Hg",duration:"8h"},
  {id:"v43",wk:12,phase:5,title:"Docker Tutorial — TechWorld with Nana",url:"https://youtu.be/3c-iBn73dDE",duration:"3h"},
  {id:"v44",wk:12,phase:5,title:"Docker Compose — TechWorld with Nana",url:"https://youtu.be/DM65_JyGxCo",duration:"1.5h"},
  {id:"v45",wk:12,phase:5,title:"FastAPI Advanced — ArjanCodes",url:"https://youtu.be/iWS9ogMPOI0",duration:"3h"},
  {id:"v46",wk:12,phase:5,title:"GitHub Actions — TechWorld with Nana",url:"https://youtu.be/R8_veQiYBjI",duration:"3h"},
  {id:"v47",wk:13,phase:5,title:"Deploy to AWS — Krish Naik",url:"https://youtu.be/8bucgraphql4",duration:"3.5h"},
  {id:"v48",wk:13,phase:5,title:"MLflow Tutorial — Krish Naik",url:"https://youtu.be/qdcHHrsXA48",duration:"2h"},
  {id:"v49",wk:13,phase:5,title:"ML Monitoring — Chip Huyen",url:"https://youtu.be/TqATacI_3iI",duration:"2h"},
  {id:"v50",wk:13,phase:5,title:"Deploy LLM App AWS — Patrick Loeber",url:"https://youtu.be/SgC6AZss478",duration:"5h"},
  {id:"v51",wk:14,phase:6,title:"Arrays — NeetCode",url:"https://youtu.be/KLlXCFG5TnA",duration:"3h"},
  {id:"v52",wk:14,phase:6,title:"Two Pointers — NeetCode",url:"https://youtu.be/jgpkmphgaJE",duration:"2.5h"},
  {id:"v53",wk:14,phase:6,title:"Deep Learning Fundamentals — Karpathy",url:"https://youtu.be/VMj-3S1tku0",duration:"3h"},
  {id:"v54",wk:15,phase:6,title:"Trees — NeetCode",url:"https://youtu.be/OnSn2XEQ4MY",duration:"3h"},
  {id:"v55",wk:15,phase:6,title:"DP — NeetCode",url:"https://youtu.be/73r3KWiEvyk",duration:"3h"},
  {id:"v56",wk:15,phase:6,title:"RLHF Explained — Yannic Kilcher",url:"https://youtu.be/2bonGc9jxbo",duration:"3h"},
  {id:"v57",wk:16,phase:6,title:"Advanced SQL — Edureka",url:"https://youtu.be/BPHAr4QGGVE",duration:"2.5h"},
  {id:"v58",wk:16,phase:6,title:"LLM System Design — Exponent",url:"https://youtu.be/bSvTVREwSNw",duration:"3h"},
  {id:"v59",wk:16,phase:6,title:"Amazon Behavioural Interview — Exponent",url:"https://youtu.be/6p9Il_j0zjc",duration:"2.5h"},
  {id:"v60",wk:16,phase:6,title:"How to use Pramp — Career Advice",url:"https://youtu.be/dir_rxNfMYM",duration:"1.5h"},
  {id:"v61",wk:17,phase:6,title:"ML Resume Tips — Exponent",url:"https://youtu.be/n-NICQ_SWQM",duration:"2h"},
  {id:"v62",wk:17,phase:6,title:"Mock ML Interview — Interviewing.io",url:"https://youtu.be/1qw5ITr3k9E",duration:"6h"},
  {id:"v63",wk:18,phase:6,title:"How to get a job at Google — TED Talk",url:"https://youtu.be/CcD9OBPRRok",duration:"15 min"},
  {id:"v64",wk:19,phase:6,title:"Cracking ML Interviews — Chip Huyen",url:"https://youtu.be/P5JC4p6j4c0",duration:"1h"},
  {id:"v65",wk:20,phase:6,title:"FAANG ML System Design — Exponent",url:"https://youtu.be/RqTEHSBrYFw",duration:"1h"},
  {id:"v66",wk:21,phase:6,title:"Salary Negotiation — Haseeb Qureshi",url:"https://youtu.be/XY5SeCl_8NE",duration:"1h"},
];

const RESOURCES: Resource[] = [
  {phase:1,name:"Python OOP — Real Python",type:"Free",url:"https://realpython.com/python3-object-oriented-programming/",desc:"Best OOP guide"},
  {phase:1,name:"Git & GitHub Crash Course — Traversy",type:"Free",url:"https://www.youtube.com/watch?v=SWYqp7iY_Tc",desc:"YouTube 32 min"},
  {phase:1,name:"regex101.com",type:"Tool",url:"https://regex101.com",desc:"Live regex tester"},
  {phase:2,name:"StatQuest — Naive Bayes",type:"Free",url:"https://www.youtube.com/watch?v=O2L2Uv9pdDA",desc:"YouTube Josh Starmer"},
  {phase:2,name:"Hands-On ML — Aurélien Géron",type:"Book",url:"https://www.oreilly.com/library/view/hands-on-machine-learning/9781492032632/",desc:"Best practical ML book"},
  {phase:2,name:"FastAPI Full Course — freeCodeCamp",type:"Free",url:"https://www.youtube.com/watch?v=0sOvCWFmrtA",desc:"YouTube build REST APIs"},
  {phase:2,name:"Scikit-learn User Guide",type:"Free",url:"https://scikit-learn.org/stable/user_guide.html",desc:"Official docs"},
  {phase:3,name:"Illustrated Transformer — Jay Alammar",type:"Free",url:"https://jalammar.github.io/illustrated-transformer/",desc:"Best visual guide"},
  {phase:3,name:"Karpathy — Zero to Hero",type:"Free",url:"https://www.youtube.com/watch?v=kCc8FmEb1nY",desc:"YouTube build GPT from scratch"},
  {phase:3,name:"HuggingFace NLP Course",type:"Free",url:"https://huggingface.co/learn/nlp-course",desc:"Transformers BERT fine-tuning"},
  {phase:3,name:"Andrew Ng — DL Specialization",type:"Free",url:"https://www.coursera.org/specializations/deep-learning",desc:"Coursera audit free"},
  {phase:4,name:"LangChain Crash Course — Patrick Loeber",type:"Free",url:"https://www.youtube.com/watch?v=LbT1yp6quS8",desc:"YouTube LangChain basics"},
  {phase:4,name:"FAISS Tutorial — James Briggs",type:"Free",url:"https://www.youtube.com/watch?v=sKyvsdEv6rk",desc:"YouTube vector search"},
  {phase:4,name:"Build RAG App — Alejandro AO",type:"Free",url:"https://www.youtube.com/watch?v=dXxQ0LR-3Hg",desc:"YouTube full RAG build"},
  {phase:4,name:"OpenAI Prompt Engineering Guide",type:"Free",url:"https://platform.openai.com/docs/guides/prompt-engineering",desc:"Official guide"},
  {phase:5,name:"Docker Tutorial — TechWorld with Nana",type:"Free",url:"https://www.youtube.com/watch?v=3c-iBn73dDE",desc:"YouTube full course"},
  {phase:5,name:"GitHub Actions Docs",type:"Free",url:"https://docs.github.com/en/actions",desc:"CI/CD official docs"},
  {phase:5,name:"Designing ML Systems — Chip Huyen",type:"Book",url:"https://www.oreilly.com/library/view/designing-machine-learning/9781098107956/",desc:"Must-read for FAANG"},
  {phase:6,name:"NeetCode Roadmap",type:"Free",url:"https://neetcode.io/roadmap",desc:"Best Blind 75 guide"},
  {phase:6,name:"ML Interview Q&A — GitHub",type:"Free",url:"https://github.com/khangich/machine-learning-interview",desc:"500+ ML questions"},
  {phase:6,name:"Pramp — free mock interviews",type:"Free",url:"https://www.pramp.com",desc:"Peer coding mocks"},
  {phase:6,name:"Grokking ML Interview",type:"Paid",url:"https://www.educative.io/courses/grokking-the-machine-learning-interview",desc:"System design for ML"},
];

const MILESTONES = [
  {wk:"End Wk 2",  title:"CLI Sentiment Scorer",    detail:"GitHub repo + README",        ph:1},
  {wk:"End Wk 4",  title:"FastAPI Text Classifier",  detail:"Live URL on Render",           ph:2},
  {wk:"End Wk 8",  title:"Fine-tuned BERT App",      detail:"HuggingFace Spaces URL",       ph:3},
  {wk:"End Wk 11", title:"PDF RAG Chatbot",           detail:"Streamlit Cloud / HF Spaces", ph:4},
  {wk:"End Wk 13", title:"Cloud LLM App",             detail:"Docker + AWS/GCP live URL",   ph:5},
  {wk:"Wk 17+",    title:"Job Offer Signed",          detail:"5+ apps/week offer in hand",  ph:6},
];

const STAGES = ["Applied","OA","Phone Screen","Technical","System Design","Onsite","Offer","Rejected"];
const STAGE_CLR: Record<string,string> = {
  Applied:"#6B7280",OA:"#7C3AED","Phone Screen":"#2563EB",
  Technical:"#D97706","System Design":"#059669",
  Onsite:"#F59E0B",Offer:"#16A34A",Rejected:"#9CA3AF",
};

// ─────────────────────────────────────────────────────────────
// THEMES
// ─────────────────────────────────────────────────────────────

const TH: Record<ThemeKey, Theme> = {
  dark: {
    bg:"#06061A",surf:"#0C0C22",card:"#101028",border:"#1C1C3C",
    text:"#E5E3FF",sub:"#6A6890",accent:"#7C3AED",pill:"#14142E",input:"#12122E",
  },
  light: {
    bg:"#F1F0FF",surf:"#FFFFFF",card:"#FFFFFF",border:"#E2DEFF",
    text:"#1A1740",sub:"#6B63A8",accent:"#7C3AED",pill:"#ECEAFF",input:"#F1F0FF",
  },
};

// ─────────────────────────────────────────────────────────────
// LOCAL STORAGE — keyed by Firebase uid
// ─────────────────────────────────────────────────────────────

const SK = (uid: string) => `nlp_24wk_${uid}`;

function loadData(uid: string): UserData | null {
  try { const r = localStorage.getItem(SK(uid)); return r ? JSON.parse(r) : null; }
  catch { return null; }
}
function saveData(uid: string, d: UserData): void {
  try { localStorage.setItem(SK(uid), JSON.stringify(d)); } catch {}
}
function mkDefault(): UserData {
  const tasks: Record<string,TaskState> = {};
  WEEK_TASKS.forEach(t => { tasks[t.id] = "todo"; });
  const vids: Record<string,boolean> = {};
  VIDEOS.forEach(v => { vids[v.id] = false; });
  return { tasks, videos:vids, interviews:[], theme:"dark", startDate:new Date().toISOString().slice(0,10) };
}

// ─────────────────────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────────────────────

const cycle  = (s: TaskState): TaskState => s==="todo"?"in_progress":s==="in_progress"?"done":"todo";
const sIcon  = (s: TaskState) => s==="done"?"✅":s==="in_progress"?"🔵":"⭕";
const sLabel = (s: TaskState) => s==="done"?"Done":s==="in_progress"?"Active":"Todo";

function phaseSt(id: number, tasks: Record<string,TaskState>) {
  const t = WEEK_TASKS.filter(x=>x.phase===id);
  const done = t.filter(x=>tasks[x.id]==="done").length;
  const prog = t.filter(x=>tasks[x.id]==="in_progress").length;
  return {total:t.length,done,prog,pct:t.length?Math.round((done/t.length)*100):0};
}
function totalSt(tasks: Record<string,TaskState>) {
  let done=0,prog=0,todo=0;
  WEEK_TASKS.forEach(t=>{
    if(tasks[t.id]==="done")done++;
    else if(tasks[t.id]==="in_progress")prog++;
    else todo++;
  });
  const total=done+prog+todo;
  return {done,prog,todo,total,pct:Math.round((done/total)*100)||0};
}

// ─────────────────────────────────────────────────────────────
// RESPONSIVE
// ─────────────────────────────────────────────────────────────

function useIsMobile(): boolean {
  const [m,setM] = useState(()=>window.innerWidth<768);
  useEffect(()=>{
    const h=()=>setM(window.innerWidth<768);
    window.addEventListener("resize",h);
    return ()=>window.removeEventListener("resize",h);
  },[]);
  return m;
}

// ─────────────────────────────────────────────────────────────
// SHARED UI
// ─────────────────────────────────────────────────────────────

const Card: FC<{children:ReactNode;style?:React.CSSProperties;th:Theme}> = ({children,style={},th}) => (
  <div style={{background:th.card,border:`1px solid ${th.border}`,borderRadius:14,padding:"1.25rem",...style}}>{children}</div>
);
const SL: FC<{t:string;th:Theme}> = ({t,th}) => (
  <div style={{fontSize:10,color:th.sub,textTransform:"uppercase",letterSpacing:"0.08em",fontWeight:700,marginBottom:8}}>{t}</div>
);

// ─────────────────────────────────────────────────────────────
// ERROR BOUNDARY
// ─────────────────────────────────────────────────────────────

class ErrorBoundary extends React.Component<{children:ReactNode},{hasError:boolean;error?:Error}> {
  constructor(props:{children:ReactNode}){super(props);this.state={hasError:false};}
  static getDerivedStateFromError(e:Error){return{hasError:true,error:e};}
  render(){
    if(this.state.hasError) return (
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:"#1C1C3C",color:"#fff",flexDirection:"column",gap:16,padding:"2rem",textAlign:"center"}}>
        <div style={{fontSize:36}}>⚠️</div>
        <h2 style={{fontSize:20,fontWeight:800}}>Something went wrong</h2>
        <p style={{fontSize:13,color:"#888"}}>{this.state.error?.message}</p>
        <button onClick={()=>window.location.reload()} style={{padding:"10px 24px",borderRadius:8,background:"linear-gradient(135deg,#7C3AED,#2563EB)",color:"#fff",border:"none",fontWeight:700,cursor:"pointer",fontSize:14}}>
          Reload
        </button>
      </div>
    );
    return this.props.children;
  }
}

// ─────────────────────────────────────────────────────────────
// NAV CONFIG
// ─────────────────────────────────────────────────────────────

const NAV: {id:NavPage;e:string;label:string}[] = [
  {id:"dashboard",  e:"📊",label:"Dashboard"},
  {id:"roadmap",    e:"🗺️",label:"Roadmap"},
  {id:"videos",     e:"🎬",label:"Videos"},
  {id:"resources",  e:"📚",label:"Resources"},
  {id:"schedule",   e:"📅",label:"Schedule"},
  {id:"interviews", e:"💼",label:"Jobs"},
];

// ─────────────────────────────────────────────────────────────
// FIREBASE LOGIN PAGE
// ─────────────────────────────────────────────────────────────

function LoginPage({th}:{th:Theme}) {
  const [tab,  setTab]  = useState<"in"|"up">("in");
  const [name, setName] = useState("");
  const [email,setEmail]= useState("");
  const [pass, setPass] = useState("");
  const [err,  setErr]  = useState("");
  const [busy, setBusy] = useState(false);

  const errMsg = (code:string) => {
    if(code==="auth/user-not-found"||code==="auth/invalid-credential") return "No account found with this email.";
    if(code==="auth/wrong-password")     return "Wrong password. Try again.";
    if(code==="auth/email-already-in-use") return "Email already registered — sign in instead.";
    if(code==="auth/weak-password")      return "Password must be at least 6 characters.";
    if(code==="auth/invalid-email")      return "Invalid email address.";
    if(code==="auth/popup-closed-by-user") return "Google sign-in was cancelled.";
    if(code==="auth/popup-blocked")      return "Pop-up blocked. Allow pop-ups for this site.";
    return "Something went wrong. Try again.";
  };

  const emailAuth = async () => {
    setErr(""); setBusy(true);
    try {
      if(tab==="in") {
        await signInWithEmailAndPassword(auth, email.trim(), pass);
      } else {
        if(!name.trim()){setErr("Name is required");setBusy(false);return;}
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
        await updateProfile(cred.user,{displayName:name.trim()});
      }
    } catch(e:any){ setErr(errMsg(e.code)); }
    setBusy(false);
  };

  const googleAuth = async () => {
    setErr(""); setBusy(true);
    try { await signInWithPopup(auth, googleProvider); }
    catch(e:any){ setErr(errMsg(e.code)); }
    setBusy(false);
  };

  const IS: React.CSSProperties = {
    width:"100%",padding:"11px 14px",borderRadius:10,fontSize:14,outline:"none",
    fontFamily:"inherit",transition:"border-color 0.15s",marginBottom:10,
    background:th.input,color:th.text,
  };

  return (
    <div style={{minHeight:"100vh",background:th.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:"1.5rem",fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
      <div style={{width:"100%",maxWidth:420}}>

        {/* Logo + title */}
        <div style={{textAlign:"center",marginBottom:"2rem"}}>
          <div style={{width:72,height:72,borderRadius:22,background:"linear-gradient(135deg,#7C3AED,#2563EB)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,margin:"0 auto 1rem",boxShadow:"0 20px 60px #7C3AED45"}}>🧠</div>
          <h1 style={{fontSize:26,fontWeight:800,color:th.text,margin:"0 0 6px",letterSpacing:"-0.03em"}}>NLP / LLM Journey</h1>
          <p style={{color:th.sub,margin:0,fontSize:13}}>24-week roadmap to Google & Amazon</p>
        </div>

        {/* Card */}
        <div style={{background:th.card,border:`1px solid ${th.border}`,borderRadius:20,padding:"2rem",boxShadow:"0 40px 80px #00000045"}}>

          {/* Tab switcher */}
          <div style={{display:"flex",gap:4,marginBottom:"1.5rem",background:th.input,borderRadius:10,padding:4}}>
            {(["in","up"] as const).map(t=>(
              <button key={t} onClick={()=>{setTab(t);setErr("");}}
                style={{flex:1,padding:"8px",borderRadius:8,border:"none",background:tab===t?th.accent:"transparent",color:tab===t?"#fff":th.sub,fontSize:13,fontWeight:700,cursor:"pointer",transition:"all 0.2s",fontFamily:"inherit"}}>
                {t==="in"?"Sign In":"Sign Up"}
              </button>
            ))}
          </div>

          {/* Fields */}
          {tab==="up"&&(
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your full name"
              style={{...IS,border:`1.5px solid ${name?th.accent:th.border}`}}/>
          )}
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&emailAuth()}
            placeholder="Email address"
            style={{...IS,border:`1.5px solid ${email?th.accent:th.border}`}}/>
          <input type="password" value={pass} onChange={e=>setPass(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&emailAuth()}
            placeholder={tab==="up"?"Password (min 6 chars)":"Password"}
            style={{...IS,border:`1.5px solid ${pass?th.accent:th.border}`,marginBottom:0}}/>

          {/* Error */}
          {err&&(
            <div style={{background:"#FEE2E215",border:"1px solid #DC2626",borderRadius:8,padding:"8px 12px",fontSize:12,color:"#FCA5A5",margin:"10px 0"}}>
              {err}
            </div>
          )}

          {/* Email/pass button */}
          <button onClick={emailAuth} disabled={busy||!email||!pass}
            style={{width:"100%",padding:"12px",borderRadius:10,marginTop:14,background:"linear-gradient(135deg,#7C3AED,#2563EB)",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",border:"none",opacity:(busy||!email||!pass)?0.45:1,boxShadow:"0 4px 20px #7C3AED40",fontFamily:"inherit",transition:"opacity 0.15s"}}>
            {busy?"Please wait…":tab==="in"?"Sign In":"Create Account"}
          </button>

          {/* Divider */}
          <div style={{display:"flex",alignItems:"center",gap:10,margin:"18px 0"}}>
            <div style={{flex:1,height:1,background:th.border}}/>
            <span style={{fontSize:12,color:th.sub}}>or continue with</span>
            <div style={{flex:1,height:1,background:th.border}}/>
          </div>

          {/* Google button */}
          <button onClick={googleAuth} disabled={busy}
            style={{width:"100%",padding:"11px",borderRadius:10,border:`1.5px solid ${th.border}`,background:"transparent",color:th.text,fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10,fontFamily:"inherit",transition:"border-color 0.15s"}}>
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.2l6.7-6.7C35.8 2.4 30.2 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.8 6C12.4 13.3 17.7 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.6 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4 6.9-10 6.9-17z"/>
              <path fill="#FBBC05" d="M10.5 28.7A14.7 14.7 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.8-6A23.8 23.8 0 0 0 0 24c0 3.9.9 7.5 2.7 10.7l7.8-6z"/>
              <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.5-5.8c-2 1.4-4.6 2.2-7.7 2.2-6.3 0-11.6-3.8-13.5-9.2l-7.8 6C6.6 42.6 14.6 48 24 48z"/>
            </svg>
            Continue with Google
          </button>
        </div>

        {/* Stats strip */}
        <div style={{display:"flex",gap:8,marginTop:12}}>
          {([["🗓️",`${WEEK_TASKS.length} tasks`],["🎬",`${VIDEOS.length} videos`],["🚀","6 phases"]] as [string,string][]).map(([e,l])=>(
            <div key={l} style={{flex:1,background:th.surf,border:`1px solid ${th.border}`,borderRadius:10,padding:"10px",textAlign:"center"}}>
              <div style={{fontSize:18,marginBottom:3}}>{e}</div>
              <div style={{fontSize:11,color:th.sub,fontWeight:600}}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MOBILE UI
// ─────────────────────────────────────────────────────────────

function BottomTabBar({page,setPage,th}:{page:NavPage;setPage:(p:NavPage)=>void;th:Theme}) {
  return (
    <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:200,background:th.surf,borderTop:`1px solid ${th.border}`,display:"flex",paddingBottom:"env(safe-area-inset-bottom,0px)"}}>
      {NAV.map(n=>{
        const active=page===n.id;
        return (
          <button key={n.id} onClick={()=>setPage(n.id)}
            style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"8px 2px 10px",background:"transparent",border:"none",cursor:"pointer",color:active?th.accent:th.sub,fontFamily:"inherit",gap:2}}>
            <span style={{fontSize:20,lineHeight:1}}>{n.e}</span>
            <span style={{fontSize:9,fontWeight:active?700:400,lineHeight:1}}>{n.label}</span>
            {active&&<div style={{width:4,height:4,borderRadius:"50%",background:th.accent,marginTop:1}}/>}
          </button>
        );
      })}
    </div>
  );
}

function MobileHeader({user,dark,toggleTheme,logout,th,data}:{
  user:User;dark:boolean;toggleTheme:()=>void;logout:()=>void;th:Theme;data:UserData;
}) {
  const st  = totalSt(data.tasks);
  const nm  = user.displayName||user.email?.split("@")[0]||"You";
  const av  = user.photoURL;
  return (
    <div style={{position:"sticky",top:0,zIndex:100,background:th.surf,borderBottom:`1px solid ${th.border}`,padding:"10px 16px",display:"flex",alignItems:"center",gap:10}}>
      <div style={{width:32,height:32,borderRadius:9,flexShrink:0,background:"linear-gradient(135deg,#7C3AED,#2563EB)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🧠</div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:13,fontWeight:700,color:th.text,lineHeight:1.2}}>NLP Tracker</div>
        <div style={{fontSize:10,color:th.sub}}>{st.pct}% done · {nm}</div>
      </div>
      {av&&<img src={av} alt="" style={{width:28,height:28,borderRadius:"50%",objectFit:"cover",flexShrink:0}}/>}
      <button onClick={toggleTheme} style={{background:"transparent",border:"none",fontSize:18,cursor:"pointer",padding:"4px",flexShrink:0}}>{dark?"☀️":"🌙"}</button>
      <button onClick={logout} style={{fontSize:11,color:th.sub,background:"transparent",border:`1px solid ${th.border}`,padding:"4px 8px",borderRadius:6,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>Out</button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SIDEBAR (desktop)
// ─────────────────────────────────────────────────────────────

function Sidebar({page,setPage,user,data,th,dark,toggleTheme,logout}:{
  page:NavPage;setPage:(p:NavPage)=>void;user:User;data:UserData;
  th:Theme;dark:boolean;toggleTheme:()=>void;logout:()=>void;
}) {
  const nm  = user.displayName||user.email?.split("@")[0]||"You";
  const av  = user.photoURL;
  return (
    <div style={{width:216,minWidth:216,height:"100vh",background:th.surf,borderRight:`1px solid ${th.border}`,display:"flex",flexDirection:"column",padding:"1rem 0.75rem",gap:2,flexShrink:0,overflowY:"auto"}}>
      <div style={{padding:"0.5rem 0.75rem 1rem"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#7C3AED,#2563EB)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>🧠</div>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:th.text,lineHeight:1.2}}>NLP Tracker</div>
            <div style={{fontSize:10,color:th.sub}}>24-week plan</div>
          </div>
        </div>
      </div>

      {NAV.map(n=>{
        const active=page===n.id;
        return (
          <button key={n.id} onClick={()=>setPage(n.id)}
            style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:10,background:active?`${th.accent}18`:"transparent",border:active?`1px solid ${th.accent}30`:"1px solid transparent",color:active?th.accent:th.sub,fontSize:13,fontWeight:active?700:400,cursor:"pointer",textAlign:"left",transition:"all 0.15s",fontFamily:"inherit"}}>
            <span style={{fontSize:14}}>{n.e}</span>{n.label}
            {active&&<div style={{marginLeft:"auto",width:5,height:5,borderRadius:"50%",background:th.accent}}/>}
          </button>
        );
      })}

      <div style={{height:1,background:th.border,margin:"8px 4px"}}/>

      <div style={{padding:"10px 12px",borderRadius:10,background:th.pill}}>
        <div style={{fontSize:10,color:th.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>Phases</div>
        {PHASE_CFG.map(p=>{
          const {pct}=phaseSt(p.id,data.tasks);
          return (
            <div key={p.id} style={{marginBottom:6}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                <span style={{fontSize:10,color:th.sub}}>{p.e} P{p.id}</span>
                <span style={{fontSize:10,color:pct>0?p.color:th.sub,fontWeight:700}}>{pct}%</span>
              </div>
              <div style={{height:3,borderRadius:2,background:th.border}}>
                <div style={{height:"100%",borderRadius:2,background:p.color,width:`${pct}%`,transition:"width 0.4s"}}/>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{flex:1}}/>
      <button onClick={toggleTheme} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",borderRadius:10,border:`1px solid ${th.border}`,background:"transparent",color:th.sub,fontSize:12,cursor:"pointer",marginBottom:6,fontFamily:"inherit"}}>
        {dark?"☀️ Light mode":"🌙 Dark mode"}
      </button>
      <div style={{padding:"10px 12px",borderRadius:10,background:th.pill,border:`1px solid ${th.border}`}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
          {av
            ?<img src={av} alt="" style={{width:28,height:28,borderRadius:"50%",objectFit:"cover",flexShrink:0}}/>
            :<div style={{width:28,height:28,borderRadius:"50%",background:th.accent,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:12,fontWeight:700,flexShrink:0}}>{nm[0].toUpperCase()}</div>
          }
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:12,fontWeight:700,color:th.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{nm}</div>
            <div style={{fontSize:10,color:th.sub,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.email}</div>
          </div>
        </div>
        <button onClick={logout} style={{width:"100%",padding:"5px",borderRadius:6,border:`1px solid ${th.border}`,background:"transparent",color:th.sub,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Sign out</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────────────

function Dashboard({data,th,isMobile}:{data:UserData;th:Theme;isMobile:boolean}) {
  const {tasks,videos,interviews=[],startDate}=data;
  const st   =totalSt(tasks);
  const vidW =Object.values(videos).filter(Boolean).length;
  const days =Math.max(1,Math.floor((Date.now()-new Date(startDate).getTime())/86400000));
  const curP =PHASE_CFG.find(p=>phaseSt(p.id,tasks).pct<100)??PHASE_CFG[5];
  const offers=interviews.filter(i=>i.stage==="Offer").length;
  const donut=[{name:"Done",v:st.done},{name:"Prog",v:st.prog},{name:"Todo",v:st.todo||1}];
  const DC=["#10B981","#7C3AED","#1C1C3C"];
  const bars=PHASE_CFG.map(p=>({n:`P${p.id}`,pct:phaseSt(p.id,tasks).pct}));
  const hmap=Array.from({length:24},(_,i)=>{
    const wt=WEEK_TASKS.filter(t=>t.wk===i+1);
    const done=wt.filter(t=>tasks[t.id]==="done").length;
    return {wk:i+1,pct:wt.length?Math.round((done/wt.length)*100):0};
  });
  const phForWk=(wk:number)=>{
    if(wk<=2)return PHASE_CFG[0];if(wk<=4)return PHASE_CFG[1];
    if(wk<=8)return PHASE_CFG[2];if(wk<=11)return PHASE_CFG[3];
    if(wk<=13)return PHASE_CFG[4];return PHASE_CFG[5];
  };

  return (
    <div style={{maxWidth:1080}}>
      <h1 style={{fontSize:isMobile?20:24,fontWeight:800,color:th.text,margin:"0 0 4px",letterSpacing:"-0.03em"}}>Dashboard</h1>
      <p style={{color:th.sub,margin:"0 0 16px",fontSize:13}}>Target: Google · Amazon · Product-based NLP / LLM roles</p>

      <div style={{display:"grid",gridTemplateColumns:isMobile?"repeat(2,1fr)":"repeat(4,1fr)",gap:10,marginBottom:12}}>
        {[
          {l:"Overall",   v:`${st.pct}%`,       s:`${st.done}/${st.total} done`,c:"#7C3AED",e:"🎯"},
          {l:"Phase",     v:`P${PHASE_CFG.indexOf(curP)+1}`,s:curP.name,       c:curP.color,e:curP.e},
          {l:"Videos",    v:vidW,                s:`of ${VIDEOS.length} total`, c:"#2563EB",e:"🎬"},
          {l:"Day",       v:days,                s:`since ${startDate}`,        c:"#D97706",e:"📅"},
        ].map((s,i)=>(
          <Card key={i} th={th} style={{padding:isMobile?"0.9rem":"1.25rem"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><SL t={s.l} th={th}/><span style={{fontSize:18}}>{s.e}</span></div>
            <div style={{fontSize:isMobile?24:30,fontWeight:800,color:s.c,letterSpacing:"-0.03em",lineHeight:1}}>{s.v}</div>
            <div style={{fontSize:11,color:th.sub,marginTop:5,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.s}</div>
          </Card>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"220px 1fr",gap:10,marginBottom:12}}>
        <Card th={th} style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
          <SL t="Progress" th={th}/>
          <div style={{position:"relative"}}>
            <PieChart width={isMobile?140:160} height={isMobile?140:160}>
              <Pie data={donut} dataKey="v" cx={isMobile?70:80} cy={isMobile?70:80} innerRadius={isMobile?46:52} outerRadius={isMobile?64:72} strokeWidth={0}>
                {donut.map((_,i)=><Cell key={i} fill={DC[i]}/>)}
              </Pie>
            </PieChart>
            <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center",pointerEvents:"none"}}>
              <div style={{fontSize:isMobile?20:24,fontWeight:800,color:th.text}}>{st.pct}%</div>
              <div style={{fontSize:10,color:th.sub}}>done</div>
            </div>
          </div>
          <div style={{display:"flex",gap:14,marginTop:8}}>
            {([["Done","#10B981",st.done],["Active","#7C3AED",st.prog],["Todo","#374151",st.todo]] as [string,string,number][]).map(([l,c,v])=>(
              <div key={l} style={{textAlign:"center"}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:c,margin:"0 auto 3px"}}/>
                <div style={{fontSize:10,color:th.sub}}>{l}</div>
                <div style={{fontSize:13,fontWeight:700,color:th.text}}>{v}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card th={th}>
          <SL t="Phase Completion" th={th}/>
          <ResponsiveContainer width="100%" height={isMobile?150:170}>
            <BarChart data={bars} margin={{top:0,right:4,bottom:0,left:-20}}>
              <XAxis dataKey="n" tick={{fill:th.sub,fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:th.sub,fontSize:10}} axisLine={false} tickLine={false} domain={[0,100]} tickFormatter={(v:number)=>`${v}%`}/>
              <Tooltip contentStyle={{background:th.card,border:`1px solid ${th.border}`,borderRadius:8,fontSize:12,color:th.text}} formatter={(v)=>[`${v}%`,"Complete"]} cursor={{fill:`${th.accent}10`}}/>
              <Bar dataKey="pct" radius={[5,5,0,0]}>
                {bars.map((_,i)=><Cell key={i} fill={PHASE_CFG[i].color}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card th={th} style={{marginBottom:12}}>
        <SL t="24-Week Heatmap" th={th}/>
        <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(24,1fr)",gap:4,minWidth:isMobile?480:"auto"}}>
            {hmap.map((w,i)=>{
              const ph=phForWk(w.wk);
              const op=w.pct===0?0.08:w.pct<50?0.35:w.pct<100?0.65:1;
              return <div key={i} title={`Week ${w.wk}: ${w.pct}%`} style={{aspectRatio:"1",borderRadius:4,background:ph.color,opacity:op,cursor:"default"}}/>;
            })}
          </div>
        </div>
        <div style={{display:"flex",gap:4,marginTop:8,flexWrap:"wrap",alignItems:"center"}}>
          {PHASE_CFG.map(p=>(<div key={p.id} style={{display:"flex",alignItems:"center",gap:4,marginRight:6}}><div style={{width:8,height:8,borderRadius:2,background:p.color}}/><span style={{fontSize:10,color:th.sub}}>{p.e}</span></div>))}
          <div style={{marginLeft:"auto",display:"flex",gap:5,alignItems:"center"}}>
            {[0.08,0.35,0.65,1].map((o,i)=><div key={i} style={{width:10,height:10,borderRadius:2,background:th.accent,opacity:o}}/>)}
            <span style={{fontSize:10,color:th.sub}}>0→100%</span>
          </div>
        </div>
      </Card>

      <Card th={th} style={{marginBottom:12}}>
        <SL t="Milestones" th={th}/>
        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"repeat(3,1fr)",gap:8,marginTop:4}}>
          {MILESTONES.map((m,i)=>{
            const ph=PHASE_CFG[m.ph-1];const {pct}=phaseSt(ph.id,tasks);const done=pct===100;
            return (
              <div key={i} style={{padding:12,borderRadius:10,background:done?`${ph.color}12`:th.surf,border:`1.5px solid ${done?ph.color:th.border}`,transition:"all 0.3s"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                  <span style={{fontSize:10,fontWeight:700,color:ph.color,textTransform:"uppercase",letterSpacing:"0.07em"}}>{m.wk}</span>
                  <span style={{fontSize:16}}>{done?"✅":"⭕"}</span>
                </div>
                <div style={{fontSize:13,fontWeight:700,color:th.text,marginBottom:2}}>{m.title}</div>
                <div style={{fontSize:11,color:th.sub,marginBottom:pct>0&&!done?8:0}}>{m.detail}</div>
                {pct>0&&!done&&<div style={{height:3,borderRadius:2,background:th.border}}><div style={{height:"100%",borderRadius:2,background:ph.color,width:`${pct}%`,transition:"width 0.4s"}}/></div>}
              </div>
            );
          })}
        </div>
      </Card>

      {interviews.length>0&&(
        <Card th={th}>
          <SL t="Interview Pipeline" th={th}/>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            {STAGES.map(s=>{
              const cnt=interviews.filter(i=>i.stage===s).length;
              if(!cnt)return null;
              const c=STAGE_CLR[s]??"#6B7280";
              return <div key={s} style={{padding:"6px 14px",borderRadius:8,background:`${c}15`,border:`1px solid ${c}40`,display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:14,fontWeight:800,color:c}}>{cnt}</span><span style={{fontSize:12,color:th.sub}}>{s}</span></div>;
            })}
            {offers>0&&<div style={{marginLeft:"auto",fontSize:13,fontWeight:700,color:"#16A34A",display:"flex",alignItems:"center",gap:6}}>🎉 {offers} offer{offers>1?"s":""}!</div>}
          </div>
        </Card>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ROADMAP
// ─────────────────────────────────────────────────────────────

function Roadmap({data,update,th,isMobile}:{data:UserData;update:(p:Partial<UserData>)=>void;th:Theme;isMobile:boolean}) {
  const [open,setOpen]=useState<Record<number,boolean>>({1:true});
  const [wkFil,setWkFil]=useState<number|null>(null);
  const tasks=data.tasks;
  const tog=(id:number)=>setOpen(o=>({...o,[id]:!o[id]}));
  const handle=(tid:string)=>update({tasks:{...tasks,[tid]:cycle(tasks[tid] as TaskState)}});

  return (
    <div style={{maxWidth:820}}>
      <h1 style={{fontSize:isMobile?20:24,fontWeight:800,color:th.text,margin:"0 0 4px",letterSpacing:"-0.03em"}}>Roadmap</h1>
      <p style={{color:th.sub,margin:"0 0 14px",fontSize:13}}>Tap a task to cycle: ⭕ Todo → 🔵 Active → ✅ Done</p>
      <div style={{display:"flex",gap:5,flexWrap:isMobile?"nowrap":"wrap",overflowX:isMobile?"auto":"visible",marginBottom:14,paddingBottom:isMobile?6:0,WebkitOverflowScrolling:"touch"}}>
        <button onClick={()=>setWkFil(null)} style={{padding:"4px 12px",borderRadius:6,fontSize:12,fontWeight:600,cursor:"pointer",background:wkFil===null?th.accent:"transparent",border:`1px solid ${wkFil===null?th.accent:th.border}`,color:wkFil===null?"#fff":th.sub,fontFamily:"inherit",flexShrink:0}}>All</button>
        {Array.from({length:24},(_,i)=>i+1).map(w=>(
          <button key={w} onClick={()=>setWkFil(wkFil===w?null:w)} style={{padding:"4px 10px",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer",background:wkFil===w?th.accent:"transparent",border:`1px solid ${wkFil===w?th.accent:th.border}`,color:wkFil===w?"#fff":th.sub,fontFamily:"inherit",flexShrink:0}}>W{w}</button>
        ))}
      </div>
      {PHASE_CFG.map(ph=>{
        const phTasks=WEEK_TASKS.filter(t=>t.phase===ph.id);
        const filtered=wkFil?phTasks.filter(t=>t.wk===wkFil):phTasks;
        if(wkFil&&filtered.length===0)return null;
        const {done,prog,total,pct}=phaseSt(ph.id,tasks);
        const isOpen=open[ph.id];
        const weeks=[...new Set(phTasks.map(t=>t.wk))].sort((a,b)=>a-b);
        return (
          <div key={ph.id} style={{marginBottom:10,background:th.card,border:`1.5px solid ${isOpen?ph.color:th.border}`,borderRadius:14,overflow:"hidden",transition:"border-color 0.2s"}}>
            <div onClick={()=>tog(ph.id)} style={{padding:"12px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:12,background:isOpen?`${ph.color}0A`:"transparent",userSelect:"none"}}>
              <div style={{width:38,height:38,borderRadius:10,background:`${ph.color}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{ph.e}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
                  <span style={{fontSize:13,fontWeight:700,color:th.text}}>{ph.name}</span>
                  <span style={{fontSize:10,padding:"2px 8px",borderRadius:20,background:`${ph.color}18`,color:ph.color,fontWeight:700}}>{ph.weeks}</span>
                  {pct===100&&<span style={{fontSize:10,padding:"2px 8px",borderRadius:20,background:"#10B98118",color:"#10B981",fontWeight:700}}>Complete</span>}
                </div>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:100,height:4,borderRadius:2,background:th.border}}><div style={{height:"100%",borderRadius:2,background:ph.color,width:`${pct}%`,transition:"width 0.4s"}}/></div>
                  <span style={{fontSize:11,color:th.sub,whiteSpace:"nowrap"}}>{done}/{total}{prog>0?` · ${prog} active`:""}</span>
                </div>
              </div>
              <span style={{fontSize:18,color:th.sub,transform:isOpen?"rotate(180deg)":"none",transition:"transform 0.2s",lineHeight:1,flexShrink:0}}>⌄</span>
            </div>
            {isOpen&&(
              <div style={{borderTop:`1px solid ${th.border}`}}>
                {weeks.filter(w=>!wkFil||w===wkFil).map(wk=>{
                  const wkTasks=filtered.filter(t=>t.wk===wk);
                  if(!wkTasks.length)return null;
                  return (
                    <div key={wk}>
                      <div style={{padding:"6px 16px",background:`${ph.color}06`,borderBottom:`1px solid ${th.border}`,display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontSize:11,fontWeight:700,color:ph.color}}>Week {wk}</span>
                        <span style={{fontSize:10,color:th.sub}}>{wkTasks.filter(t=>tasks[t.id]==="done").length}/{wkTasks.length} done</span>
                      </div>
                      {wkTasks.map((t,ti)=>{
                        const st2=(tasks[t.id]??"todo") as TaskState;
                        return (
                          <div key={t.id} onClick={()=>handle(t.id)} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 16px",borderBottom:ti<wkTasks.length-1?`1px solid ${th.border}`:"none",cursor:"pointer",background:st2==="done"?"#10B98106":st2==="in_progress"?`${ph.color}07`:"transparent",transition:"background 0.15s"}}>
                            <span style={{fontSize:16,flexShrink:0,marginTop:1}}>{sIcon(st2)}</span>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",marginBottom:2}}>
                                <span style={{fontSize:13,fontWeight:t.isProject?700:400,color:st2==="done"?th.sub:th.text,textDecoration:st2==="done"?"line-through":"none"}}>{t.subtopic}</span>
                                {t.isProject&&<span style={{fontSize:9,padding:"1px 7px",borderRadius:20,background:`${ph.color}22`,color:ph.color,fontWeight:800,flexShrink:0}}>PROJECT</span>}
                              </div>
                              <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                                <span style={{fontSize:11,color:th.sub}}>{t.days} · {t.hrs}</span>
                                {t.url?<a href={t.url} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{fontSize:10,color:ph.color,fontWeight:700,textDecoration:"none",flexShrink:0}}>▶ {t.video}</a>:<span style={{fontSize:11,color:th.sub}}>{t.video}</span>}
                              </div>
                              <div style={{fontSize:11,color:th.sub,marginTop:3,fontStyle:"italic"}}>🎯 {t.checkpoint}</div>
                            </div>
                            {!isMobile&&<span style={{fontSize:11,color:th.sub,whiteSpace:"nowrap",flexShrink:0}}>{sLabel(st2)}</span>}
                          </div>
                        );
                      })}
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

// ─────────────────────────────────────────────────────────────
// VIDEOS
// ─────────────────────────────────────────────────────────────

function Videos({data,update,th,isMobile}:{data:UserData;update:(p:Partial<UserData>)=>void;th:Theme;isMobile:boolean}) {
  const [phFil,setPhFil]=useState(0);
  const {videos}=data;
  const filtered=VIDEOS.filter(v=>phFil===0||v.phase===phFil);
  const watched=Object.values(videos).filter(Boolean).length;
  const toggle=(id:string)=>update({videos:{...videos,[id]:!videos[id]}});
  return (
    <div style={{maxWidth:920}}>
      <h1 style={{fontSize:isMobile?20:24,fontWeight:800,color:th.text,margin:"0 0 4px",letterSpacing:"-0.03em"}}>Video Library</h1>
      <p style={{color:th.sub,margin:"0 0 14px",fontSize:13}}>{watched} / {VIDEOS.length} watched</p>
      <div style={{display:"flex",gap:6,flexWrap:isMobile?"nowrap":"wrap",overflowX:isMobile?"auto":"visible",marginBottom:14,paddingBottom:isMobile?6:0,WebkitOverflowScrolling:"touch"}}>
        {[{id:0,n:"All",e:"🔍",c:th.accent},...PHASE_CFG.map(p=>({id:p.id,n:`P${p.id}`,e:p.e,c:p.color}))].map(f=>{
          const active=phFil===f.id;
          return <button key={f.id} onClick={()=>setPhFil(f.id)} style={{padding:"5px 14px",borderRadius:20,fontSize:12,fontWeight:600,cursor:"pointer",background:active?`${f.c}20`:"transparent",border:`1.5px solid ${active?f.c:th.border}`,color:active?f.c:th.sub,fontFamily:"inherit",flexShrink:0}}>{f.e} {f.n}</button>;
        })}
      </div>
      <Card th={th} style={{marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:13,fontWeight:600,color:th.text}}>Overall</span><span style={{fontSize:13,fontWeight:700,color:th.accent}}>{Math.round((watched/VIDEOS.length)*100)}%</span></div>
        <div style={{height:6,borderRadius:3,background:th.border}}><div style={{height:"100%",borderRadius:3,background:"linear-gradient(90deg,#7C3AED,#2563EB)",width:`${(watched/VIDEOS.length)*100}%`,transition:"width 0.4s"}}/></div>
        <div style={{display:"flex",gap:14,marginTop:8,flexWrap:"wrap"}}>
          {PHASE_CFG.map(p=>{const pv=VIDEOS.filter(v=>v.phase===p.id);const d=pv.filter(v=>videos[v.id]).length;return <div key={p.id} style={{fontSize:11,color:th.sub}}>{p.e} <span style={{color:d===pv.length?p.color:th.sub,fontWeight:600}}>{d}/{pv.length}</span></div>;})}
        </div>
      </Card>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:10}}>
        {filtered.map(v=>{
          const w=videos[v.id];const ph=PHASE_CFG[v.phase-1];
          return (
            <div key={v.id} onClick={()=>toggle(v.id)} style={{background:th.card,border:`1px solid ${w?ph.color:th.border}`,borderRadius:12,padding:"0.9rem",cursor:"pointer",transition:"border-color 0.2s,opacity 0.2s",opacity:w?0.72:1}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <span style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:`${ph.color}18`,color:ph.color,fontWeight:700}}>{ph.e} P{v.phase} · W{v.wk}</span>
                <span style={{fontSize:15}}>{w?"✅":"⭕"}</span>
              </div>
              <div style={{fontSize:13,fontWeight:600,color:w?th.sub:th.text,textDecoration:w?"line-through":"none",lineHeight:1.4,marginBottom:8}}>{v.title}</div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:11,color:th.sub}}>⏱ {v.duration}</span>
                {v.url&&<a href={v.url} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{fontSize:11,color:ph.color,fontWeight:700,textDecoration:"none"}}>▶ Watch</a>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// RESOURCES
// ─────────────────────────────────────────────────────────────

function Resources({th,isMobile}:{th:Theme;isMobile:boolean}) {
  const [phase,setPhase]=useState(0);
  const [type,setType]=useState("All");
  const filtered=RESOURCES.filter(r=>(phase===0||r.phase===phase)&&(type==="All"||r.type===type));
  const typeColors:Record<string,[string,string]>={Free:["#D1FAE5","#065F46"],Book:["#EDE9FE","#4C1D95"],Paid:["#FEF3C7","#92400E"],Tool:["#DBEAFE","#1E40AF"]};
  return (
    <div>
      <h1 style={{fontSize:isMobile?20:24,fontWeight:800,color:th.text,margin:"0 0 4px",letterSpacing:"-0.03em"}}>Resources</h1>
      <p style={{color:th.sub,margin:"0 0 16px",fontSize:13}}>Curated materials for every phase</p>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
        {[{id:0,n:"All",e:"🔍",c:th.accent},...PHASE_CFG.map(p=>({id:p.id,n:`P${p.id}`,e:p.e,c:p.color}))].map(f=>{
          const active=phase===f.id;
          return <button key={f.id} onClick={()=>setPhase(f.id)} style={{padding:"5px 14px",borderRadius:20,fontSize:12,fontWeight:600,cursor:"pointer",background:active?`${f.c}20`:"transparent",border:`1.5px solid ${active?f.c:th.border}`,color:active?f.c:th.sub,fontFamily:"inherit"}}>{f.e} {f.n}</button>;
        })}
      </div>
      <div style={{display:"flex",gap:6,marginBottom:16}}>
        {(["All","Free","Book","Paid","Tool"] as const).map(t=>(
          <button key={t} onClick={()=>setType(t)} style={{padding:"4px 12px",borderRadius:6,fontSize:12,fontWeight:600,cursor:"pointer",background:type===t?th.accent:"transparent",border:`1px solid ${type===t?th.accent:th.border}`,color:type===t?"#fff":th.sub,fontFamily:"inherit"}}>{t}</button>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"repeat(auto-fill,minmax(255px,1fr))",gap:10}}>
        {filtered.map((r,i)=>{
          const ph=PHASE_CFG.find(p=>p.id===r.phase)!;
          const [tbg,tfg]=typeColors[r.type]??["#f3f4f6","#374151"];
          return (
            <div key={i} style={{background:th.card,border:`1px solid ${th.border}`,borderRadius:12,padding:"1rem",display:"flex",flexDirection:"column",gap:8}}>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <span style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:`${ph.color}18`,color:ph.color,fontWeight:700}}>{ph.e} P{r.phase}</span>
                <span style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:tbg,color:tfg,fontWeight:700}}>{r.type}</span>
              </div>
              <div style={{fontSize:13,fontWeight:700,color:th.text,lineHeight:1.35}}>{r.name}</div>
              <div style={{fontSize:12,color:th.sub,flex:1}}>{r.desc}</div>
              <a href={r.url} target="_blank" rel="noopener noreferrer" style={{display:"block",textAlign:"center",padding:"8px",borderRadius:8,background:`${ph.color}14`,border:`1px solid ${ph.color}35`,color:ph.color,fontSize:12,fontWeight:700,textDecoration:"none"}}>Open Resource →</a>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCHEDULE
// ─────────────────────────────────────────────────────────────

function Schedule({th,isMobile}:{th:Theme;isMobile:boolean}) {
  const daily=[
    {time:"7:00-7:30 AM",  act:"Warm-up",      what:"Review yesterday notes + Anki cards",            dur:"30 min",type:"Review",  c:"#7C3AED"},
    {time:"7:30-9:00 AM",  act:"Deep Learning", what:"Watch video resource, take notes, code along",   dur:"90 min",type:"Learn",   c:"#2563EB"},
    {time:"9:00-9:15 AM",  act:"Break",         what:"Walk, water, stretch",                           dur:"15 min",type:"Break",   c:"#6B7280"},
    {time:"9:15-10:15 AM", act:"Hands-on Code", what:"Implement concept from video in VS Code",        dur:"60 min",type:"Build",   c:"#059669"},
    {time:"10:15-10:45 AM",act:"LeetCode",       what:"1-2 problems Mon-Sat, SQL practice Sunday",    dur:"30 min",type:"Practice",c:"#D97706"},
    {time:"Evening (opt)", act:"Project Work",   what:"Phase project — 45 min focused sprint",         dur:"45 min",type:"Build",   c:"#DC2626"},
  ];
  const weekly=[
    {day:"Monday",   focus:"New topic + video",         lc:"Easy",  note:"Set week goals"},
    {day:"Tuesday",  focus:"Continue + implement",       lc:"Medium",note:"Push code"},
    {day:"Wednesday",focus:"New sub-topic + video",      lc:"Medium",note:"Mid-week review"},
    {day:"Thursday", focus:"Continue + mini exercise",   lc:"Medium",note:"Project sprint"},
    {day:"Friday",   focus:"Review week topics",         lc:"Hard",  note:"Write summary"},
    {day:"Saturday", focus:"Full project session",       lc:"—",     note:"Deploy something"},
    {day:"Sunday",   focus:"Rest + light Anki review",   lc:"SQL",   note:"Plan next week"},
  ];
  return (
    <div style={{maxWidth:900}}>
      <h1 style={{fontSize:isMobile?20:24,fontWeight:800,color:th.text,margin:"0 0 4px",letterSpacing:"-0.03em"}}>Daily Schedule</h1>
      <p style={{color:th.sub,margin:"0 0 18px",fontSize:13}}>3.5 hrs/day non-negotiable routine</p>
      <Card th={th} style={{marginBottom:14}}>
        <SL t="Daily Routine" th={th}/>
        {daily.map((s,i)=>(
          <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 0",borderBottom:i<daily.length-1?`1px solid ${th.border}`:"none"}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:s.c,flexShrink:0,marginTop:5}}/>
            <div style={{width:isMobile?88:130,flexShrink:0}}><div style={{fontSize:isMobile?10:12,fontWeight:700,color:th.text,lineHeight:1.3}}>{s.time}</div></div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2,flexWrap:"wrap"}}>
                <span style={{fontSize:13,fontWeight:700,color:th.text}}>{s.act}</span>
                <span style={{fontSize:10,padding:"2px 8px",borderRadius:20,background:`${s.c}15`,color:s.c,fontWeight:700}}>{s.type}</span>
                {!isMobile&&<span style={{fontSize:11,color:th.sub,marginLeft:"auto"}}>{s.dur}</span>}
              </div>
              <div style={{fontSize:12,color:th.sub}}>{s.what}</div>
              {isMobile&&<div style={{fontSize:11,color:th.sub,marginTop:2}}>⏱ {s.dur}</div>}
            </div>
          </div>
        ))}
      </Card>
      <Card th={th}>
        <SL t="Weekly Rhythm" th={th}/>
        <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
          <table style={{width:"100%",borderCollapse:"collapse",minWidth:440}}>
            <thead><tr>{["Day","Morning Focus","LeetCode","Notes"].map(h=><th key={h} style={{textAlign:"left",padding:"6px 10px",fontSize:11,color:th.sub,fontWeight:700,borderBottom:`1px solid ${th.border}`,textTransform:"uppercase",letterSpacing:"0.06em"}}>{h}</th>)}</tr></thead>
            <tbody>
              {weekly.map((d,i)=>(
                <tr key={i} style={{borderBottom:i<weekly.length-1?`1px solid ${th.border}`:"none"}}>
                  <td style={{padding:"9px 10px",fontWeight:700,color:th.text,fontSize:13,whiteSpace:"nowrap"}}>{d.day}</td>
                  <td style={{padding:"9px 10px",fontSize:12,color:th.sub}}>{d.focus}</td>
                  <td style={{padding:"9px 10px"}}><span style={{fontSize:11,padding:"2px 8px",borderRadius:20,background:`${th.accent}15`,color:th.accent,fontWeight:700}}>{d.lc}</span></td>
                  <td style={{padding:"9px 10px",fontSize:12,color:th.sub}}>{d.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// INTERVIEWS
// ─────────────────────────────────────────────────────────────

function Interviews({data,update,th,isMobile}:{data:UserData;update:(p:Partial<UserData>)=>void;th:Theme;isMobile:boolean}) {
  const [show,setShow]=useState(false);
  const [form,setForm]=useState({company:"",role:"",date:new Date().toISOString().slice(0,10),stage:"Applied",notes:""});
  const apps=data.interviews??[];
  const f=<K extends keyof typeof form>(k:K,v:(typeof form)[K])=>setForm(p=>({...p,[k]:v}));
  const IS:React.CSSProperties={width:"100%",padding:"9px 12px",borderRadius:8,border:`1px solid ${th.border}`,background:th.input,color:th.text,fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"inherit"};
  const add=()=>{
    if(!form.company.trim())return;
    update({interviews:[{id:Date.now(),...form,company:form.company.trim(),role:form.role.trim(),notes:form.notes.trim()},...apps]});
    setForm(p=>({...p,company:"",role:"",notes:""}));setShow(false);
  };
  return (
    <div style={{maxWidth:780}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:"1.25rem",gap:10}}>
        <div>
          <h1 style={{fontSize:isMobile?20:24,fontWeight:800,color:th.text,margin:"0 0 4px",letterSpacing:"-0.03em"}}>Interview Log</h1>
          <p style={{color:th.sub,margin:0,fontSize:13}}>Track every application to offer</p>
        </div>
        <button onClick={()=>setShow(s=>!s)} style={{padding:"8px 16px",borderRadius:10,background:show?"transparent":"linear-gradient(135deg,#7C3AED,#2563EB)",color:show?th.sub:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",border:`1px solid ${show?th.border:"transparent"}`,fontFamily:"inherit",whiteSpace:"nowrap",flexShrink:0}}>{show?"Cancel":"+ Add"}</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:isMobile?"repeat(2,1fr)":"repeat(4,1fr)",gap:10,marginBottom:12}}>
        {[{l:"Applied",v:apps.length,c:"#7C3AED"},{l:"Active",v:apps.filter(i=>!["Offer","Rejected"].includes(i.stage)).length,c:"#2563EB"},{l:"Offers",v:apps.filter(i=>i.stage==="Offer").length,c:"#16A34A"},{l:"Rejected",v:apps.filter(i=>i.stage==="Rejected").length,c:"#9CA3AF"}].map((s,i)=>(
          <Card key={i} th={th} style={{textAlign:"center",padding:isMobile?"0.9rem":"1.25rem"}}>
            <div style={{fontSize:isMobile?24:28,fontWeight:800,color:s.c,letterSpacing:"-0.02em"}}>{s.v}</div>
            <div style={{fontSize:11,color:th.sub,marginTop:4}}>{s.l}</div>
          </Card>
        ))}
      </div>
      {show&&(
        <Card th={th} style={{border:`1.5px solid ${th.accent}`,marginBottom:12}}>
          <div style={{fontSize:13,fontWeight:700,color:th.text,marginBottom:12}}>New Application</div>
          <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:8,marginBottom:8}}>
            <input value={form.company} onChange={e=>f("company",e.target.value)} placeholder="Company *" style={IS}/>
            <input value={form.role}    onChange={e=>f("role",e.target.value)}    placeholder="Role"      style={IS}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:8,marginBottom:8}}>
            <input type="date" value={form.date} onChange={e=>f("date",e.target.value)} style={IS}/>
            <select value={form.stage} onChange={e=>f("stage",e.target.value)} style={IS}>{STAGES.map(s=><option key={s}>{s}</option>)}</select>
          </div>
          <input value={form.notes} onChange={e=>f("notes",e.target.value)} placeholder="Notes (optional)" style={IS}/>
          <div style={{display:"flex",gap:8,marginTop:10}}>
            <button onClick={add} style={{padding:"9px 22px",borderRadius:8,background:"linear-gradient(135deg,#7C3AED,#2563EB)",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",border:"none",fontFamily:"inherit"}}>Save</button>
            <button onClick={()=>setShow(false)} style={{padding:"9px 16px",borderRadius:8,background:"transparent",color:th.sub,fontSize:13,cursor:"pointer",border:`1px solid ${th.border}`,fontFamily:"inherit"}}>Cancel</button>
          </div>
        </Card>
      )}
      {apps.length===0?(
        <Card th={th} style={{textAlign:"center",padding:"3rem"}}><div style={{fontSize:44,marginBottom:12}}>💼</div><div style={{fontSize:14,color:th.sub}}>No applications yet. Start applying from Week 17+</div></Card>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {apps.map(a=>{
            const sc=STAGE_CLR[a.stage]??"#6B7280";
            return (
              <div key={a.id} style={{background:th.card,border:`1px solid ${th.border}`,borderRadius:12,padding:"12px 14px",display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:38,height:38,borderRadius:10,background:`${sc}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>{a.stage==="Offer"?"🎉":a.stage==="Rejected"?"❌":"🏢"}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2,flexWrap:"wrap"}}>
                    <span style={{fontSize:13,fontWeight:700,color:th.text}}>{a.company}</span>
                    {a.role&&<span style={{fontSize:12,color:th.sub}}>· {a.role}</span>}
                  </div>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <span style={{fontSize:11,color:th.sub}}>{a.date}</span>
                    {a.notes&&!isMobile&&<span style={{fontSize:11,color:th.sub,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:180}}>· {a.notes}</span>}
                  </div>
                </div>
                <select value={a.stage} onChange={e=>update({interviews:apps.map(i=>i.id===a.id?{...i,stage:e.target.value}:i)})} style={{padding:"5px 8px",borderRadius:8,border:`1.5px solid ${sc}`,background:`${sc}14`,color:sc,fontSize:11,fontWeight:700,cursor:"pointer",outline:"none",flexShrink:0,fontFamily:"inherit"}}>
                  {STAGES.map(s=><option key={s}>{s}</option>)}
                </select>
                <button onClick={()=>update({interviews:apps.filter(i=>i.id!==a.id)})} style={{padding:"5px 8px",borderRadius:8,border:`1px solid ${th.border}`,background:"transparent",color:th.sub,fontSize:12,cursor:"pointer",flexShrink:0,fontFamily:"inherit"}}>✕</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// APP ROOT
// ─────────────────────────────────────────────────────────────

export default function App() {
  const isMobile = useIsMobile();
  const [fbUser,  setFbUser]  = useState<User|null>(null);
  const [authDone,setAuthDone]= useState(false);
  const [data,    setData]    = useState<UserData|null>(null);
  const [page,    setPage]    = useState<NavPage>("dashboard");
  const [dark,    setDark]    = useState(true);
  const th = dark ? TH.dark : TH.light;

  // Listen to Firebase auth state
  useEffect(()=>{
    const unsub = onAuthStateChanged(auth, user=>{
      setFbUser(user);
      setAuthDone(true);
      if(user){
        let d = loadData(user.uid);
        if(!d){ d=mkDefault(); saveData(user.uid,d); }
        setDark(d.theme!=="light");
        setData(d);
      } else {
        setData(null);
      }
    });
    return unsub;
  },[]);

  const update = (patch: Partial<UserData>) => {
    if(!data||!fbUser) return;
    const nd={...data,...patch};
    setData(nd);
    saveData(fbUser.uid, nd);
  };

  const toggleTheme = () => {
    const nd=!dark; setDark(nd);
    if(data&&fbUser) saveData(fbUser.uid,{...data,theme:nd?"dark":"light"});
  };

  const logout = async () => {
    await signOut(auth);
    setData(null); setFbUser(null); setPage("dashboard");
  };

  // Loading spinner while Firebase checks auth
  if(!authDone) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:"#06061A",color:"#7C3AED",fontSize:16,fontFamily:"system-ui",flexDirection:"column",gap:14}}>
      <div style={{fontSize:40}}>🧠</div>
      <div>Loading…</div>
    </div>
  );

  // Not logged in — show Firebase login page
  if(!fbUser || !data) return <LoginPage th={th}/>;

  return (
    <ErrorBoundary>
      <div style={{display:"flex",height:"100vh",background:th.bg,color:th.text,fontFamily:"'Segoe UI',system-ui,Arial,sans-serif",overflow:"hidden"}}>
        {!isMobile&&(
          <Sidebar page={page} setPage={setPage} user={fbUser} data={data} th={th} dark={dark} toggleTheme={toggleTheme} logout={logout}/>
        )}
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0}}>
          {isMobile&&(
            <MobileHeader user={fbUser} dark={dark} toggleTheme={toggleTheme} logout={logout} th={th} data={data}/>
          )}
          <main style={{flex:1,overflow:"auto",padding:isMobile?"0.9rem 0.9rem 5.5rem":"1.75rem 2rem",minWidth:0}}>
            {page==="dashboard"  && <Dashboard  data={data} th={th} isMobile={isMobile}/>}
            {page==="roadmap"    && <Roadmap    data={data} update={update} th={th} isMobile={isMobile}/>}
            {page==="videos"     && <Videos     data={data} update={update} th={th} isMobile={isMobile}/>}
            {page==="resources"  && <Resources  th={th} isMobile={isMobile}/>}
            {page==="schedule"   && <Schedule   th={th} isMobile={isMobile}/>}
            {page==="interviews" && <Interviews data={data} update={update} th={th} isMobile={isMobile}/>}
          </main>
        </div>
        {isMobile&&<BottomTabBar page={page} setPage={setPage} th={th}/>}
      </div>
    </ErrorBoundary>
  );
}