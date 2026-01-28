import type { PlanTripResult } from "./types";

const API_BASE = "/api";

export async function planTrip(request: string): Promise<PlanTripResult> {
  const resp = await fetch(`${API_BASE}/plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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

