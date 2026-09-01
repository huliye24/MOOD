"use client";
import { useMemo, useState } from "react";
import Link from "next/link";

type DocumentEntry={title:string;description:string;kind:"World"|"Manifesto"|"Canon"|"Protocol";href:string;image:string;keywords:string[];diagram?:boolean};
const documents:DocumentEntry[]=[
  {title:"The World",description:"人类与机器主体共同生活、行动与创造的开放世界。",kind:"World",href:"/world",image:"/mood-civilization.png",keywords:["world","agency","human","machine"]},
  {title:"MOOD Manifesto",description:"关于工作、资本、组织与人机共存的公开信念。",kind:"Manifesto",href:"/manifesto",image:"/mood-road.png",keywords:["belief","culture","society","future"]},
  {title:"MOOD Canon",description:"世界先于系统。MOOD 最高层级的概念与发展权威。",kind:"Canon",href:"/canon",image:"/mood-cafe.png",keywords:["authority","principles","worldbuilding"]},
  {title:"Protocol Architecture",description:"从身份、贡献与证明，走向声誉、权利与协调。",kind:"Protocol",href:"/protocol",image:"/mood-network-cycle.png",keywords:["architecture","proof","reputation","rights"],diagram:true},
  {title:"Human × AI",description:"人类与机器如何在同一协调世界中保持主体性。",kind:"Manifesto",href:"/manifesto/human-ai-coexistence",image:"/mood-leisure.png",keywords:["ai","human","coexistence","agents"]},
  {title:"MOODism：贡献驱动的网络文明",description:"中文思想文稿：从身份驱动走向贡献、信誉与权益。Draft。",kind:"Manifesto",href:"/manifesto/moodism",image:"/mood-road.png",keywords:["moodism","贡献","信誉","权益","network civilization","中文"]},
  {title:"Proof of Intelligence：智能证明",description:"中文概念提案：探索智能贡献的验证、信誉与权益路径。Draft。",kind:"Manifesto",href:"/manifesto/proof-of-intelligence",image:"/mood-network-cycle.png",keywords:["proof of intelligence","poi","智能证明","智能贡献","共识","中文"],diagram:true},
  {title:"MOOD Technical Architecture",description:"中文技术架构概念稿：PoI、贡献证明、信誉、权益与 AI Agent Network。Draft。",kind:"Manifesto",href:"/manifesto/technical-architecture",image:"/mood-network-cycle.png",keywords:["technical architecture","技术架构","poi","contribution proof","reputation","rights","agent network","中文"],diagram:true},
  {title:"MOOD Protocol Specification · Yellow Paper",description:"中文非规范性草案：状态、验证、智能共识、信誉、权益与 Agent 交互。",kind:"Manifesto",href:"/manifesto/protocol-yellow-paper",image:"/mood-network-cycle.png",keywords:["yellow paper","protocol specification","协议规范","状态模型","信誉公式","agent","中文"],diagram:true},
  {title:"MOOD Formal Specification",description:"中文非规范性形式化草案：状态转换、验证逻辑、信誉算法、Agent 共识与经济方程。",kind:"Manifesto",href:"/manifesto/formal-specification",image:"/mood-network-cycle.png",keywords:["formal specification","形式化规范","数学模型","状态转换","验证逻辑","共识","中文"],diagram:true},
  {title:"MOOD Protocol Client Implementation",description:"中文非规范性实现草案：数据结构、合约、Agent Runtime、Proof Engine、信誉数据库与 Genesis。",kind:"Manifesto",href:"/manifesto/client-implementation",image:"/mood-network-cycle.png",keywords:["client implementation","客户端实现","数据结构","smart contract","proof engine","genesis","中文"],diagram:true},
];
export default function LibraryPage(){
  const [query,setQuery]=useState("");const [filter,setFilter]=useState<"All"|DocumentEntry["kind"]>("All");
  const visible=useMemo(()=>{const needle=query.trim().toLowerCase();return documents.filter(document=>{const searchable=[document.title,document.description,document.kind,...document.keywords].join(" ").toLowerCase();return(filter==="All"||document.kind===filter)&&(!needle||searchable.includes(needle));});},[filter,query]);
  return <main className="mood-library">
    <nav className="library-nav" aria-label="Library navigation"><Link className="library-brand" href="/"><img src="/mood-logo.png" alt=""/><span>MOOD</span></Link><div><Link href="/world">World</Link><Link href="/manifesto">Manifesto</Link><Link href="/canon">Canon</Link><span aria-current="page">Library</span></div></nav>
    <header className="library-hero"><img src="/mood-civilization.png" alt="开放世界中的公共花园与知识空间"/><div><p>MOOD · PUBLIC MEMORY</p><h1>Library</h1><p className="library-deck">Ideas, stories and rules from a world in formation.</p></div></header>
    <section className="library-browser" aria-labelledby="documents-title">
      <div className="library-tools"><div><span>EXPLORE THE ARCHIVE</span><h2 id="documents-title">Public memory</h2></div><label className="library-search"><span>Search</span><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="搜索标题或主题"/></label></div>
      <div className="library-filters" aria-label="Document categories">{(["All","World","Manifesto","Canon","Protocol"] as const).map(item=><button key={item} className={filter===item?"is-active":""} onClick={()=>setFilter(item)}>{item}</button>)}</div>
      <div className="document-grid">{visible.map((document,index)=><Link className="document-card" key={document.href} href={document.href}><img className={document.diagram?"is-diagram":undefined} src={document.image} alt=""/><div className="document-card-copy"><div className="document-index">{String(index+1).padStart(2,"0")} · {document.kind}</div><h3>{document.title}</h3><p>{document.description}</p><span>Explore →</span></div></Link>)}{visible.length===0&&<p className="library-empty">没有找到匹配的内容。</p>}</div>
    </section>
    <footer className="library-footer"><Link className="library-brand" href="/"><img src="/mood-logo.png" alt=""/><span>MOOD</span></Link><p>One world. One public memory.</p><a href="https://github.com/huliye24/MOOD" target="_blank" rel="noreferrer">GitHub ↗</a></footer>
  </main>;
}
