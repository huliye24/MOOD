"use client";

import { useEffect, useState } from "react";

type Provider = {
  isMetaMask?: boolean;
  providers?: Provider[];
  request(args:{method:string;params?:unknown[]}):Promise<unknown>;
  on?(event:string,listener:(value:unknown)=>void):void;
  removeListener?(event:string,listener:(value:unknown)=>void):void;
};

function provider():Provider|undefined {
  if(typeof window==="undefined") return;
  const injected=(window as Window&{ethereum?:Provider}).ethereum;
  if(!injected) return;
  return injected.providers?.find(item=>item.isMetaMask)??injected;
}
function short(address:string){return `${address.slice(0,6)}…${address.slice(-4)}`;}
const buttonStyle={minWidth:128,height:44,padding:"0 18px",border:"1px solid #102d2b",borderRadius:999,background:"transparent",color:"#102d2b",fontSize:12,fontWeight:700,letterSpacing:".08em",cursor:"pointer"} as const;

export default function NavWallet(){
  const [address,setAddress]=useState("");
  const [state,setState]=useState<"idle"|"connecting"|"error">("idle");
  const [message,setMessage]=useState("");

  useEffect(()=>{
    const wallet=provider();if(!wallet)return;
    void wallet.request({method:"eth_accounts"}).then(value=>{const accounts=value as string[];setAddress(accounts[0]??"");}).catch(()=>{});
    const accountsChanged=(value:unknown)=>setAddress((value as string[])[0]??"");
    wallet.on?.("accountsChanged",accountsChanged);
    return()=>wallet.removeListener?.("accountsChanged",accountsChanged);
  },[]);

  async function connect(){
    const wallet=provider();
    if(!wallet){setMessage("未检测到 MetaMask，请先安装钱包扩展。");setState("error");return;}
    setState("connecting");setMessage("");
    try{
      const accounts=await wallet.request({method:"eth_requestAccounts"}) as string[];
      setAddress(accounts[0]??"");setState("idle");
    }catch(error){
      const code=(error as {code?:number}).code;
      setMessage(code===4001?"你取消了钱包授权。":"钱包连接失败，请重试。");setState("error");
    }
  }

  if(address)return <div className="nav-wallet-wrap" style={{position:"relative"}}><button type="button" className="nav-wallet connected" style={{...buttonStyle,background:"#102d2b",color:"#fff"}} title="点击断开本页钱包会话" onClick={()=>setAddress("")}><span aria-hidden="true" style={{display:"inline-block",width:7,height:7,borderRadius:"50%",background:"#bcf444",marginRight:7}}/> {short(address)}</button></div>;
  return <div className="nav-wallet-wrap" style={{position:"relative"}}>
    <button type="button" className="nav-wallet" style={buttonStyle} onClick={connect} disabled={state==="connecting"}>{state==="connecting"?"连接中…":"连接钱包"}</button>
    {state==="error"&&<div className="nav-wallet-error" role="status" style={{position:"absolute",right:0,top:"calc(100% + 10px)",zIndex:30,width:260,padding:14,border:"1px solid rgba(16,45,43,.2)",borderRadius:10,background:"#f3f1e9",color:"#38504e",fontSize:12,lineHeight:1.5,boxShadow:"0 12px 36px rgba(16,45,43,.14)"}}>{message}{!provider()&&<> <a href="https://metamask.io/download/" target="_blank" rel="noreferrer" style={{color:"#007d77"}}>安装 MetaMask ↗</a></>}</div>}
  </div>;
}
