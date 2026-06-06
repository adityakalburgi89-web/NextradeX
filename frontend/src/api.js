import tradeSoundFile from "./assets/audio/TradeSound.mp3";

// Gate verbose request logging behind an env flag so production builds stay quiet
// and never log auth headers / request payloads.
const DEBUG = process.env.REACT_APP_API_DEBUG === "true";
const log = DEBUG ? console.log.bind(console) : () => {};

// Abort requests that hang so the UI never gets stuck on a permanent spinner.
const REQUEST_TIMEOUT_MS = 20000;

const playTradeSound = () => {
  try {
    const audio = new Audio(tradeSoundFile);
    audio.volume = 0.55;
    // play() returns a promise that rejects under autoplay policies — swallow it.
    const p = audio.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  } catch (e) {
    // Sound is non-critical; never let it break a trade.
  }
};

const DEFAULT_API_BASE_URL = "http://localhost:8080/api";
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || DEFAULT_API_BASE_URL;

export function setAuthToken(token) {
  localStorage.setItem("nextradex_token", token);
  log("[API] Token stored in localStorage");
}

export function getAuthToken() {
  return localStorage.getItem("nextradex_token");
}

export function clearAuthToken() {
  localStorage.removeItem("nextradex_token");
  log("[API] Token cleared from localStorage");
}

export function hasAuthToken() {
  return Boolean(getAuthToken());
}

function authHeaders() {
  const token = getAuthToken();
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
    log("[API] Authorization header set for request");
  } else {
    log("[API] No token found for Authorization header");
  }
  return headers;
}

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

async function handleResponse(res) {
  const text = await res.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!res.ok) {
    const message = data?.message || data?.error || "Request failed";
    console.error("[API] Response error:", message, "Status:", res.status);
    throw new ApiError(message, res.status, data);
  }

  log("[API] Response received successfully");
  return data;
}

function toQueryString(params) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

function createFetchOptions(method = "GET", body = null, headers = {}) {
  const options = {
    method,
    headers,
    // Auth uses a Bearer token in the Authorization header; credentials are kept
    // for the cookie-based OAuth2 authorization-request flow.
    credentials: "include",
  };
  // Abort hung requests so the UI never gets stuck loading forever.
  if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") {
    options.signal = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  }
  if (body) {
    options.body = JSON.stringify(body);
  }
  return options;
}

// AUTH
export async function registerUser(payload) {
  log("[API] POST /auth/register");
  const res = await fetch(`${API_BASE_URL}/auth/register`,
    createFetchOptions("POST", payload, { "Content-Type": "application/json" })
  );
  const data = await handleResponse(res);
  if (data?.data?.token) setAuthToken(data.data.token);
  return data;
}

export async function loginUser(payload) {
  log("[API] POST /auth/login");
  const res = await fetch(`${API_BASE_URL}/auth/login`,
    createFetchOptions("POST", payload, { "Content-Type": "application/json" })
  );
  const data = await handleResponse(res);
  if (data?.data?.token) setAuthToken(data.data.token);
  return data;
}

export async function validateToken() {
  log("[API] GET /auth/validate");
  const res = await fetch(`${API_BASE_URL}/auth/validate`,
    createFetchOptions("GET", null, authHeaders())
  );
  return handleResponse(res);
}

export function googleLogin() {
  log("[API] Redirecting to Google OAuth2 login");
  window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
}

export async function completeProfile(payload) {
  log("[API] POST /oauth2/complete-profile");
  const headers = authHeaders();

  const res = await fetch(`${API_BASE_URL}/oauth2/complete-profile`,
    createFetchOptions("POST", payload, headers)
  );
  const data = await handleResponse(res);
  if (data?.data?.token) setAuthToken(data.data.token);
  return data;
}

export async function fetchUserProfile() {
  log("[API] GET /user/profile");
  const res = await fetch(`${API_BASE_URL}/user/profile`,
    createFetchOptions("GET", null, authHeaders())
  );
  return handleResponse(res);
}

export async function updateUserProfile(payload) {
  log("[API] PUT /user/profile");
  const res = await fetch(`${API_BASE_URL}/user/profile`,
    createFetchOptions("PUT", payload, authHeaders())
  );
  return handleResponse(res);
}

// MARKET
export async function fetchAllPrices() {
  log("[API] GET /market/prices");
  const res = await fetch(`${API_BASE_URL}/market/prices`,
    createFetchOptions("GET")
  );
  return handleResponse(res);
}

export async function fetchPrice(symbol) {
  log("[API] GET /market/price/:symbol");
  const res = await fetch(`${API_BASE_URL}/market/price/${encodeURIComponent(symbol)}`,
    createFetchOptions("GET")
  );
  return handleResponse(res);
}

export async function fetchBinanceSymbols() {
  log("[API] GET /market/binance/symbols");
  const res = await fetch(`${API_BASE_URL}/market/binance/symbols`,
    createFetchOptions("GET")
  );
  return handleResponse(res);
}

// SPOT ORDERS
export async function createSpotOrder(payload) {
  log("[API] POST /orders/spot");
  const res = await fetch(`${API_BASE_URL}/orders/spot`,
    createFetchOptions("POST", payload, authHeaders())
  );
  const data = await handleResponse(res);
  playTradeSound();
  return data;
}

export async function fetchActiveOrders() {
  log("[API] GET /orders/active");
  const res = await fetch(`${API_BASE_URL}/orders/active`,
    createFetchOptions("GET", null, authHeaders())
  );
  return handleResponse(res);
}

