import type { PlanTripResult } from "./types";

const API_BASE = "/api";

// Helper to get auth token
function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

// Helper for authenticated requests
function authHeaders(): HeadersInit {
  const token = getAuthToken();
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function planTrip(request: string): Promise<PlanTripResult> {
  const resp = await fetch(`${API_BASE}/plan`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ request })
  });

  const data = (await resp.json().catch(() => null)) as PlanTripResult | null;

  if (!resp.ok) {
    return (
      data ?? {
        status: "error",
        error_message: `Request failed (${resp.status})`,
        trip_plan: null
      }
    );
  }

  return (
    data ?? {
      status: "error",
      error_message: "Invalid JSON response from server",
      trip_plan: null
    }
  );
}

// New API functions for enhanced features

export async function searchFlights(source: string, destination: string, date?: string) {
  const resp = await fetch(`${API_BASE}/flights`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source, destination, date })
  });
  return resp.json();
}

export async function searchHotels(city: string, checkin?: string, checkout?: string) {
  const resp = await fetch(`${API_BASE}/hotels`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ city, checkin, checkout })
  });
  return resp.json();
}

export async function searchActivities(city: string, type?: string) {
  const resp = await fetch(`${API_BASE}/activities`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ city, type })
  });
  return resp.json();
}

export async function getWeather(city: string, days?: number) {
  const resp = await fetch(`${API_BASE}/weather`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ city, days })
  });
  return resp.json();
}

export async function checkHealth() {
  const resp = await fetch(`${API_BASE}/health`);
  return resp.json();
}

export async function generatePDF(tripPlan: string, userRequest: string): Promise<Blob | null> {
  try {
    const resp = await fetch(`${API_BASE}/generate-pdf`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ trip_plan: tripPlan, user_request: userRequest })
    });

    if (!resp.ok) {
      console.error("PDF generation failed:", resp.status);
      return null;
    }

    return await resp.blob();
  } catch (error) {
    console.error("PDF generation error:", error);
    return null;
  }
}

// =============================================================================
// AUTHENTICATION API
// =============================================================================

export async function register(email: string, password: string, name: string, phone?: string) {
  const resp = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name, phone })
  });
  const data = await resp.json();
  if (data.token) {
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  return data;
}

export async function login(email: string, password: string) {
  const resp = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  const data = await resp.json();
  if (data.token) {
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  return data;
}

export async function logout() {
  const resp = await fetch(`${API_BASE}/auth/logout`, {
    method: "POST",
    headers: authHeaders()
  });
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
  return resp.json();
}

export async function getCurrentUser() {
  const resp = await fetch(`${API_BASE}/auth/me`, {
    headers: authHeaders()
  });
  return resp.json();
}

export async function updateProfile(data: { name?: string; phone?: string; preferences?: string }) {
  const resp = await fetch(`${API_BASE}/auth/profile`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data)
  });
  return resp.json();
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

export function getStoredUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

// =============================================================================
// TRIPS API
// =============================================================================

export async function saveTrip(data: {
  destination: string;
  trip_plan: string;
  user_request: string;
  source?: string;
  start_date?: string;
  end_date?: string;
  travelers?: number;
}) {
  const resp = await fetch(`${API_BASE}/trips`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data)
  });
  return resp.json();
}

export async function getTrips(status?: string) {
  const url = status ? `${API_BASE}/trips?status=${status}` : `${API_BASE}/trips`;
  const resp = await fetch(url, {
    headers: authHeaders()
  });
  return resp.json();
}

export async function updateTrip(tripId: number, data: { destination?: string; status?: string; rating?: number }) {
  const resp = await fetch(`${API_BASE}/trips/${tripId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data)
  });
  return resp.json();
}

export async function deleteTrip(tripId: number) {
  const resp = await fetch(`${API_BASE}/trips/${tripId}`, {
    method: "DELETE",
    headers: authHeaders()
  });
  return resp.json();
}

// =============================================================================
// BUDGET API
// =============================================================================

export async function createBudget(data: {
  category: string;
  planned_amount: number;
  trip_id?: number;
  notes?: string;
}) {
  const resp = await fetch(`${API_BASE}/budgets`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data)
  });
  return resp.json();
}

export async function getBudgets(tripId?: number) {
  const url = tripId ? `${API_BASE}/budgets?trip_id=${tripId}` : `${API_BASE}/budgets`;
  const resp = await fetch(url, {
    headers: authHeaders()
  });
  return resp.json();
}

export async function getBudgetSummary() {
  const resp = await fetch(`${API_BASE}/budgets/summary`, {
    headers: authHeaders()
  });
  return resp.json();
}

export async function addTransaction(data: {
  budget_id: number;
  amount: number;
  description?: string;
  transaction_type?: string;
}) {
  const resp = await fetch(`${API_BASE}/budgets/transactions`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data)
  });
  return resp.json();
}

export async function getTransactions(budgetId: number) {
  const resp = await fetch(`${API_BASE}/budgets/${budgetId}/transactions`, {
    headers: authHeaders()
  });
  return resp.json();
}

// =============================================================================
// NOTIFICATIONS API
// =============================================================================

export async function getNotifications(unreadOnly = false) {
  const url = `${API_BASE}/notifications?unread_only=${unreadOnly}`;
  const resp = await fetch(url, {
    headers: authHeaders()
  });
  return resp.json();
}

export async function markNotificationRead(notificationId: number) {
  const resp = await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
    method: "PUT",
    headers: authHeaders()
  });
  return resp.json();
}

export async function markAllNotificationsRead() {
  const resp = await fetch(`${API_BASE}/notifications/read-all`, {
    method: "PUT",
    headers: authHeaders()
  });
  return resp.json();
}

// =============================================================================
// PRICE ALERTS API
// =============================================================================

export async function createPriceAlert(data: {
  alert_type: string;
  search_params: object;
  initial_price: number;
  target_price?: number;
}) {
  const resp = await fetch(`${API_BASE}/price-alerts`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data)
  });
  return resp.json();
}

export async function getPriceAlerts() {
  const resp = await fetch(`${API_BASE}/price-alerts`, {
    headers: authHeaders()
  });
  return resp.json();
}

export async function cancelPriceAlert(alertId: number) {
  const resp = await fetch(`${API_BASE}/price-alerts/${alertId}`, {
    method: "DELETE",
    headers: authHeaders()
  });
  return resp.json();
}

export async function startPriceMonitor() {
  const resp = await fetch(`${API_BASE}/price-monitor/start`, {
    method: "POST",
    headers: authHeaders()
  });
  return resp.json();
}

