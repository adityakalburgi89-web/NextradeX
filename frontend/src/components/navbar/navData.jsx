import {
  TradeUpIcon,
  FlashIcon,
  BotIcon,
  MoneyExchange01Icon,
  UserGroupIcon,
  StarsIcon,
  Activity01Icon,
  CoinsDollarIcon,
  Coins01Icon,
  MarketAnalysisIcon,
  GiftIcon,
  Book01Icon,
  Layers01Icon,
  Globe02Icon,
} from "@hugeicons/core-free-icons";

/**
 * Navbar Mega Menu Configuration Data
 * Pure NexTradeX branded menu options with Hugeicons stroke-rounded crypto icons.
 */

export const TRADE_MENU_DATA = {
  header: {
    title: "Trade",
    description: "Be the first to capture high quality on-chain assets.",
  },
  items: [
    {
      id: "spot",
      title: "Spot Trading",
      description: "Trade crypto with comprehensive tools",
      icon: TradeUpIcon,
      route: "/trade/spot",
      badge: null,
    },
    {
      id: "margin",
      title: "Margin Trading",
      description: "Magnify profits with leverage",
      icon: FlashIcon,
      route: "/trade/margin",
      badge: null,
    },
    {
      id: "bot",
      title: "Trading Bot",
      description: "Automate your trades with algorithmic help",
      icon: BotIcon,
      route: "/trade/bot",
      badge: null,
    },
    {
      id: "convert",
      title: "Convert",
      description: "The easiest way to trade",
      icon: MoneyExchange01Icon,
      route: "/trade/convert",
      badge: null,
    },
    {
      id: "copy",
      title: "Copy Trading",
      description: "Grow your profits with top traders",
      icon: UserGroupIcon,
      route: "/trade/copy",
      badge: null,
    },
    {
      id: "alpha",
      title: "NexTradeX Alpha",
      description: "Capture early on-chain opportunities",
      icon: StarsIcon,
      route: "/trade/alpha",
      badge: "NEW",
    },
  ],
  marketPanel: {
    tabs: ["Majors", "New", "TON", "More"],
    assets: {
      Majors: [
        { symbol: "BTC", name: "Bitcoin", price: "$63,627.40", change: "+1.61%", positive: true },
        { symbol: "ETH", name: "Ethereum", price: "$1,858.00", change: "+0.70%", positive: true },
        { symbol: "SOL", name: "Solana", price: "$73.399", change: "+1.11%", positive: true },
        { symbol: "NTX", name: "NexTradeX Token", price: "$10.45", change: "+0.95%", positive: true },
        { symbol: "AVAX", name: "Avalanche", price: "$24.85", change: "+3.42%", positive: true },
      ],
      New: [
        { symbol: "PEPE", name: "Pepe", price: "$0.000002916", change: "+2.88%", positive: true },
        { symbol: "WIF", name: "dogwifhat", price: "$0.1413", change: "+2.53%", positive: true },
        { symbol: "0G", name: "ZeroGravity", price: "$0.14097", change: "+4.12%", positive: true },
        { symbol: "SUI", name: "Sui Network", price: "$1.6400", change: "+5.20%", positive: true },
      ],
      TON: [
        { symbol: "TON", name: "Toncoin", price: "$5.2400", change: "+1.85%", positive: true },
        { symbol: "NOT", name: "Notcoin", price: "$0.00840", change: "+6.10%", positive: true },
        { symbol: "DOGS", name: "Dogs Token", price: "$0.00062", change: "+3.15%", positive: true },
      ],
      More: [
        { symbol: "XRP", name: "XRP Ledger", price: "$1.0750", change: "+0.58%", positive: true },
        { symbol: "DOGE", name: "Dogecoin", price: "$0.07025", change: "+1.41%", positive: true },
        { symbol: "NEAR", name: "NEAR Protocol", price: "$4.3200", change: "+2.10%", positive: true },
      ],
    },
  },
};

