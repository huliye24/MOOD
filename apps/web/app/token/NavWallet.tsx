"use client";

import { useEffect, useMemo, useState } from "react";
import { MOOD_TOKEN } from "../../lib/mood-token";

type RequestArguments={method:string;params?:unknown[]|Record<string,unknown>};
type Provider={isMetaMask?:boolean;providers?:Provider[];request(args:RequestArguments):Promise<unknown>;on?(event:string,listener:(value:unknown)=>void):void;removeListener?(event:string,listener:(value:unknown)=>void):void};
type ProviderChoice={id:string;name:string;icon?:string;provider:Provider};
type EthereumWindow=Window&{ethereum?:Provider};
type Detail={info:{uuid:string;name:string;icon:string};provider:Provider};

const BSC_ID=56;
const BSC_HEX="0x38";
const BSC_EXPLORER="https://bscscan.com";
const buttonStyle={minWidth:128,height:44,padding:"0 18px",border:"1px solid #102d2b",borderRadius:999,background:"transparent",color:"#102d2b",fontSize:12,fontWeight:700,letterSpacing:".08em",cursor:"pointer"} as const;
const panelStyle={position:"absolute",right:0,top:"calc(100% + 10px)",zIndex:40,width:320,padding:18,border:"1px solid rgba(16,45,43,.2)",borderRadius:14,background:"#f3f1e9",color:"#102d2b",fontSize:13,lineHeight:1.5,boxShadow:"0 18px 50px rgba(16,45,43,.18)"} as const;

function injectedChoices():ProviderChoice[]{
  if(typeof window==="undefined")return[];
  const injected=(window as EthereumWindow).ethereum;if(!injected)return[];
  const list=injected.providers?.length?injected.providers:[injected];
  return list.map((item,index)=>({id:`injected-${index}`,name:item.isMetaMask?"MetaMask":list.length>1?`Wallet ${index+1}`:"Browser Wallet",provider:item}));
}
function short(address:string){return `${address.slice(0,6)}…${address.slice(-4)}`;}
function errorMessage(error:unknown){
  const value=error as {code?:number;message?:string};
  if(value.code===4001)return"你取消了钱包请求。";
  if(value.code===-32002)return"钱包中已有一个待处理请求，请打开钱包完成。";
  if(value.code===4100)return"钱包拒绝了当前权限，请在扩展中重新授权。";
  return value.message?value.message.slice(0,180):"钱包请求失败，请打开钱包扩展后重试。";
}
function balanceOfData(address:string){return `0x70a08231${address.toLowerCase().replace(/^0x/,"").padStart(64,"0")}`;}
function formatBalance(value:unknown,decimals:number,precision=5){
  const raw=BigInt(String(value));const base=10n**BigInt(decimals);const whole=raw/base;
  const fraction=(raw%base).toString().padStart(decimals,"0").slice(0,precision).replace(/0+$/,"");
  return `${whole.toLocaleString()}${fraction?`.${fraction}`:""}`;
}

