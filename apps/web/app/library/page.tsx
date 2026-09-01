"use client";
import { useMemo, useState } from "react";
import Link from "next/link";

type DocumentEntry={title:string;description:string;kind:"World"|"Manifesto"|"Canon"|"Protocol";href:string;image:string;keywords:string[]};
const documents:DocumentEntry[]=[
  {title:"The World",description:"人类与机器主体共同生活、行动与创造的开放世界。",kind:"World",href:"/world",image:"/mood-civilization.png",keywords:["world","agency","human","machine"]},
  {title:"MOOD Manifesto",description:"关于工作、资本、组织与人机共存的公开信念。",kind:"Manifesto",href:"/manifesto",image:"/mood-road.png",keywords:["belief","culture","society","future"]},
  {title:"MOOD Canon",description:"世界先于系统。MOOD 最高层级的概念与发展权威。",kind:"Canon",href:"/canon",image:"/mood-cafe.png",keywords:["authority","principles","worldbuilding"]},
  {title:"Protocol Architecture",description:"从身份、贡献与证明，走向声誉、权利与协调。",kind:"Protocol",href:"/protocol",image:"/mood-network-cycle.png",keywords:["architecture","proof","reputation","rights"]},
  {title:"Human × AI",description:"人类与机器如何在同一协调世界中保持主体性。",kind:"Manifesto",href:"/manifesto/human-ai-coexistence",image:"/mood-leisure.png",keywords:["ai","human","coexistence","agents"]},
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
      <div className="document-grid">{visible.map((document,index)=><Link className="document-card" key={document.href} href={document.href}><img className={document.kind==="Protocol"?"is-diagram":undefined} src={document.image} alt=""/><div className="document-card-copy"><div className="document-index">{String(index+1).padStart(2,"0")} · {document.kind}</div><h3>{document.title}</h3><p>{document.description}</p><span>Explore →</span></div></Link>)}{visible.length===0&&<p className="library-empty">没有找到匹配的内容。</p>}</div>
    </section>
    <footer className="library-footer"><Link className="library-brand" href="/"><img src="/mood-logo.png" alt=""/><span>MOOD</span></Link><p>One world. One public memory.</p><a href="https://github.com/huliye24/MOOD" target="_blank" rel="noreferrer">GitHub ↗</a></footer>
  </main>;
}
