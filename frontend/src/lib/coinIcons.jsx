import React, { useState, useMemo } from "react";

import btcIcon from "../assets/Icons/btc.svg";
import ethIcon from "../assets/Icons/eth.svg";
import solIcon from "../assets/Icons/sol.svg";
import bnbIcon from "../assets/Icons/bnb.svg";
import dotIcon from "../assets/Icons/dot.svg";
import linkIcon from "../assets/Icons/link.svg";
import ltcIcon from "../assets/Icons/ltc.svg";
import arbIcon from "../assets/Icons/arb.svg";
import opIcon from "../assets/Icons/op.svg";
import suiIcon from "../assets/Icons/sui.svg";
import tiaIcon from "../assets/Icons/tia.svg";
import seiIcon from "../assets/Icons/sei.svg";
import ntxLogo from "../assets/images/Logo.png";

const LOCAL_ICONS = {
  BTC: btcIcon,
  ETH: ethIcon,
  SOL: solIcon,
  BNB: bnbIcon,
  DOT: dotIcon,
  LINK: linkIcon,
  LTC: ltcIcon,
  ARB: arbIcon,
  OP: opIcon,
  SUI: suiIcon,
  TIA: tiaIcon,
  SEI: seiIcon,
  NTX: ntxLogo,
};

// High-speed CDN logos for 100+ top cryptocurrencies
const CMC_ICON_MAP = {
  BTC: "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png",
  ETH: "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
  SOL: "https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png",
  BNB: "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png",
  BNT: "https://s2.coinmarketcap.com/static/img/coins/64x64/1727.png",
  XRP: "https://s2.coinmarketcap.com/static/img/coins/64x64/52.png",
  DOGE: "https://s2.coinmarketcap.com/static/img/coins/64x64/74.png",
  ADA: "https://s2.coinmarketcap.com/static/img/coins/64x64/2011.png",
  AVAX: "https://s2.coinmarketcap.com/static/img/coins/64x64/5805.png",
  PEPE: "https://s2.coinmarketcap.com/static/img/coins/64x64/24478.png",
  WIF: "https://s2.coinmarketcap.com/static/img/coins/64x64/28752.png",
  TON: "https://s2.coinmarketcap.com/static/img/coins/64x64/11419.png",
  NOT: "https://s2.coinmarketcap.com/static/img/coins/64x64/31351.png",
  DOGS: "https://s2.coinmarketcap.com/static/img/coins/64x64/32572.png",
  NEAR: "https://s2.coinmarketcap.com/static/img/coins/64x64/6535.png",
  SHIB: "https://s2.coinmarketcap.com/static/img/coins/64x64/5994.png",
  BONK: "https://s2.coinmarketcap.com/static/img/coins/64x64/23095.png",
  FLOKI: "https://s2.coinmarketcap.com/static/img/coins/64x64/10804.png",
  TRX: "https://s2.coinmarketcap.com/static/img/coins/64x64/1958.png",
  MATIC: "https://s2.coinmarketcap.com/static/img/coins/64x64/3890.png",
  POL: "https://s2.coinmarketcap.com/static/img/coins/64x64/28321.png",
  DOT: "https://s2.coinmarketcap.com/static/img/coins/64x64/6636.png",
  LINK: "https://s2.coinmarketcap.com/static/img/coins/64x64/1975.png",
  BCH: "https://s2.coinmarketcap.com/static/img/coins/64x64/1831.png",
  LTC: "https://s2.coinmarketcap.com/static/img/coins/64x64/2.png",
  UNI: "https://s2.coinmarketcap.com/static/img/coins/64x64/7083.png",
  APT: "https://s2.coinmarketcap.com/static/img/coins/64x64/21794.png",
  SUI: "https://s2.coinmarketcap.com/static/img/coins/64x64/20947.png",
  ATOM: "https://s2.coinmarketcap.com/static/img/coins/64x64/3794.png",
  ICP: "https://s2.coinmarketcap.com/static/img/coins/64x64/8916.png",
  ETC: "https://s2.coinmarketcap.com/static/img/coins/64x64/1321.png",
  XLM: "https://s2.coinmarketcap.com/static/img/coins/64x64/512.png",
  XMR: "https://s2.coinmarketcap.com/static/img/coins/64x64/328.png",
  OKB: "https://s2.coinmarketcap.com/static/img/coins/64x64/3897.png",
  FIL: "https://s2.coinmarketcap.com/static/img/coins/64x64/2280.png",
  INJ: "https://s2.coinmarketcap.com/static/img/coins/64x64/7226.png",
  RENDER: "https://s2.coinmarketcap.com/static/img/coins/64x64/5692.png",
  RNDR: "https://s2.coinmarketcap.com/static/img/coins/64x64/5692.png",
  STX: "https://s2.coinmarketcap.com/static/img/coins/64x64/4847.png",
  FET: "https://s2.coinmarketcap.com/static/img/coins/64x64/3773.png",
  TIA: "https://s2.coinmarketcap.com/static/img/coins/64x64/22861.png",
  SEI: "https://s2.coinmarketcap.com/static/img/coins/64x64/23149.png",
  ARB: "https://s2.coinmarketcap.com/static/img/coins/64x64/11841.png",
  OP: "https://s2.coinmarketcap.com/static/img/coins/64x64/11840.png",
  MEME: "https://s2.coinmarketcap.com/static/img/coins/64x64/28301.png",
  ORDI: "https://s2.coinmarketcap.com/static/img/coins/64x64/25028.png",
  AAVE: "https://s2.coinmarketcap.com/static/img/coins/64x64/7278.png",
  ALGO: "https://s2.coinmarketcap.com/static/img/coins/64x64/4030.png",
  APE: "https://s2.coinmarketcap.com/static/img/coins/64x64/18876.png",
  AR: "https://s2.coinmarketcap.com/static/img/coins/64x64/5665.png",
  ASTR: "https://s2.coinmarketcap.com/static/img/coins/64x64/12885.png",
  AXS: "https://s2.coinmarketcap.com/static/img/coins/64x64/6783.png",
  BLUR: "https://s2.coinmarketcap.com/static/img/coins/64x64/23121.png",
  CAKE: "https://s2.coinmarketcap.com/static/img/coins/64x64/7186.png",
  CRV: "https://s2.coinmarketcap.com/static/img/coins/64x64/6538.png",
  DYDX: "https://s2.coinmarketcap.com/static/img/coins/64x64/11156.png",
  EGLD: "https://s2.coinmarketcap.com/static/img/coins/64x64/6850.png",
  EOS: "https://s2.coinmarketcap.com/static/img/coins/64x64/1765.png",
  FLOW: "https://s2.coinmarketcap.com/static/img/coins/64x64/4558.png",
  FTM: "https://s2.coinmarketcap.com/static/img/coins/64x64/3513.png",
  GALA: "https://s2.coinmarketcap.com/static/img/coins/64x64/7080.png",
  GRT: "https://s2.coinmarketcap.com/static/img/coins/64x64/6719.png",
  HBAR: "https://s2.coinmarketcap.com/static/img/coins/64x64/4642.png",
  IMX: "https://s2.coinmarketcap.com/static/img/coins/64x64/10603.png",
  KAVA: "https://s2.coinmarketcap.com/static/img/coins/64x64/4846.png",
  LDO: "https://s2.coinmarketcap.com/static/img/coins/64x64/8000.png",
  MANA: "https://s2.coinmarketcap.com/static/img/coins/64x64/1966.png",
  MKR: "https://s2.coinmarketcap.com/static/img/coins/64x64/1518.png",
  NEO: "https://s2.coinmarketcap.com/static/img/coins/64x64/1376.png",
  QNT: "https://s2.coinmarketcap.com/static/img/coins/64x64/3155.png",
  RUNE: "https://s2.coinmarketcap.com/static/img/coins/64x64/4157.png",
  SAND: "https://s2.coinmarketcap.com/static/img/coins/64x64/5864.png",
  SNX: "https://s2.coinmarketcap.com/static/img/coins/64x64/2586.png",
  THETA: "https://s2.coinmarketcap.com/static/img/coins/64x64/2416.png",
  VET: "https://s2.coinmarketcap.com/static/img/coins/64x64/3077.png",
  WAVES: "https://s2.coinmarketcap.com/static/img/coins/64x64/1274.png",
  WOO: "https://s2.coinmarketcap.com/static/img/coins/64x64/7501.png",
  XTZ: "https://s2.coinmarketcap.com/static/img/coins/64x64/2011.png",
};

