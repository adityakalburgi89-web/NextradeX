// This file can be used to define API calls to your backend
export const API_BASE_URL = "http://localhost:8080/api";

export async function openMarginPosition(data) {
  // Example POST request
  return fetch(`${API_BASE_URL}/margin/open`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then(res => res.json());
}

// Add more API functions as needed