export const DERIVATIVES_MENU_DATA = {
  header: {
    title: "Futures",
    description: "Browse all crypto derivatives",
  },
  items: [
    {
      id: "overview",
      title: "Futures Overview",
      description: "Browse all crypto derivatives",
      icon: Activity01Icon,
      route: "/trade/futures",
      badge: null,
    },
    {
      id: "usd-m",
      title: "USDS-Margined Futures",
      description: "USDS-settled linear contracts",
      icon: CoinsDollarIcon,
      route: "/trade/futures/usds",
      badge: null,
    },
    {
      id: "coin-m",
      title: "Coin-Margined Futures",
      description: "Coin-settled inverse contracts",
      icon: Coins01Icon,
      route: "/trade/futures/coin",
      badge: null,
    },
    {
      id: "stock-index",
      title: "Stock Index Perps",
      description: "Access and trade key global indices",
      icon: MarketAnalysisIcon,
      route: "/trade/futures/stock-index",
      badge: "HOT",
    },
    {
      id: "perks",
      title: "Futures Perks",
      description: "Discover exciting events and exclusive perks",
      icon: GiftIcon,
      route: "/trade/futures/perks",
      badge: null,
    },
  ],
  marketPanel: {
    tabs: ["ALL", "USDT-m", "USDC-m"],
    contracts: {
      ALL: [
        { symbol: "BTCUSDT", type: "Perp", price: "63,627.4", change: "+1.61%", positive: true },
        { symbol: "ETHUSDT", type: "Perp", price: "1,858", change: "+0.70%", positive: true },
        { symbol: "SOLUSDT", type: "Perp", price: "73.399", change: "+1.11%", positive: true },
        { symbol: "WIFUSDT", type: "Perp", price: "0.1413", change: "+2.53%", positive: true },
        { symbol: "PEPEUSDT", type: "Perp", price: "0.000002916", change: "+2.88%", positive: true },
        { symbol: "DOGEUSDT", type: "Perp", price: "0.07025", change: "+1.41%", positive: true },
        { symbol: "XRPUSDT", type: "Perp", price: "1.075", change: "+0.58%", positive: true },
        { symbol: "0GUSDT", type: "Perp", price: "0.14097", change: "+4.12%", positive: true },
      ],
      "USDT-m": [
        { symbol: "BTCUSDT", type: "Perp", price: "63,627.4", change: "+1.61%", positive: true },
        { symbol: "ETHUSDT", type: "Perp", price: "1,858", change: "+0.70%", positive: true },
        { symbol: "SOLUSDT", type: "Perp", price: "73.399", change: "+1.11%", positive: true },
        { symbol: "WIFUSDT", type: "Perp", price: "0.1413", change: "+2.53%", positive: true },
        { symbol: "PEPEUSDT", type: "Perp", price: "0.000002916", change: "+2.88%", positive: true },
      ],
      "USDC-m": [
        { symbol: "BTCPERP", type: "Perp", price: "63,650.0", change: "+1.65%", positive: true },
        { symbol: "ETHPERP", type: "Perp", price: "1,860.5", change: "+0.75%", positive: true },
        { symbol: "SOLPERP", type: "Perp", price: "73.450", change: "+1.15%", positive: true },
      ],
    },
  },
};

export const MORE_MENU_DATA = {
  columns: [
    {
      id: "promotions",
      title: "Promotions",
      icon: GiftIcon,
      items: [
        {
          title: "Events Hub",
          description: "Big rewards and fresh events—no tricks, just perks. See what’s on now!",
          route: "/events",
        },
        {
          title: "Rewards Hub",
          description: "Check here often for new rewards and perks as you trade",
          route: "/rewards",
        },
        {
          title: "NexTradeX Anniversary",
          description: "Celebrate NexTradeX Anniversary — Share 650,000 USDT and Exclusive Rewards!",
          route: "/anniversary",
          badge: "HOT",
        },
        {
          title: "Referral Program",
          description: "Refer friends to earn a 35% commission",
          route: "/referral",
        },
        {
          title: "Affiliate Program",
          description: "Earn up to 60% commission as an agent, community leader, or KOL",
          route: "/affiliate",
        },
        {
          title: "Live",
          description: "Apply and earn up to 70% commission",
          route: "/live",
        },
      ],
    },
    {
      id: "information",
      title: "Information",
      icon: Book01Icon,
      items: [
        {
          title: "Square",
          description: "Discover trending community topics and KOL opportunities",
          route: "/square",
        },
        {
          title: "NexTradeX Learn",
          description: "The best way to learn crypto and web3",
          route: "/learn",
        },
        {
          title: "Knowledge Base",
          description: "Get the clarity and data-driven insights you need to trade with confidence",
          route: "/knowledge-base",
        },
        {
          title: "Announcements",
          description: "Important updates and official news from NexTradeX",
          route: "/announcements",
        },
        {
          title: "Blog",
          description: "The official blog for blockchain insights and analysis",
          route: "/blog",
        },
        {
          title: "News",
          description: "Stay informed with the latest headlines and crypto trends",
          route: "/news",
        },
      ],
    },
    {
      id: "applications",
      title: "Applications",
      icon: Layers01Icon,
      items: [
        {
          title: "Trixie AI Assistant",
          description: "Your personal smart assistant",
          route: "/trixie-explains",
          badge: "AI",
        },
        {
          title: "Community",
          description: "Share airdrops and trading strategies with the community",
          route: "/community",
        },
        {
          title: "Security",
          description: "Keep your assets safe with our protection tools",
          route: "/security",
        },
      ],
    },
    {
      id: "others",
      title: "Others",
      icon: Globe02Icon,
      items: [
        {
          title: "Brand Partnerships",
          description: "Discover our partners",
          route: "/partnerships",
        },
      ],
    },
  ],
};

export const MAIN_NAV_ITEMS = [
  { id: "markets", label: "Markets", type: "link", route: "/markets" },
  { id: "trade", label: "Trade", type: "megamenu", data: TRADE_MENU_DATA },
  { id: "derivatives", label: "Derivatives", type: "megamenu", data: DERIVATIVES_MENU_DATA },
  { id: "docs", label: "Docs", type: "link", route: "/support" },
  { id: "more", label: "More", type: "megamenu", data: MORE_MENU_DATA },
];