/**
 * Clean pair symbol to get pure base currency (e.g., "1000PEPEUSDT" -> "PEPE", "BNB / USDT" -> "BNB")
 */
export function getBaseSymbol(symbol) {
  if (!symbol) return "BTC";
  let s = String(symbol).toUpperCase().trim();
  s = s.replace(/[\/\s\-_]/g, "");
  s = s.replace(/^1000000|^1000|^100/, "");
  s = s.replace(/USDT|USDC|BUSD|PERP|USD/g, "");
  return s || "BTC";
}

/**
 * Returns prioritized list of logo URLs for ANY crypto coin
 */
export function getCoinLogoCandidates(symbol) {
  const base = getBaseSymbol(symbol);
  const candidates = [];

  if (LOCAL_ICONS[base]) {
    candidates.push(LOCAL_ICONS[base]);
  }
  if (CMC_ICON_MAP[base]) {
    candidates.push(CMC_ICON_MAP[base]);
  }
  
  // Binance Official CDN (High reliability for 1000+ tokens)
  candidates.push(`https://bin.bnbstatic.com/static/assets/logos/${base}.png`);
  
  // CryptoIcons GitHub Raw CDN
  candidates.push(`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${base.toLowerCase()}.png`);
  
  // CoinCap Icon CDN
  candidates.push(`https://assets.coincap.io/assets/icons/${base.toLowerCase()}@2x.png`);

  return candidates;
}

/**
 * Universal Coin Icon component supporting 1000+ coins with multi-CDN fallback
 */
export function UniversalCoinIcon({ symbol, size = "w-7 h-7", className = "" }) {
  const candidates = useMemo(() => getCoinLogoCandidates(symbol), [symbol]);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [allFailed, setAllFailed] = useState(false);
  const base = getBaseSymbol(symbol);

  const handleError = () => {
    if (candidateIndex < candidates.length - 1) {
      setCandidateIndex((prev) => prev + 1);
    } else {
      setAllFailed(true);
    }
  };

  if (allFailed) {
    return (
      <div className={`${size} rounded-full bg-mist border border-fog text-carbon font-bold text-xs flex items-center justify-center shrink-0 uppercase ${className}`}>
        {base.charAt(0)}
      </div>
    );
  }

  return (
    <img
      src={candidates[candidateIndex]}
      alt={base}
      onError={handleError}
      className={`${size} rounded-full object-contain shrink-0 ${className}`}
    />
  );
}

export default UniversalCoinIcon;
