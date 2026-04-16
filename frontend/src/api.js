const DEFAULT_API_BASE_URL = "http://localhost:8080/api";
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || DEFAULT_API_BASE_URL;

export function setAuthToken(token) {
  localStorage.setItem("nextradex_token", token);
  console.log("[API] 📝 Token stored in localStorage");
}

export function getAuthToken() {
  return localStorage.getItem("nextradex_token");
}

export function clearAuthToken() {
  localStorage.removeItem("nextradex_token");
  console.log("[API] 🗑️ Token cleared from localStorage");
}

export function hasAuthToken() {
  return Boolean(getAuthToken());
}

function authHeaders() {
  const token = getAuthToken();
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
    console.log("[API] 🔐 Authorization header set for request");
  } else {
    console.log("[API] ⚠️ No token found for Authorization header");
  }
  return headers;
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
    console.error("[API] ❌ Response error:", message, "Status:", res.status);
    throw new Error(message);
  }

  console.log("[API] ✅ Response received successfully");
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

// ✅ FIX: Create fetch options with credentials for CORS
function createFetchOptions(method = "GET", body = null, headers = {}) {
  const options = {
    method,
    headers,
    // ✅ FIX #1: Include credentials to send Authorization header with CORS requests
    credentials: "include",
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  return options;
}

// AUTH
export async function registerUser(payload) {
  console.log("[API] POST /auth/register");
  const res = await fetch(`${API_BASE_URL}/auth/register`,
    createFetchOptions("POST", payload, { "Content-Type": "application/json" })
  );
  const data = await handleResponse(res);
  if (data?.data?.token) setAuthToken(data.data.token);
  return data;
}

export async function loginUser(payload) {
  console.log("[API] POST /auth/login");
  const res = await fetch(`${API_BASE_URL}/auth/login`,
    createFetchOptions("POST", payload, { "Content-Type": "application/json" })
  );
  const data = await handleResponse(res);
  if (data?.data?.token) setAuthToken(data.data.token);
  return data;
}

export async function validateToken() {
  console.log("[API] GET /auth/validate");
  const res = await fetch(`${API_BASE_URL}/auth/validate`,
    createFetchOptions("GET", null, authHeaders())
  );
  return handleResponse(res);
}

export function googleLogin() {
  console.log("[API] Redirecting to Google OAuth2 login");
  window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
}

export async function completeProfile(payload) {
  console.log("[API] POST /oauth2/complete-profile - Payload:", payload);
  const headers = authHeaders();
  console.log("[API] Request headers:", { ...headers, Authorization: headers.Authorization ? "Bearer [REDACTED]" : undefined });

  const res = await fetch(`${API_BASE_URL}/oauth2/complete-profile`,
    createFetchOptions("POST", payload, headers)
  );
  const data = await handleResponse(res);
  if (data?.data?.token) setAuthToken(data.data.token);
  return data;
}

export async function fetchUserProfile() {
  console.log("[API] GET /user/profile");
  const res = await fetch(`${API_BASE_URL}/user/profile`,
    createFetchOptions("GET", null, authHeaders())
  );
  return handleResponse(res);
}

export async function updateUserProfile(payload) {
  console.log("[API] PUT /user/profile");
  const res = await fetch(`${API_BASE_URL}/user/profile`,
    createFetchOptions("PUT", payload, authHeaders())
  );
  return handleResponse(res);
}

// MARKET
export async function fetchAllPrices() {
  console.log("[API] GET /market/prices");
  const res = await fetch(`${API_BASE_URL}/market/prices`,
    createFetchOptions("GET")
  );
  return handleResponse(res);
}

export async function fetchPrice(symbol) {
  console.log("[API] GET /market/price/:symbol");
  const res = await fetch(`${API_BASE_URL}/market/price/${encodeURIComponent(symbol)}`,
    createFetchOptions("GET")
  );
  return handleResponse(res);
}

// SPOT ORDERS
export async function createSpotOrder(payload) {
  console.log("[API] POST /orders/spot");
  const res = await fetch(`${API_BASE_URL}/orders/spot`,
    createFetchOptions("POST", payload, authHeaders())
  );
  return handleResponse(res);
}

export async function fetchActiveOrders() {
  console.log("[API] GET /orders/active");
  const res = await fetch(`${API_BASE_URL}/orders/active`,
    createFetchOptions("GET", null, authHeaders())
  );
  return handleResponse(res);
}

export async function fetchOrderHistory() {
  console.log("[API] GET /orders/history");
  const res = await fetch(`${API_BASE_URL}/orders/history`,
    createFetchOptions("GET", null, authHeaders())
  );
  return handleResponse(res);
}

export async function cancelOrder(orderId) {
  console.log("[API] DELETE /orders/:id");
  const res = await fetch(`${API_BASE_URL}/orders/${orderId}`,
    createFetchOptions("DELETE", null, authHeaders())
  );
  return handleResponse(res);
}

// WALLETS
export async function fetchWallets() {
  console.log("[API] GET /wallets");
  const res = await fetch(`${API_BASE_URL}/wallets`,
    createFetchOptions("GET", null, authHeaders())
  );
  return handleResponse(res);
}

export async function fetchWallet(walletType) {
  console.log("[API] GET /wallets/:type");
  const res = await fetch(`${API_BASE_URL}/wallets/${walletType}`,
    createFetchOptions("GET", null, authHeaders())
  );
  return handleResponse(res);
}

// FUTURES
export async function openFuturesPosition(payload) {
  console.log("[API] POST /futures/open");
  const res = await fetch(`${API_BASE_URL}/futures/open`,
    createFetchOptions("POST", payload, authHeaders())
  );
  return handleResponse(res);
}

export async function fetchOpenFuturesPositions() {
  console.log("[API] GET /futures/positions/open");
  const res = await fetch(`${API_BASE_URL}/futures/positions/open`,
    createFetchOptions("GET", null, authHeaders())
  );
  return handleResponse(res);
}

// MARGIN
export async function openMarginPosition(payload) {
  console.log("[API] POST /margin/open");
  const res = await fetch(`${API_BASE_URL}/margin/open`,
    createFetchOptions("POST", payload, authHeaders())
  );
  return handleResponse(res);
}

// OPTIONS
export async function buyOption(payload) {
  console.log("[API] POST /options/buy");
  const res = await fetch(`${API_BASE_URL}/options/buy`,
    createFetchOptions("POST", payload, authHeaders())
  );
  return handleResponse(res);
}

export async function settleOption(contractId) {
  console.log("[API] POST /options/settle/:id");
  const res = await fetch(`${API_BASE_URL}/options/settle/${contractId}`,
    createFetchOptions("POST", null, authHeaders())
  );
  return handleResponse(res);
}

export async function fetchOptionsPositions() {
  console.log("[API] GET /options/positions");
  const res = await fetch(`${API_BASE_URL}/options/positions`,
    createFetchOptions("GET", null, authHeaders())
  );
  return handleResponse(res);
}

export async function fetchOptionsHistory() {
  console.log("[API] GET /options/positions/history");
  const res = await fetch(`${API_BASE_URL}/options/positions/history`,
    createFetchOptions("GET", null, authHeaders())
  );
  return handleResponse(res);
}

// CANDLESTICK DATA
export async function fetchCandlestickData(symbol, interval = "1h", limit = 100) {
  console.log("[API] GET /market/candles/:symbol");
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
