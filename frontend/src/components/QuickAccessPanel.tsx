/**
 * Quick Access Panel – UI enhanced only
 * ⚠️ Functionality, props, handlers, and logic are UNCHANGED
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
        <h2>Quick Access</h2>
        <p>Your travel cockpit — everything within reach</p>
      </div>

      <div className="quick-access-grid">
        <button className="quick-access-card" onClick={onFlightTracker}>
          <div className="card-text">
            <h3>Flight Tracker</h3>
            <p>Real-time flight status & delays</p>
            <span className="quick-action">Details</span>
          </div>
          <div className="quick-visual flight">✈️</div>
        </button>

        <button className="quick-access-card" onClick={onTripTracking}>
          <div className="card-text">
            <h3>Trip Progress</h3>
            <p>Track your journey in real-time</p>
            <span className="quick-action">Details</span>
          </div>
          <div className="quick-visual trip">🗺️</div>
        </button>

        <button className="quick-access-card" onClick={onLocationTracker}>
          <div className="card-text">
            <h3>My Location</h3>
            <p>GPS tracking & live coordinates</p>
            <span className="quick-action">Details</span>
          </div>
          <div className="quick-visual location">📍</div>
        </button>

        <button
          className={`quick-access-card ${!isLoggedIn ? 'disabled' : ''}`}
          onClick={isLoggedIn ? onBudgetTracker : undefined}
        >
          <div className="card-text">
            <h3>Budget Tracker</h3>
            <p>Monitor your travel expenses</p>
            <span className="quick-action">Details</span>
          </div>
          <div className="quick-visual budget">💰</div>
        </button>

        <button
          className={`quick-access-card ${!isLoggedIn ? 'disabled' : ''}`}
          onClick={isLoggedIn ? onNotifications : undefined}
        >
          <div className="card-text">
            <h3>Price Alerts</h3>
            <p>Get notified of price drops</p>
            <span className="quick-action">Details</span>
          </div>
          <div className="quick-visual notifications">🔔</div>
        </button>

        <button
          className={`quick-access-card ${!isLoggedIn ? 'disabled' : ''}`}
          onClick={isLoggedIn ? onDashboard : undefined}
        >
          <div className="card-text">
            <h3>My Trips</h3>
            <p>View past & saved trips</p>
            <span className="quick-action">Details</span>
          </div>
          <div className="quick-visual dashboard">📊</div>
        </button>
      </div>

      <style>{`
        .quick-access-section {
          max-width: 1200px;
          margin: 60px auto;
          padding: 0 20px;
        }

        .quick-access-header {
          text-align: center;
          margin-bottom: 36px;
        }

        .quick-access-header h2 {
          font-size: 2.4rem;
          margin-bottom: 6px;
          color: #111827;
        }

        .quick-access-header p {
          color: #6b7280;
          font-size: 0.95rem;
        }

        .quick-access-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 22px;
        }

        .quick-access-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 22px 24px;
          background: #f5f5f5;
          border-radius: 16px;
          border: 1px solid #ededed;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 2px 10px rgba(0,0,0,0.04);
          text-align: left;
          min-height: 160px;
        }

        .quick-access-card:hover:not(.disabled) {
          transform: translateY(-4px);
          box-shadow: 0 16px 30px rgba(0,0,0,0.12);
          background: #ffffff;
        }

        .quick-access-card.disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .card-text {
          max-width: 68%;
        }

        .card-text h3 {
          margin: 0;
          font-size: 1.2rem;
          font-weight: 700;
          color: #111827;
        }

        .card-text p {
          margin: 6px 0 10px;
          font-size: 0.9rem;
          color: #6b7280;
        }

        .quick-visual {
          width: 84px;
          height: 84px;
          border-radius: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.2rem;
          background: transparent;
        }

        .quick-action {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 8px 16px;
          border-radius: 999px;
          background: #ffffff;
          border: 1px solid #ededed;
          font-size: 0.85rem;
          font-weight: 600;
          color: #111827;
          box-shadow: 0 2px 6px rgba(0,0,0,0.06);
        }

        @media (max-width: 640px) {
          .card-text {
            max-width: 100%;
          }

          .quick-access-card {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .quick-visual {
            width: 64px;
            height: 64px;
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
}
