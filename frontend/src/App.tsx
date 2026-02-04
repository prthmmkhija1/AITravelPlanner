import { useMemo, useState, useEffect } from "react";

import { planTrip, generatePDF, isAuthenticated, getStoredUser, logout, saveTrip } from "./api";
import type { PlanTripResult } from "./types";
import Footer from "./components/Footer";
import HeroSection from "./components/HeroSection";
import NavbarDark from "./components/NavbarDark";
import UserProfile from "./components/UserProfile";
import TravelDashboard from "./components/TravelDashboard";
import LiveTracking from "./components/LiveTracking";
import HotDestinations from "./components/HotDestinations";
import AuthModal from "./components/AuthModal";
import BudgetTracker from "./components/BudgetTracker";
import NotificationCenter from "./components/NotificationCenter";
import FlightTracker from "./components/FlightTracker";
import TripTracking from "./components/TripTracking";
import LocationTracker from "./components/LocationTracker";
import ChatBotPopup from "./components/ChatBotPopup";
import AdventureModal from "./components/AdventureModal";
import SavedTrips from "./components/SavedTrips";
import TripPlannerForm, { TripFormData } from "./components/TripPlannerForm";
import WelcomePopup from "./components/WelcomePopup";
import SettingsPopup from "./components/SettingsPopup";
import VoiceInputButton from "./components/VoiceInputButton";

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
  const [showChatBot, setShowChatBot] = useState(false);
  const [showAdventure, setShowAdventure] = useState(false);
  const [showSavedTrips, setShowSavedTrips] = useState(false);
  const [plannerMode, setPlannerMode] = useState<'text' | 'form'>('text');
  const [showWelcomePopup, setShowWelcomePopup] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  // Saved destinations state (persisted to localStorage)
  const [savedDestinations, setSavedDestinations] = useState<{id: number; name: string; country: string; image: string; price: string; rating: number}[]>(() => {
    const saved = localStorage.getItem('savedDestinations');
    return saved ? JSON.parse(saved) : [];
  });

  // Save to localStorage whenever savedDestinations changes
  useEffect(() => {
    localStorage.setItem('savedDestinations', JSON.stringify(savedDestinations));
  }, [savedDestinations]);

  const handleSaveDestination = (destination: {id: number; name: string; country: string; image: string; price: string; rating: number}) => {
    setSavedDestinations(prev => {
      const exists = prev.some(d => d.id === destination.id);
      if (exists) {
        return prev.filter(d => d.id !== destination.id);
      }
      return [...prev, destination];
    });
  };

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

  // Handle Plan New Trip - opens chatbot if logged in, else shows auth
  const handlePlanNewTrip = () => {
    if (isLoggedIn) {
      setShowChatBot(true);
    } else {
      setShowAuth(true);
    }
  };

  // Handle adventure selection - sets up a trip planning prompt
  const handleAdventureSelect = (adventurePrompt: string) => {
    setRequest(adventurePrompt);
    setShowChatBot(true);
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  // Handle form-based trip planning
  const handleFormSubmit = async (formData: TripFormData) => {
    const tripTypeLabels: Record<string, string> = {
      leisure: 'leisure and relaxation',
      adventure: 'adventure and outdoors',
      cultural: 'cultural and heritage',
      romantic: 'romantic getaway',
      family: 'family-friendly',
      business: 'business with leisure',
      spiritual: 'spiritual and wellness'
    };

    const budgetLabels: Record<string, string> = {
      budget: 'budget-friendly (under ₹15,000)',
      moderate: 'moderate budget (₹15,000-₹40,000)',
      premium: 'premium (₹40,000-₹80,000)',
      luxury: 'luxury (above ₹80,000)'
    };

    // Calculate duration
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Build natural language prompt from form data
    const prompt = `Plan a ${days}-day ${tripTypeLabels[formData.tripType]} trip to ${formData.destination} from ${formData.source}. 
Starting date: ${formData.startDate}. 
Number of travelers: ${formData.travelers}. 
Budget: ${budgetLabels[formData.budget]} per person.
${formData.preferences ? `Additional preferences: ${formData.preferences}` : ''}`;

    setRequest(prompt);
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

  // Search query state for chatbot
  const [searchMessage, setSearchMessage] = useState('');

  // Handle search from navbar
  const handleNavSearch = (query: string) => {
    // Open chatbot with the search query
    setSearchMessage(query);
    setShowChatBot(true);
  };

  return (
    <div className="page dark-theme">
      <NavbarDark 
        onProfileClick={() => setShowProfile(true)}
        onDashboardClick={() => setShowDashboard(true)}
        onBudgetClick={() => setShowBudget(true)}
        onNotificationClick={() => setShowNotifications(true)}
        onFlightTrackerClick={() => setShowFlightTracker(true)}
        onTripTrackingClick={() => setShowTripTracking(true)}
        onLocationTrackerClick={() => setShowLocationTracker(true)}
        onAuthClick={() => setShowAuth(true)}
        onLogout={handleLogout}
        onAdventureClick={() => setShowAdventure(true)}
        onSavedTripsClick={() => setShowSavedTrips(true)}
        onPlanTrip={() => setShowChatBot(true)}
        onChatbotOpen={(prompt) => {
          setSearchMessage(prompt);
          setShowChatBot(true);
        }}
        isLoggedIn={isLoggedIn}
        userName={user?.username}
      />
      
      <HeroSection 
        onExplore={() => {
          document.getElementById('plan-trip')?.scrollIntoView({ behavior: 'smooth' });
        }}
        onDestinationClick={(destination: string) => {
          setRequest(`Plan a trip to ${destination}`);
          setShowChatBot(true);
        }}
        savedDestinations={savedDestinations}
        onSaveDestination={handleSaveDestination}
      />
      
      <HotDestinations />

      {/* Trip Planner Section */}
      <div className="page-section" id="plan-trip">
        {/* Moving Waves */}
        <div className="waves-container">
          <div className="wave wave-1"></div>
          <div className="wave wave-2"></div>
          <div className="wave wave-3"></div>
        </div>
        
        <div className="section-title">
          <h2><span className="title-icon">◆</span> Start Planning Your Trip</h2>
          <p>Choose how you'd like to plan - fill out a form or describe your trip in your own words</p>
        </div>

        <div className="planner">
          {/* Mode Toggle */}
          <div className="planner-mode-toggle">
            <button 
              className={`mode-btn ${plannerMode === 'text' ? 'active' : ''}`}
              onClick={() => setPlannerMode('text')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Chat Mode
            </button>
            <button 
              className={`mode-btn ${plannerMode === 'form' ? 'active' : ''}`}
              onClick={() => setPlannerMode('form')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/>
                <rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
              Quick Planner
            </button>
          </div>

          {/* Form Mode */}
          {plannerMode === 'form' && (
            <TripPlannerForm 
              onSubmit={handleFormSubmit}
              isPlanning={planning}
            />
          )}

          {/* Text Mode */}
          {plannerMode === 'text' && (
            <>
              <div className="section-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
                Tell us about your trip
              </div>

              <div className="row">
                <div className="textarea-voice-wrapper">
                  <textarea
                    value={request}
                    onChange={(e) => setRequest(e.target.value)}
                    placeholder="Example: Plan a 3-day trip to Goa from Delhi starting Feb 12. I want beach activities and heritage sites."
                  />
                  <VoiceInputButton 
                    onTranscript={(text) => setRequest(prev => prev ? `${prev} ${text}` : text)}
                    disabled={planning}
                    size="medium"
                    className="textarea-voice-btn"
                  />
                </div>

                <button className="btn" disabled={!canPlan} onClick={() => void handlePlan()}>
                  {planning ? "Planning..." : "Plan My Trip"}
                </button>
              </div>

              <div className="examples" aria-label="Quick examples">
                <button
                  className="btn example-btn"
                  type="button"
                  onClick={() => handleExample("Plan a 3-day beach vacation to Goa from Delhi")}
                >
                  <span className="example-icon beach">◈</span>
                  Goa Beach Vacation
                </button>
                <button
                  className="btn example-btn"
                  type="button"
                  onClick={() => handleExample("Plan a 4-day heritage tour to Jaipur from Mumbai")}
                >
                  <span className="example-icon heritage">◇</span>
                  Jaipur Heritage Tour
                </button>
                <button
                  className="btn example-btn"
                  type="button"
                  onClick={() => handleExample("Plan a 5-day backwaters and nature trip to Kerala from Bangalore")}
                >
                  <span className="example-icon nature">◆</span>
                  Kerala Backwaters
                </button>
              </div>
            </>
          )}

        {planning ? <p className="planning-status"><span className="pulse-dot"></span> AI is crafting your perfect trip...</p> : null}

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
            <div className="section-header success">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              Your Personalized Trip Plan
            </div>

            <div className="live-badge">
              <span className="live-dot"></span> LIVE DATA — Real-time prices from Amadeus, Hotels.com, Foursquare
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
      </div>

      <Footer />
      
      {/* Modals */}
      <UserProfile isVisible={showProfile} onClose={() => setShowProfile(false)} user={user} />
      <TravelDashboard 
        isVisible={showDashboard} 
        onClose={() => setShowDashboard(false)} 
        onPlanNewTrip={handlePlanNewTrip}
        savedDestinations={savedDestinations}
        onRemoveDestination={(id) => setSavedDestinations(prev => prev.filter(d => d.id !== id))}
      />
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
      <AdventureModal
        isVisible={showAdventure}
        onClose={() => setShowAdventure(false)}
        onSelectAdventure={handleAdventureSelect}
      />
      <SavedTrips
        isVisible={showSavedTrips}
        onClose={() => setShowSavedTrips(false)}
        onLoadTrip={(tripPlan, userRequest) => {
          setRequest(userRequest);
          setResult({ status: 'success', trip_plan: tripPlan });
          setShowSavedTrips(false);
        }}
      />

      {/* Welcome Popup - Shows on first visit */}
      {showWelcomePopup && (
        <WelcomePopup
          onClose={() => setShowWelcomePopup(false)}
          onOpenChat={() => {
            setShowWelcomePopup(false);
            setShowChatBot(true);
          }}
          onOpenSettings={() => {
            setShowWelcomePopup(false);
            setShowSettings(true);
          }}
        />
      )}

      {/* Settings Popup */}
      <SettingsPopup
        isVisible={showSettings}
        onClose={() => setShowSettings(false)}
      />

      {/* Floating Chatbot */}
      <ChatBotPopup 
        isOpen={showChatBot}
        onToggle={() => setShowChatBot(!showChatBot)}
        initialMessage={searchMessage}
        onInitialMessageHandled={() => setSearchMessage('')}
      />
    </div>
  );
}

