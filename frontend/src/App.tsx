import { useMemo, useState, useEffect } from "react";

import { planTrip, generatePDF, isAuthenticated, getStoredUser, logout, saveTrip } from "./api";
import type { PlanTripResult } from "./types";
import ChatPanel from "./components/ChatPanel";
import FeatureCards from "./components/FeatureCards";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import UserProfile from "./components/UserProfile";
import TravelDashboard from "./components/TravelDashboard";
import LiveTracking from "./components/LiveTracking";
import HotDestinations from "./components/HotDestinations";
import DynamicMap from "./components/DynamicMap";
import AuthModal from "./components/AuthModal";
import BudgetTracker from "./components/BudgetTracker";
import NotificationCenter from "./components/NotificationCenter";
import FlightTracker from "./components/FlightTracker";
import TripTracking from "./components/TripTracking";
import LocationTracker from "./components/LocationTracker";
import QuickAccessPanel from "./components/QuickAccessPanel";

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
  
  // UI State
  const [showProfile, setShowProfile] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showLiveTracking, setShowLiveTracking] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showBudget, setShowBudget] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFlightTracker, setShowFlightTracker] = useState(false);
  const [showTripTracking, setShowTripTracking] = useState(false);
  const [showLocationTracker, setShowLocationTracker] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [savingTrip, setSavingTrip] = useState(false);

  // Check auth on mount
  useEffect(() => {
    const authenticated = isAuthenticated();
    setIsLoggedIn(authenticated);
    if (authenticated) {
      setUser(getStoredUser());
    }
  }, []);

  const handleAuthSuccess = (userData: any) => {
    setUser(userData);
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setIsLoggedIn(false);
  };

  const handleSaveTrip = async () => {
    if (!result || result.status !== 'success' || !isLoggedIn) return;
    
    setSavingTrip(true);
    try {
      // Extract destination from request
      const destMatch = request.match(/to\s+(\w+)/i);
      const destination = destMatch ? destMatch[1] : 'Trip';
      
      await saveTrip({
        destination,
        trip_plan: result.trip_plan,
        user_request: request.trim(),
      });
      alert('Trip saved successfully!');
    } catch (error) {
      console.error('Failed to save trip:', error);
    } finally {
      setSavingTrip(false);
    }
  };

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

  const downloadPDF = async () => {
    if (!tripPlanText) return;
    
    setPdfLoading(true);
    
    try {
      // Try backend PDF generation first
      const pdfBlob = await generatePDF(tripPlanText, request.trim());
      
      if (pdfBlob) {
        // Download the PDF from backend
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "trip_itinerary.pdf";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } else {
        // Fallback to text file if PDF generation fails
        const pdfContent = `
AI TRAVEL PLANNER - ITINERARY
${'='.repeat(50)}

REQUEST:
${request.trim()}

TRIP PLAN:
${tripPlanText}

${'='.repeat(50)}
Generated on: ${new Date().toLocaleString()}
Powered by AI Travel Planner with Live APIs
        `.trim();
        
        downloadFile("trip_itinerary.txt", pdfContent, "text/plain");
      }
    } catch (error) {
      console.error("PDF download error:", error);
      // Fallback to text
      downloadFile("trip_itinerary.txt", tripPlanText, "text/plain");
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="page">
      <Navbar 
        onProfileClick={() => setShowProfile(true)}
        onDashboardClick={() => setShowDashboard(true)}
        onBudgetClick={() => setShowBudget(true)}
        onNotificationClick={() => setShowNotifications(true)}
        onFlightTrackerClick={() => setShowFlightTracker(true)}
        onTripTrackingClick={() => setShowTripTracking(true)}
        onLocationTrackerClick={() => setShowLocationTracker(true)}
        onAuthClick={() => setShowAuth(true)}
        onLogout={handleLogout}
        isLoggedIn={isLoggedIn}
        userName={user?.username}
      />
      
      <Hero />
      
      <FeatureCards />

      {/* Quick Access Panel for all tracking features */}
      <QuickAccessPanel
        onFlightTracker={() => setShowFlightTracker(true)}
        onTripTracking={() => setShowTripTracking(true)}
        onLocationTracker={() => setShowLocationTracker(true)}
        onBudgetTracker={() => setShowBudget(true)}
        onNotifications={() => setShowNotifications(true)}
        onDashboard={() => setShowDashboard(true)}
        isLoggedIn={isLoggedIn}
      />
      
      <HotDestinations />
      
      <DynamicMap />
      
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

            <div className="live-badge">
              🔴 LIVE DATA - Prices from real APIs (Amadeus, Hotels.com, Foursquare)
            </div>

            <div className="trip-card">{tripPlanText}</div>

            <div className="download-row">
              <button
                className="btn"
                type="button"
                onClick={() => void downloadPDF()}
                disabled={pdfLoading}
              >
                {pdfLoading ? "⏳ Generating PDF..." : "📄 Download as PDF"}
              </button>
              <button
                className="btn secondary"
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
              {isLoggedIn && (
                <button
                  className="btn secondary"
                  type="button"
                  onClick={() => void handleSaveTrip()}
                  disabled={savingTrip}
                >
                  {savingTrip ? "💾 Saving..." : "💾 Save Trip"}
                </button>
              )}
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
      
      {/* Modals */}
      <UserProfile isVisible={showProfile} onClose={() => setShowProfile(false)} />
      <TravelDashboard isVisible={showDashboard} onClose={() => setShowDashboard(false)} />
      <LiveTracking isVisible={showLiveTracking} onClose={() => setShowLiveTracking(false)} />
      <AuthModal 
        isVisible={showAuth} 
        onClose={() => setShowAuth(false)} 
        onAuthSuccess={handleAuthSuccess}
      />
      <BudgetTracker 
        isVisible={showBudget} 
        onClose={() => setShowBudget(false)} 
      />
      <NotificationCenter 
        isVisible={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
      <FlightTracker 
        isVisible={showFlightTracker} 
        onClose={() => setShowFlightTracker(false)} 
      />
      <TripTracking 
        isVisible={showTripTracking} 
        onClose={() => setShowTripTracking(false)} 
      />
      <LocationTracker 
        isVisible={showLocationTracker} 
        onClose={() => setShowLocationTracker(false)} 
      />
    </div>
  );
}

