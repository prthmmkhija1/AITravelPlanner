import { useMemo, useState } from "react";

import { planTrip } from "./api";
import type { PlanTripResult } from "./types";
import ChatPanel from "./components/ChatPanel";
import FeatureCards from "./components/FeatureCards";
import Footer from "./components/Footer";
import Hero from "./components/Hero";

type HistoryEntry = {
  request: string;
  trip_plan: string;
  created_at: string;
};

function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function App() {
  const [request, setRequest] = useState("");
  const [planning, setPlanning] = useState(false);
  const [result, setResult] = useState<PlanTripResult | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const canPlan = request.trim().length > 0 && !planning;

  const handleExample = (text: string) => {
    setRequest(text);
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  const handlePlan = async () => {
    const prompt = request.trim();
    if (!prompt || planning) return;

    setPlanning(true);
    setResult(null);

    const r = await planTrip(prompt);
    setResult(r);
    setPlanning(false);

    if (r.status === "success") {
      setHistory((prev) => [
        { request: prompt, trip_plan: r.trip_plan, created_at: new Date().toISOString() },
        ...prev
      ]);
    }
  };

  const tripPlanText = useMemo(() => {
    if (!result || result.status !== "success") return "";
    return result.trip_plan ?? "";
  }, [result]);

  return (
    <div className="page">
      <Hero />
      <FeatureCards />
      <ChatPanel />

      <div className="action-divider">
        <h2>Start Planning Your Trip</h2>
        <p>Describe your ideal trip below—we&apos;ll create a personalized itinerary.</p>
      </div>

      <div className="planner">
        <div className="section-header">📝 Tell us about your trip</div>

        <div className="row">
          <textarea
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            placeholder="Example: Plan a 3-day trip to Goa from Delhi starting Feb 12. I want beach activities and heritage sites."
          />

          <button className="btn" disabled={!canPlan} onClick={() => void handlePlan()}>
            {planning ? "Planning..." : "Plan My Trip"}
          </button>
        </div>

        <div className="examples" aria-label="Quick examples">
          <button
            className="btn secondary"
            type="button"
            onClick={() => handleExample("Plan a 3-day beach vacation to Goa from Delhi")}
          >
            🏖️ Goa Beach Vacation
          </button>
          <button
            className="btn secondary"
            type="button"
            onClick={() => handleExample("Plan a 4-day heritage tour to Jaipur from Mumbai")}
          >
            🏰 Jaipur Heritage Tour
          </button>
          <button
            className="btn secondary"
            type="button"
            onClick={() => handleExample("Plan a 5-day backwaters and nature trip to Kerala from Bangalore")}
          >
            🌴 Kerala Backwaters
          </button>
        </div>

        {planning ? <p>🤖 AI is planning your trip...</p> : null}

        {result?.status === "error" ? (
          <div className="disclaimer-box">
            <strong>
              {/GROQ_API_KEY|API key|Missing|invalid/i.test(result.error_message ?? "")
                ? "Agent unavailable."
                : "Error:"}
            </strong>{" "}
            {result.error_message}
          </div>
        ) : null}

        {result?.status === "success" ? (
          <>
            <div className="section-header">🎉 Your Personalized Trip Plan</div>

            <div className="disclaimer-box">
              <strong>Disclaimer:</strong> Suggestions are AI-generated. We do not provide live booking or real-time
              pricing. Use this as inspiration and verify details before making any travel arrangements.
            </div>

            <div className="trip-card">{tripPlanText}</div>

            <div className="download-row">
              <button
                className="btn"
                type="button"
                onClick={() => downloadFile("trip_plan.txt", tripPlanText, "text/plain")}
              >
                Download as Text
              </button>
              <button
                className="btn secondary"
                type="button"
                onClick={() =>
                  downloadFile(
                    "trip_plan.json",
                    JSON.stringify(
                      { request: request.trim(), trip_plan: tripPlanText, timestamp: new Date().toISOString() },
                      null,
                      2
                    ),
                    "application/json"
                  )
                }
              >
                Download as JSON
              </button>
            </div>
          </>
        ) : null}

        {history.length ? (
          <>
            <div className="section-header">📚 Planning History</div>
            <ul>
              {history.slice(0, 10).map((h) => (
                <li key={h.created_at}>
                  <strong>{h.request}</strong>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>

      <Footer />
    </div>
  );
}

