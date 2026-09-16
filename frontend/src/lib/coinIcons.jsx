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
import usdtIcon from "../assets/Icons/usdt.svg";
import usdcIcon from "../assets/Icons/usdc.svg";
import xrpIcon from "../assets/Icons/xrp.svg";
import dogeIcon from "../assets/Icons/doge.svg";
import dogsIcon from "../assets/Icons/dogs.png";
import hmstrIcon from "../assets/Icons/hmstr.png";
import catiIcon from "../assets/Icons/cati.png";
import myroIcon from "../assets/Icons/myro.png";
import wifIcon from "../assets/Icons/wif.png";
import flokiIcon from "../assets/Icons/floki.png";
import bonkIcon from "../assets/Icons/bonk.png";
import pepeIcon from "../assets/Icons/pepe.png";
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
  USDT: usdtIcon,
  USDC: usdcIcon,
  XRP: xrpIcon,
  DOGE: dogeIcon,
  DOGS: dogsIcon,
  HMSTR: hmstrIcon,
  HAMSTER: hmstrIcon,
  CATI: catiIcon,
  MYRO: myroIcon,
  WIF: wifIcon,
  FLOKI: flokiIcon,
  BONK: bonkIcon,
  PEPE: pepeIcon,
  NTX: ntxLogo,
};

// 100% Reliable Direct CoinMarketCap PNG Logos (0 CORS, 0 hotlink blocks, loads instantly everywhere)
const AUTHENTIC_COIN_LOGOS = {
  BTC: "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png",
  ETH: "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
  SOL: "https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png",
  BNB: "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png",
  USDT: "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png",
  USDC: "https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png",
  XRP: "https://s2.coinmarketcap.com/static/img/coins/64x64/52.png",
  DOGE: "https://s2.coinmarketcap.com/static/img/coins/64x64/74.png",
  ADA: "https://s2.coinmarketcap.com/static/img/coins/64x64/2011.png",
  AVAX: "https://s2.coinmarketcap.com/static/img/coins/64x64/5805.png",
  SHIB: "https://s2.coinmarketcap.com/static/img/coins/64x64/5994.png",
  PEPE: "https://s2.coinmarketcap.com/static/img/coins/64x64/24478.png",
  WIF: "https://s2.coinmarketcap.com/static/img/coins/64x64/28752.png",
  FLOKI: "https://s2.coinmarketcap.com/static/img/coins/64x64/10804.png",
  BONK: "https://s2.coinmarketcap.com/static/img/coins/64x64/23095.png",
  NOT: "https://s2.coinmarketcap.com/static/img/coins/64x64/31351.png",
  DOGS: "https://s2.coinmarketcap.com/static/img/coins/64x64/32572.png",
  HMSTR: "https://s2.coinmarketcap.com/static/img/coins/64x64/32195.png",
  HAMSTER: "https://s2.coinmarketcap.com/static/img/coins/64x64/32195.png",
  MYRO: "https://s2.coinmarketcap.com/static/img/coins/64x64/28846.png",
  CATI: "https://s2.coinmarketcap.com/static/img/coins/64x64/32880.png",
  POPCAT: "https://s2.coinmarketcap.com/static/img/coins/64x64/28884.png",
  BRETT: "https://s2.coinmarketcap.com/static/img/coins/64x64/29743.png",
  MOG: "https://s2.coinmarketcap.com/static/img/coins/64x64/27659.png",
  MEW: "https://s2.coinmarketcap.com/static/img/coins/64x64/30126.png",
  NEIRO: "https://s2.coinmarketcap.com/static/img/coins/64x64/32417.png",
  TURBO: "https://s2.coinmarketcap.com/static/img/coins/64x64/24911.png",
  MEME: "https://s2.coinmarketcap.com/static/img/coins/64x64/28301.png",
  ORDI: "https://s2.coinmarketcap.com/static/img/coins/64x64/25028.png",
  SATS: "https://s2.coinmarketcap.com/static/img/coins/64x64/28683.png",
  NEAR: "https://s2.coinmarketcap.com/static/img/coins/64x64/6535.png",
  TON: "https://s2.coinmarketcap.com/static/img/coins/64x64/11419.png",
  TRX: "https://s2.coinmarketcap.com/static/img/coins/64x64/1958.png",
  MATIC: "https://s2.coinmarketcap.com/static/img/coins/64x64/3890.png",
  POL: "https://s2.coinmarketcap.com/static/img/coins/64x64/28321.png",
  DOT: "https://s2.coinmarketcap.com/static/img/coins/64x64/6636.png",
  LINK: "https://s2.coinmarketcap.com/static/img/coins/64x64/1975.png",
  LTC: "https://s2.coinmarketcap.com/static/img/coins/64x64/2.png",
  BCH: "https://s2.coinmarketcap.com/static/img/coins/64x64/1831.png",
  UNI: "https://s2.coinmarketcap.com/static/img/coins/64x64/7083.png",
  ATOM: "https://s2.coinmarketcap.com/static/img/coins/64x64/3794.png",
  XLM: "https://s2.coinmarketcap.com/static/img/coins/64x64/512.png",
  XMR: "https://s2.coinmarketcap.com/static/img/coins/64x64/328.png",
  ICP: "https://s2.coinmarketcap.com/static/img/coins/64x64/8916.png",
  ETC: "https://s2.coinmarketcap.com/static/img/coins/64x64/1321.png",
  FIL: "https://s2.coinmarketcap.com/static/img/coins/64x64/2280.png",
  INJ: "https://s2.coinmarketcap.com/static/img/coins/64x64/7226.png",
  RENDER: "https://s2.coinmarketcap.com/static/img/coins/64x64/5692.png",
  RNDR: "https://s2.coinmarketcap.com/static/img/coins/64x64/5692.png",
  STX: "https://s2.coinmarketcap.com/static/img/coins/64x64/4847.png",
  FET: "https://s2.coinmarketcap.com/static/img/coins/64x64/3773.png",
  AAVE: "https://s2.coinmarketcap.com/static/img/coins/64x64/7278.png",
  ALGO: "https://s2.coinmarketcap.com/static/img/coins/64x64/4030.png",
  APE: "https://s2.coinmarketcap.com/static/img/coins/64x64/18876.png",
  AXS: "https://s2.coinmarketcap.com/static/img/coins/64x64/6783.png",
  CAKE: "https://s2.coinmarketcap.com/static/img/coins/64x64/7186.png",
  CRV: "https://s2.coinmarketcap.com/static/img/coins/64x64/6538.png",
  DYDX: "https://s2.coinmarketcap.com/static/img/coins/64x64/11156.png",
  FTM: "https://s2.coinmarketcap.com/static/img/coins/64x64/3513.png",
  GALA: "https://s2.coinmarketcap.com/static/img/coins/64x64/7080.png",
  GRT: "https://s2.coinmarketcap.com/static/img/coins/64x64/6719.png",
  HBAR: "https://s2.coinmarketcap.com/static/img/coins/64x64/4642.png",
  IMX: "https://s2.coinmarketcap.com/static/img/coins/64x64/10603.png",
  LDO: "https://s2.coinmarketcap.com/static/img/coins/64x64/8000.png",
  MANA: "https://s2.coinmarketcap.com/static/img/coins/64x64/1966.png",
  MKR: "https://s2.coinmarketcap.com/static/img/coins/64x64/1518.png",
  SAND: "https://s2.coinmarketcap.com/static/img/coins/64x64/5864.png",
  SNX: "https://s2.coinmarketcap.com/static/img/coins/64x64/2586.png",
  THETA: "https://s2.coinmarketcap.com/static/img/coins/64x64/2416.png",
  VET: "https://s2.coinmarketcap.com/static/img/coins/64x64/3077.png",
};

