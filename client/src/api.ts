import type { PlanTripResult } from "./types";

export async function planTrip(request: string): Promise<PlanTripResult> {
  const resp = await fetch("/api/plan", {
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