export default function NavWallet(){
  const [choices,setChoices]=useState<ProviderChoice[]>([]);
  const [selectedId,setSelectedId]=useState("");
  const [address,setAddress]=useState("");
  const [chainId,setChainId]=useState(0);
  const [bnb,setBnb]=useState("—");
  const [mood,setMood]=useState("—");
  const [open,setOpen]=useState(false);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  const selected=useMemo(()=>choices.find(item=>item.id===selectedId)??choices[0],[choices,selectedId]);

  useEffect(()=>{
    const found=new Map<string,ProviderChoice>();
    for(const item of injectedChoices())found.set(item.id,item);
    const announce=(event:Event)=>{const detail=(event as CustomEvent<Detail>).detail;if(!detail?.provider)return;found.set(detail.info.uuid,{id:detail.info.uuid,name:detail.info.name,icon:detail.info.icon,provider:detail.provider});const values=[...found.values()];setChoices(values);setSelectedId(current=>current||values.find(item=>item.provider.isMetaMask)?.id||values[0]?.id||"");};
    window.addEventListener("eip6963:announceProvider",announce);
    window.dispatchEvent(new Event("eip6963:requestProvider"));
    const values=[...found.values()];setChoices(values);setSelectedId(current=>current||values.find(item=>item.provider.isMetaMask)?.id||values[0]?.id||"");
    return()=>window.removeEventListener("eip6963:announceProvider",announce);
  },[]);

  useEffect(()=>{
    const wallet=selected?.provider;if(!wallet)return;
    const syncAccounts=(value:unknown)=>{const accounts=value as string[];setAddress(accounts[0]??"");};
    const syncChain=(value:unknown)=>setChainId(Number.parseInt(String(value),16));
    void wallet.request({method:"eth_accounts"}).then(syncAccounts).catch(()=>{});
    void wallet.request({method:"eth_chainId"}).then(syncChain).catch(()=>{});
    wallet.on?.("accountsChanged",syncAccounts);wallet.on?.("chainChanged",syncChain);
    return()=>{wallet.removeListener?.("accountsChanged",syncAccounts);wallet.removeListener?.("chainChanged",syncChain);};
  },[selected]);

  useEffect(()=>{
    const wallet=selected?.provider;if(!wallet||!address)return;
    setBnb("读取中");setMood(chainId===BSC_ID?"读取中":"切换至 BSC");
    void wallet.request({method:"eth_getBalance",params:[address,"latest"]}).then(value=>setBnb(formatBalance(value,18))).catch(()=>setBnb("不可用"));
    if(chainId===BSC_ID)void wallet.request({method:"eth_call",params:[{to:MOOD_TOKEN.address,data:balanceOfData(address)},"latest"]}).then(value=>setMood(formatBalance(value,MOOD_TOKEN.decimals,4))).catch(()=>setMood("不可用"));
  },[address,chainId,selected]);

  async function connect(){
    if(!selected){setOpen(true);setMessage("未检测到兼容钱包，请安装 MetaMask。");return;}
    setBusy(true);setMessage("");
    try{
      const accounts=await selected.provider.request({method:"eth_requestAccounts"}) as string[];
      if(!accounts[0])throw new Error("钱包没有返回可用账户。");
      setAddress(accounts[0]);setChainId(Number.parseInt(String(await selected.provider.request({method:"eth_chainId"})),16));setOpen(true);
    }catch(error){setMessage(errorMessage(error));setOpen(true);}finally{setBusy(false);}
  }
  async function switchBSC(){
    if(!selected)return;setBusy(true);setMessage("");
    try{await selected.provider.request({method:"wallet_switchEthereumChain",params:[{chainId:BSC_HEX}]});}
    catch(error){const value=error as {code?:number};if(value.code===4902)try{await selected.provider.request({method:"wallet_addEthereumChain",params:[{chainId:BSC_HEX,chainName:"BNB Smart Chain",nativeCurrency:{name:"BNB",symbol:"BNB",decimals:18},rpcUrls:["https://bsc-dataseed-public.bnbchain.org"],blockExplorerUrls:[BSC_EXPLORER]}]});}catch(addError){setMessage(errorMessage(addError));}else setMessage(errorMessage(error));}
    finally{setBusy(false);}
  }
  async function addMood(){
    if(!selected)return;setBusy(true);setMessage("");
    try{await selected.provider.request({method:"wallet_watchAsset",params:{type:"ERC20",options:{address:MOOD_TOKEN.address,symbol:"MOOD",decimals:MOOD_TOKEN.decimals}}});}
    catch(error){setMessage(errorMessage(error));}finally{setBusy(false);}
  }
  async function disconnect(){
    try{await selected?.provider.request({method:"wallet_revokePermissions",params:[{eth_accounts:{}}]});}catch{}
    setAddress("");setOpen(false);setMessage("");
  }

  if(!address)return <div className="nav-wallet-wrap" style={{position:"relative"}}>
    <button type="button" className="nav-wallet" style={buttonStyle} onClick={connect} disabled={busy}>{busy?"连接中…":"连接钱包"}</button>
    {open&&<div className="nav-wallet-panel" style={panelStyle}>
      <strong style={{display:"block",marginBottom:10}}>选择钱包</strong>
      {choices.length>1&&<select aria-label="选择钱包" value={selectedId} onChange={event=>setSelectedId(event.target.value)} style={{width:"100%",padding:9,marginBottom:10,border:"1px solid #9ca9a5",borderRadius:8,background:"#fff"}}>{choices.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select>}
      {message&&<p role="status" style={{margin:"8px 0",color:"#8a3d2d"}}>{message}</p>}
      {!choices.length&&<a href="https://metamask.io/download/" target="_blank" rel="noreferrer" style={{color:"#007d77"}}>安装 MetaMask ↗</a>}
      <button type="button" onClick={()=>setOpen(false)} style={{marginTop:10,border:0,background:"transparent",color:"#61706e",cursor:"pointer"}}>关闭</button>
    </div>}
  </div>;

  return <div className="nav-wallet-wrap" style={{position:"relative"}}>
    <button type="button" className="nav-wallet connected" style={{...buttonStyle,background:"#102d2b",color:"#fff"}} onClick={()=>setOpen(value=>!value)}><span aria-hidden="true" style={{display:"inline-block",width:7,height:7,borderRadius:"50%",background:"#bcf444",marginRight:7}}/>{short(address)}</button>
    {open&&<div className="nav-wallet-panel" style={panelStyle}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}><div><small style={{color:"#61706e"}}>{selected?.name}</small><strong style={{display:"block",fontFamily:"monospace"}}>{short(address)}</strong></div><button type="button" onClick={()=>void navigator.clipboard.writeText(address)} style={{border:0,background:"transparent",color:"#007d77",cursor:"pointer"}}>复制</button></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,margin:"16px 0"}}><div style={{padding:11,background:"#e8ece4",borderRadius:9}}><small>BNB</small><strong style={{display:"block"}}>{bnb}</strong></div><div style={{padding:11,background:"#e8ece4",borderRadius:9}}><small>MOOD</small><strong style={{display:"block"}}>{mood}</strong></div></div>
      <p style={{margin:"8px 0",color:chainId===BSC_ID?"#007d77":"#8a3d2d"}}>{chainId===BSC_ID?"● BNB Smart Chain":`当前 Chain ID：${chainId||"未知"}`}</p>
      {chainId!==BSC_ID&&<button type="button" onClick={switchBSC} disabled={busy} style={{...buttonStyle,width:"100%",marginBottom:8}}>切换到 BNB Chain</button>}
      {chainId===BSC_ID&&<button type="button" onClick={addMood} disabled={busy} style={{...buttonStyle,width:"100%",marginBottom:8}}>添加 MOOD 到钱包</button>}
      <div style={{display:"flex",justifyContent:"space-between",gap:12,marginTop:10}}><a href={`${BSC_EXPLORER}/address/${address}`} target="_blank" rel="noreferrer" style={{color:"#007d77"}}>区块浏览器 ↗</a><button type="button" onClick={disconnect} style={{border:0,background:"transparent",color:"#8a3d2d",cursor:"pointer"}}>断开</button></div>
      {message&&<p role="status" style={{margin:"10px 0 0",color:"#8a3d2d"}}>{message}</p>}
    </div>}
  </div>;
}