export async function fetchOrderHistory() {
  log("[API] GET /orders/history");
  const res = await fetch(`${API_BASE_URL}/orders/history`,
    createFetchOptions("GET", null, authHeaders())
  );
  return handleResponse(res);
}

export async function cancelOrder(orderId) {
  log("[API] DELETE /orders/:id");
  const res = await fetch(`${API_BASE_URL}/orders/${orderId}`,
    createFetchOptions("DELETE", null, authHeaders())
  );
  return handleResponse(res);
}

// WALLETS
export async function fetchWallets() {
  log("[API] GET /wallets");
  const res = await fetch(`${API_BASE_URL}/wallets`,
    createFetchOptions("GET", null, authHeaders())
  );
  return handleResponse(res);
}

export async function fetchWallet(walletType) {
  log("[API] GET /wallets/:type");
  const res = await fetch(`${API_BASE_URL}/wallets/${walletType}`,
    createFetchOptions("GET", null, authHeaders())
  );
  return handleResponse(res);
}

export async function depositToWallet(walletType, amount) {
  log("[API] POST /wallets/deposit", walletType, amount);
  const res = await fetch(`${API_BASE_URL}/wallets/deposit`,
    createFetchOptions("POST", { walletType, amount }, authHeaders())
  );
  return handleResponse(res);
}

export async function transferBetweenWallets(fromWalletType, toWalletType, amount) {
  log("[API] POST /wallets/transfer", fromWalletType, toWalletType, amount);
  const res = await fetch(`${API_BASE_URL}/wallets/transfer`,
    createFetchOptions("POST", { fromWalletType, toWalletType, amount }, authHeaders())
  );
  return handleResponse(res);
}

export async function withdrawFromWallet(walletType, amount, address, network) {
  log("[API] POST /wallets/withdraw", walletType, amount, address, network);
  const res = await fetch(`${API_BASE_URL}/wallets/withdraw`,
    createFetchOptions("POST", { walletType, amount, address, network }, authHeaders())
  );
  return handleResponse(res);
}

// FUTURES
export async function openFuturesPosition(payload) {
  log("[API] POST /futures/open");
  const res = await fetch(`${API_BASE_URL}/futures/open`,
    createFetchOptions("POST", payload, authHeaders())
  );
  const data = await handleResponse(res);
  playTradeSound();
  return data;
}

export async function fetchOpenFuturesPositions() {
  log("[API] GET /futures/positions/open");
  const res = await fetch(`${API_BASE_URL}/futures/positions/open`,
    createFetchOptions("GET", null, authHeaders())
  );
  return handleResponse(res);
}

export async function closeFuturesPosition(positionId) {
  log("[API] POST /futures/close/:id", positionId);
  const res = await fetch(`${API_BASE_URL}/futures/close/${positionId}`,
    createFetchOptions("POST", null, authHeaders())
  );
  return handleResponse(res);
}

export async function updateFuturesSlTp(positionId, payload) {
  log("[API] POST /futures/update-sl-tp/:id", positionId, payload);
  const res = await fetch(`${API_BASE_URL}/futures/update-sl-tp/${positionId}`,
    createFetchOptions("POST", payload, authHeaders())
  );
  return handleResponse(res);
}

// MARGIN
export async function openMarginPosition(payload) {
  log("[API] POST /margin/open");
  const res = await fetch(`${API_BASE_URL}/margin/open`,
    createFetchOptions("POST", payload, authHeaders())
  );
  const data = await handleResponse(res);
  playTradeSound();
  return data;
}

export async function fetchOpenMarginPositions() {
  log("[API] GET /margin/positions/open");
  const res = await fetch(`${API_BASE_URL}/margin/positions/open`,
    createFetchOptions("GET", null, authHeaders())
  );
  return handleResponse(res);
}

export async function closeMarginPosition(positionId) {
  log("[API] POST /margin/close/:id");
  const res = await fetch(`${API_BASE_URL}/margin/close/${positionId}`,
    createFetchOptions("POST", null, authHeaders())
  );
  return handleResponse(res);
}

// OPTIONS
export async function buyOption(payload) {
  log("[API] POST /options/buy");
  const res = await fetch(`${API_BASE_URL}/options/buy`,
    createFetchOptions("POST", payload, authHeaders())
  );
  const data = await handleResponse(res);
  playTradeSound();
  return data;
}

export async function settleOption(contractId) {
  log("[API] POST /options/settle/:id");
  const res = await fetch(`${API_BASE_URL}/options/settle/${contractId}`,
    createFetchOptions("POST", null, authHeaders())
  );
  return handleResponse(res);
}

export async function fetchOptionsPositions() {
  log("[API] GET /options/positions");
  const res = await fetch(`${API_BASE_URL}/options/positions`,
    createFetchOptions("GET", null, authHeaders())
  );
  return handleResponse(res);
}

export async function fetchOptionsHistory() {
  log("[API] GET /options/positions/history");
  const res = await fetch(`${API_BASE_URL}/options/positions/history`,
    createFetchOptions("GET", null, authHeaders())
  );
  return handleResponse(res);
}

// CANDLESTICK DATA
export async function fetchCandlestickData(symbol, interval = "1h", limit = 100) {
  log("[API] GET /market/candles/:symbol");
  const res = await fetch(
    `${API_BASE_URL}/market/candles/${encodeURIComponent(symbol.toUpperCase())}${toQueryString({
      interval,
      limit,
    })}`,
    createFetchOptions("GET")
  );
  const payload = await handleResponse(res);
  return (payload?.data || []).map((candle) => ({
    time: candle.time,
    open: Number(candle.open),
    high: Number(candle.high),
    low: Number(candle.low),
    close: Number(candle.close),
    volume: Number(candle.volume),
  }));
}
