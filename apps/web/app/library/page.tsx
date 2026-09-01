"use client";
import { useMemo, useState } from "react";
import Link from "next/link";

type DocumentEntry={title:string;description:string;kind:"Canon"|"Protocol";version:string;href:string;rawHref:string;keywords:string[]};
const documents:DocumentEntry[]=[
  {title:"MOOD Canon",description:"The world before the system. MOOD's highest-level conceptual and developmental authority.",kind:"Canon",version:"0.1",href:"/canon",rawHref:"/canon/raw",keywords:["world","authority","principles","worldbuilding"]},
];
export default function LibraryPage(){
  const [query,setQuery]=useState("");const [filter,setFilter]=useState<"All"|DocumentEntry["kind"]>("All");
  const visible=useMemo(()=>{const needle=query.trim().toLowerCase();return documents.filter(document=>{const searchable=[document.title,document.description,document.kind,...document.keywords].join(" ").toLowerCase();return(filter==="All"||document.kind===filter)&&(!needle||searchable.includes(needle));});},[filter,query]);
  return <main className="mood-library">
    <nav className="library-nav" aria-label="Library navigation"><Link className="library-brand" href="/"><img src="/favicon.svg" alt=""/><span>MOOD</span></Link><div><Link href="/">World</Link><span aria-current="page">Library</span></div></nav>
    <header className="library-hero"><p>MOOD · PUBLIC MEMORY</p><h1>Library</h1><p className="library-deck">白皮书、Canon 与未来公开文档的统一入口。文档持续生长，导航保持清晰。</p></header>
    <section className="library-browser" aria-labelledby="documents-title">
      <div className="library-tools"><div><span>EXPLORE THE ARCHIVE</span><h2 id="documents-title">Documents</h2></div><label className="library-search"><span>Search</span><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="搜索标题、主题或关键词"/></label></div>
      <div className="library-filters" aria-label="Document categories">{(["All","Canon","Protocol"] as const).map(item=><button key={item} className={filter===item?"is-active":""} onClick={()=>setFilter(item)}>{item}</button>)}</div>
      <div className="document-grid">{visible.map((document,index)=><article className="document-card" key={document.href}><div className="document-index">{String(index+1).padStart(2,"0")}</div><div className="document-meta"><span>{document.kind}</span><span>Version {document.version}</span></div><h3>{document.title}</h3><p>{document.description}</p><div className="document-actions"><Link href={document.href}>Read document →</Link><a href={document.rawHref} download>Markdown ↓</a></div></article>)}{visible.length===0&&<p className="library-empty">没有找到匹配的文档。</p>}</div>
    </section>
    <footer className="library-footer"><Link className="library-brand" href="/"><img src="/favicon.svg" alt=""/><span>MOOD</span></Link><p>One world. One public memory.</p><a href="https://github.com/huliye24/MOOD" target="_blank" rel="noreferrer">GitHub ↗</a></footer>
  </main>;
}
