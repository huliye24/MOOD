"use client";

import { useWallet } from "../../lib/wallet";

export function WalletLoginButton({ className }: { className: string }) {
  const { state, account, hasWallet, connect, switchToBSC } = useWallet();

  async function handleClick() {
    if (state === "wrongNetwork") {
      await switchToBSC();
      return;
    }
    if (state !== "connected") await connect();
  }

  const label = state === "connecting"
    ? "连接中…"
    : state === "wrongNetwork"
      ? "切换至 BSC"
      : state === "connected" && account
        ? account.addressShort
        : hasWallet
          ? "连接钱包"
          : "未检测到钱包";

  return <button className={className} type="button" onClick={handleClick} disabled={state === "connecting" || (!hasWallet && state === "disconnected")} aria-label={state === "connected" ? `已连接钱包 ${account?.addressShort}` : label}>{label}</button>;
}