/**
 * Clean pair symbol to get pure base currency (e.g., "1000PEPEUSDT" -> "PEPE", "USDT-M" -> "USDT")
 */
export function getBaseSymbol(symbol) {
  if (!symbol) return "BTC";
  let s = String(symbol).toUpperCase().trim();
  s = s.replace(/[\/\s\-_]/g, "");
  if (s === "USDT" || s === "USDTM") return "USDT";
  if (s === "USDC" || s === "USDCM") return "USDC";
  if (s === "BUSD" || s === "BUSDM") return "BUSD";
  s = s.replace(/^1000000|^1000|^100/, "");
  s = s.replace(/(USDT|USDC|BUSD|PERP|USD)$/g, "");
  return s || "BTC";
}

/**
 * Returns prioritized list of logo URLs for ANY crypto coin from official CDNs
 */
export function getCoinLogoCandidates(symbol) {
  const base = getBaseSymbol(symbol);
  const candidates = [];

  // 1. Authentic local SVG vector icons
  if (LOCAL_ICONS[base]) {
    candidates.push(LOCAL_ICONS[base]);
  }

  // 2. Direct high-speed CoinMarketCap PNG (100% unblocked, loads instantly on localhost)
  if (AUTHENTIC_COIN_LOGOS[base]) {
    candidates.push(AUTHENTIC_COIN_LOGOS[base]);
  }

  // 3. Binance Official CDN
  candidates.push(`https://bin.bnbstatic.com/static/assets/logos/${base}.png`);

  // 4. Official jsDelivr Cryptocurrency Icons CDN (real vector/PNGs)
  candidates.push(`https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/${base.toLowerCase()}.png`);

  // 5. Official CoinCap CDN
  candidates.push(`https://assets.coincap.io/assets/icons/${base.toLowerCase()}@2x.png`);

  return candidates;
}

/**
 * Universal Coin Icon component rendering authentic official coin logos
 */
export function UniversalCoinIcon({ symbol, size = "w-7 h-7", className = "" }) {
  const base = getBaseSymbol(symbol);
  const candidates = useMemo(() => getCoinLogoCandidates(symbol), [symbol]);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [allFailed, setAllFailed] = useState(false);

  const handleError = () => {
    if (candidateIndex < candidates.length - 1) {
      setCandidateIndex((prev) => prev + 1);
    } else {
      setAllFailed(true);
    }
  };

  if (allFailed || !candidates.length) {
    return (
      <div className={`${size} rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-xs flex items-center justify-center shrink-0 uppercase ${className}`}>
        {base.substring(0, 3)}
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
