/**
 * Quick Access Panel - Quick access to all tracking and monitoring features
 */

interface QuickAccessPanelProps {
  onFlightTracker: () => void;
  onTripTracking: () => void;
  onLocationTracker: () => void;
  onBudgetTracker: () => void;
  onNotifications: () => void;
  onDashboard: () => void;
  isLoggedIn: boolean;
}

export default function QuickAccessPanel({
  onFlightTracker,
  onTripTracking,
  onLocationTracker,
  onBudgetTracker,
  onNotifications,
  onDashboard,
  isLoggedIn
}: QuickAccessPanelProps) {
  return (
    <div className="quick-access-section">
      <div className="quick-access-header">
        <h2>🚀 Quick Access</h2>
        <p>All your travel tools in one place</p>
      </div>
      
      <div className="quick-access-grid">
        {/* Tracking Features - Available to everyone */}
        <button className="quick-access-card" onClick={onFlightTracker}>
          <div className="quick-icon flight">✈️</div>
          <div className="quick-content">
            <h3>Flight Tracker</h3>
            <p>Real-time flight status & delays</p>
            <span className="quick-badge free">FREE API</span>
          </div>
        </button>

        <button className="quick-access-card" onClick={onTripTracking}>
          <div className="quick-icon trip">🗺️</div>
          <div className="quick-content">
            <h3>Trip Progress</h3>
            <p>Track your journey in real-time</p>
            <span className="quick-badge free">FREE</span>
          </div>
        </button>

        <button className="quick-access-card" onClick={onLocationTracker}>
          <div className="quick-icon location">📍</div>
          <div className="quick-content">
            <h3>My Location</h3>
            <p>GPS tracking & coordinates</p>
            <span className="quick-badge free">FREE</span>
          </div>
        </button>

        {/* User Features - Need Login */}
        <button 
          className={`quick-access-card ${!isLoggedIn ? 'disabled' : ''}`} 
          onClick={isLoggedIn ? onBudgetTracker : undefined}
        >
          <div className="quick-icon budget">💰</div>
          <div className="quick-content">
            <h3>Budget Tracker</h3>
            <p>Monitor your travel expenses</p>
            {!isLoggedIn && <span className="quick-badge login">Login Required</span>}
          </div>
        </button>

        <button 
          className={`quick-access-card ${!isLoggedIn ? 'disabled' : ''}`} 
          onClick={isLoggedIn ? onNotifications : undefined}
        >
          <div className="quick-icon notifications">🔔</div>
          <div className="quick-content">
            <h3>Price Alerts</h3>
            <p>Get notified of price drops</p>
            {!isLoggedIn && <span className="quick-badge login">Login Required</span>}
          </div>
        </button>

        <button 
          className={`quick-access-card ${!isLoggedIn ? 'disabled' : ''}`} 
          onClick={isLoggedIn ? onDashboard : undefined}
        >
          <div className="quick-icon dashboard">📊</div>
          <div className="quick-content">
            <h3>My Trips</h3>
            <p>View past & saved trips</p>
            {!isLoggedIn && <span className="quick-badge login">Login Required</span>}
          </div>
        </button>
      </div>

      <style>{`
        .quick-access-section {
          max-width: 1200px;
          margin: 40px auto;
          padding: 0 20px;
        }

        .quick-access-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .quick-access-header h2 {
          font-size: 2rem;
          margin: 0 0 8px;
          background: linear-gradient(135deg, #1e88e5, #7c3aed);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .quick-access-header p {
          color: #6b7280;
          margin: 0;
        }

        .quick-access-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .quick-access-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          cursor: pointer;
          text-align: left;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .quick-access-card:hover:not(.disabled) {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.1);
          border-color: #1e88e5;
        }

        .quick-access-card.disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .quick-icon {
          width: 60px;
          height: 60px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
          flex-shrink: 0;
        }

        .quick-icon.flight {
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
        }

        .quick-icon.trip {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
        }

        .quick-icon.location {
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
        }

        .quick-icon.budget {
          background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%);
        }

        .quick-icon.notifications {
          background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
        }

        .quick-icon.dashboard {
          background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
        }

        .quick-content h3 {
          margin: 0 0 4px;
          font-size: 1.1rem;
          color: #111827;
        }

        .quick-content p {
          margin: 0;
          font-size: 0.85rem;
          color: #6b7280;
        }

        .quick-badge {
          display: inline-block;
          margin-top: 8px;
          padding: 3px 8px;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 600;
        }

        .quick-badge.free {
          background: #d1fae5;
          color: #059669;
        }

        .quick-badge.login {
          background: #fef3c7;
          color: #d97706;
        }

        @media (max-width: 640px) {
          .quick-access-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
