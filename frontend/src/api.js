export const API_BASE_URL = "http://localhost:8080/api";

// Simple token storage helpers
export function setAuthToken(token) {
  localStorage.setItem("nextradex_token", token);
}

export function getAuthToken() {
  return localStorage.getItem("nextradex_token");
}

function authHeaders() {
  const token = getAuthToken();
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
}

async function handleResponse(res) {
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message = data?.message || data?.error || "Request failed";
    throw new Error(message);
  }
  return data;
}

// AUTH
export async function registerUser(payload) {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await handleResponse(res);
  if (data?.data?.token) setAuthToken(data.data.token);
  return data;
}

export async function loginUser(payload) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await handleResponse(res);
  if (data?.data?.token) setAuthToken(data.data.token);
  return data;
}

export async function validateToken() {
  const res = await fetch(`${API_BASE_URL}/auth/validate`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

// MARKET
export async function fetchAllPrices() {
  const res = await fetch(`${API_BASE_URL}/market/prices`);
  return handleResponse(res);
}

export async function fetchPrice(symbol) {
  const res = await fetch(`${API_BASE_URL}/market/price/${encodeURIComponent(symbol)}`);
  return handleResponse(res);
}

// SPOT ORDERS
export async function createSpotOrder(payload) {
  const res = await fetch(`${API_BASE_URL}/orders/spot`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function fetchActiveOrders() {
  const res = await fetch(`${API_BASE_URL}/orders/active`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function fetchOrderHistory() {
  const res = await fetch(`${API_BASE_URL}/orders/history`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function cancelOrder(orderId) {
  const res = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handleResponse(res);
}

// WALLETS
export async function fetchWallets() {
  const res = await fetch(`${API_BASE_URL}/wallets`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function fetchWallet(walletType) {
  const res = await fetch(`${API_BASE_URL}/wallets/${walletType}`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

// FUTURES
export async function openFuturesPosition(payload) {
  const res = await fetch(`${API_BASE_URL}/futures/open`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function fetchOpenFuturesPositions() {
  const res = await fetch(`${API_BASE_URL}/futures/positions/open`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

// MARGIN (service-only in backend; example mapping via /margin/open if/when controller exists)
export async function openMarginPosition(payload) {
  const res = await fetch(`${API_BASE_URL}/margin/open`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

// OPTIONS
export async function buyOption(payload) {
  const res = await fetch(`${API_BASE_URL}/options/buy`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function settleOption(contractId) {
  const res = await fetch(`${API_BASE_URL}/options/settle/${contractId}`, {
    method: "POST",
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function fetchOptionsPositions() {
  const res = await fetch(`${API_BASE_URL}/options/positions`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function fetchOptionsHistory() {
  const res = await fetch(`${API_BASE_URL}/options/positions/history`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}
