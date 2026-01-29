/**
 * Flight Tracker Component
 * Real-time flight status tracking using Amadeus API (FREE - 2000 req/month)
 */

import { useState } from 'react';

interface FlightStatus {
  status: string;
  flight?: {
    number: string;
    airline: string;
    aircraft: string;
  };
  origin?: {
    code: string;
    terminal: string;
    gate: string;
  };
  destination?: {
    code: string;
    terminal: string;
  };
  times?: {
    scheduled_departure: string;
    scheduled_arrival: string;
    delay_minutes: number;
  };
  flight_status?: string;
  last_updated?: string;
  error?: string;
  message?: string;
}

interface DelayPrediction {
  status: string;
  route?: string;
  probability?: {
    on_time: string;
    delayed_15_min: string;
    delayed_30_min: string;
    delayed_60_min: string;
  };
  factors?: string[];
  recommendation?: string;
}

interface FlightTrackerProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function FlightTracker({ isVisible, onClose }: FlightTrackerProps) {
  const [activeTab, setActiveTab] = useState<'status' | 'delay' | 'route'>('status');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Flight status form
  const [carrierCode, setCarrierCode] = useState('AI');
  const [flightNumber, setFlightNumber] = useState('');
  const [flightDate, setFlightDate] = useState(new Date().toISOString().split('T')[0]);
  const [flightStatus, setFlightStatus] = useState<FlightStatus | null>(null);
  
  // Delay prediction form
  const [origin, setOrigin] = useState('DEL');
  const [destination, setDestination] = useState('BOM');
  const [delayPrediction, setDelayPrediction] = useState<DelayPrediction | null>(null);
  
  // Route flights
  const [routeFlights, setRouteFlights] = useState<any>(null);

  const airlines = [
    { code: 'AI', name: 'Air India' },
    { code: '6E', name: 'IndiGo' },
    { code: 'SG', name: 'SpiceJet' },
    { code: 'UK', name: 'Vistara' },
    { code: 'G8', name: 'Go First' },
    { code: 'QP', name: 'Akasa Air' },
    { code: 'EK', name: 'Emirates' },
    { code: 'QR', name: 'Qatar Airways' },
  ];

  const airports = [
    { code: 'DEL', name: 'Delhi' },
    { code: 'BOM', name: 'Mumbai' },
    { code: 'BLR', name: 'Bangalore' },
    { code: 'MAA', name: 'Chennai' },
    { code: 'CCU', name: 'Kolkata' },
    { code: 'HYD', name: 'Hyderabad' },
    { code: 'GOI', name: 'Goa' },
    { code: 'JAI', name: 'Jaipur' },
  ];

  const checkFlightStatus = async () => {
    if (!flightNumber.trim()) {
      setError('Please enter a flight number');
      return;
    }
    
    setLoading(true);
    setError(null);
    setFlightStatus(null);
    
    try {
      const response = await fetch('/api/flights/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carrier_code: carrierCode,
          flight_number: flightNumber,
          date: flightDate
        })
      });
      
      const data = await response.json();
      setFlightStatus(data);
    } catch (err) {
      setError('Failed to fetch flight status');
    } finally {
      setLoading(false);
    }
  };

  const checkDelayPrediction = async () => {
    setLoading(true);
    setError(null);
    setDelayPrediction(null);
    
    try {
      const response = await fetch('/api/flights/delay-prediction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin,
          destination,
          date: flightDate
        })
      });
      
      const data = await response.json();
      setDelayPrediction(data);
    } catch (err) {
      setError('Failed to fetch delay prediction');
    } finally {
      setLoading(false);
    }
  };

  const searchRouteFlights = async () => {
    setLoading(true);
    setError(null);
    setRouteFlights(null);
    
    try {
      const response = await fetch('/api/flights/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin,
          destination,
          date: flightDate
        })
      });
      
      const data = await response.json();
      setRouteFlights(data);
    } catch (err) {
      setError('Failed to search route flights');
    } finally {
      setLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="flight-tracker-overlay">
      <div className="flight-tracker-modal">
        <div className="flight-tracker-header">
          <h2>✈️ Flight Tracker</h2>
          <span className="api-badge">Powered by Amadeus API</span>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="flight-tracker-tabs">
          <button 
            className={`tab ${activeTab === 'status' ? 'active' : ''}`}
            onClick={() => setActiveTab('status')}
          >
            📋 Flight Status
          </button>
          <button 
            className={`tab ${activeTab === 'delay' ? 'active' : ''}`}
            onClick={() => setActiveTab('delay')}
          >
            ⏰ Delay Prediction
          </button>
          <button 
            className={`tab ${activeTab === 'route' ? 'active' : ''}`}
            onClick={() => setActiveTab('route')}
          >
            🔍 Route Search
          </button>
        </div>

        <div className="flight-tracker-content">
          {error && (
            <div className="tracker-error">
              <span>❌</span> {error}
            </div>
          )}

          {/* Flight Status Tab */}
          {activeTab === 'status' && (
            <div className="status-section">
              <div className="form-row">
                <div className="form-group">
                  <label>Airline</label>
                  <select 
                    value={carrierCode} 
                    onChange={(e) => setCarrierCode(e.target.value)}
                  >
                    {airlines.map(a => (
                      <option key={a.code} value={a.code}>{a.code} - {a.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Flight Number</label>
                  <input
                    type="text"
                    value={flightNumber}
                    onChange={(e) => setFlightNumber(e.target.value)}
                    placeholder="e.g., 101"
                  />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={flightDate}
                    onChange={(e) => setFlightDate(e.target.value)}
                  />
                </div>
              </div>
              
              <button 
                className="search-btn" 
                onClick={checkFlightStatus}
                disabled={loading}
              >
                {loading ? '🔄 Checking...' : '🔍 Check Status'}
              </button>

              {flightStatus && (
                <div className="status-result">
                  {flightStatus.status === 'success' ? (
                    <div className="flight-card">
                      <div className="flight-header">
                        <h3>{flightStatus.flight?.number}</h3>
                        <span className="status-badge">
                          {flightStatus.flight_status}
                        </span>
                      </div>
                      <div className="flight-details">
                        <div className="detail-row">
                          <span className="label">Airline:</span>
                          <span>{flightStatus.flight?.airline}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Origin:</span>
                          <span>{flightStatus.origin?.code} (Gate: {flightStatus.origin?.gate})</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Destination:</span>
                          <span>{flightStatus.destination?.code}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Departure:</span>
                          <span>{flightStatus.times?.scheduled_departure}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Arrival:</span>
                          <span>{flightStatus.times?.scheduled_arrival}</span>
                        </div>
                      </div>
                      <div className="last-updated">
                        Last updated: {flightStatus.last_updated}
                      </div>
                    </div>
                  ) : (
                    <div className="no-result">
                      <span>ℹ️</span>
                      <p>{flightStatus.message || 'Flight not found'}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Delay Prediction Tab */}
          {activeTab === 'delay' && (
            <div className="delay-section">
              <div className="form-row">
                <div className="form-group">
                  <label>From</label>
                  <select value={origin} onChange={(e) => setOrigin(e.target.value)}>
                    {airports.map(a => (
                      <option key={a.code} value={a.code}>{a.code} - {a.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>To</label>
                  <select value={destination} onChange={(e) => setDestination(e.target.value)}>
                    {airports.map(a => (
                      <option key={a.code} value={a.code}>{a.code} - {a.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={flightDate}
                    onChange={(e) => setFlightDate(e.target.value)}
                  />
                </div>
              </div>
              
              <button 
                className="search-btn" 
                onClick={checkDelayPrediction}
                disabled={loading}
              >
                {loading ? '🔄 Analyzing...' : '⏰ Predict Delays'}
              </button>

              {delayPrediction && delayPrediction.status === 'success' && (
                <div className="delay-result">
                  <h4>🎯 Delay Prediction for {delayPrediction.route}</h4>
                  
                  <div className="probability-grid">
                    <div className="prob-item on-time">
                      <span className="prob-value">{delayPrediction.probability?.on_time}</span>
                      <span className="prob-label">On Time</span>
                    </div>
                    <div className="prob-item slight">
                      <span className="prob-value">{delayPrediction.probability?.delayed_15_min}</span>
                      <span className="prob-label">15min Delay</span>
                    </div>
                    <div className="prob-item moderate">
                      <span className="prob-value">{delayPrediction.probability?.delayed_30_min}</span>
                      <span className="prob-label">30min Delay</span>
                    </div>
                    <div className="prob-item severe">
                      <span className="prob-value">{delayPrediction.probability?.delayed_60_min}</span>
                      <span className="prob-label">60min+ Delay</span>
                    </div>
                  </div>

                  {delayPrediction.factors && (
                    <div className="factors-list">
                      <h5>📊 Factors Considered:</h5>
                      <ul>
                        {delayPrediction.factors.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {delayPrediction.recommendation && (
                    <div className="recommendation">
                      <span>💡</span>
                      <p>{delayPrediction.recommendation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Route Search Tab */}
          {activeTab === 'route' && (
            <div className="route-section">
              <div className="form-row">
                <div className="form-group">
                  <label>From</label>
                  <select value={origin} onChange={(e) => setOrigin(e.target.value)}>
                    {airports.map(a => (
                      <option key={a.code} value={a.code}>{a.code} - {a.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>To</label>
                  <select value={destination} onChange={(e) => setDestination(e.target.value)}>
                    {airports.map(a => (
                      <option key={a.code} value={a.code}>{a.code} - {a.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={flightDate}
                    onChange={(e) => setFlightDate(e.target.value)}
                  />
                </div>
              </div>
              
              <button 
                className="search-btn" 
                onClick={searchRouteFlights}
                disabled={loading}
              >
                {loading ? '🔄 Searching...' : '🔍 Find All Flights'}
              </button>

              {routeFlights && routeFlights.status === 'success' && (
                <div className="route-result">
                  <h4>🛫 {routeFlights.route} on {routeFlights.date}</h4>
                  <p className="flight-count">{routeFlights.total_flights} flights found</p>
                  
                  <div className="flights-list">
                    {routeFlights.flights?.map((flight: any, i: number) => (
                      <div key={i} className="route-flight-item">
                        <div className="flight-num">{flight.flight_number}</div>
                        <div className="flight-airline">{flight.airline}</div>
                        <div className="flight-times">
                          <span>{flight.departure}</span>
                          <span className="arrow">→</span>
                          <span>{flight.arrival}</span>
                        </div>
                        <div className="flight-duration">{flight.duration}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flight-tracker-footer">
          <small>✨ Uses Amadeus API - FREE tier: 2000 requests/month</small>
        </div>
      </div>

      <style>{`
        .flight-tracker-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }

        .flight-tracker-modal {
          background: white;
          border-radius: 20px;
          width: 95%;
          max-width: 700px;
          max-height: 90vh;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          display: flex;
          flex-direction: column;
        }

        .flight-tracker-header {
          padding: 20px 24px;
          background: linear-gradient(135deg, #1e88e5 0%, #1565c0 100%);
          color: white;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .flight-tracker-header h2 {
          margin: 0;
          flex: 1;
        }

        .api-badge {
          font-size: 0.7rem;
          padding: 4px 8px;
          background: rgba(255,255,255,0.2);
          border-radius: 12px;
        }

        .close-btn {
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1.4rem;
        }

        .flight-tracker-tabs {
          display: flex;
          border-bottom: 1px solid #e5e7eb;
          padding: 0 16px;
        }

        .flight-tracker-tabs .tab {
          padding: 14px 20px;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          font-weight: 500;
          color: #6b7280;
          transition: all 0.2s;
        }

        .flight-tracker-tabs .tab.active {
          color: #1e88e5;
          border-bottom-color: #1e88e5;
        }

        .flight-tracker-content {
          padding: 24px;
          overflow-y: auto;
          flex: 1;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          font-size: 0.85rem;
          font-weight: 500;
          margin-bottom: 6px;
          color: #374151;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 0.95rem;
        }

        .search-btn {
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #1e88e5 0%, #1565c0 100%);
          border: none;
          border-radius: 10px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .search-btn:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        .search-btn:disabled {
          opacity: 0.6;
        }

        .tracker-error {
          background: #fee2e2;
          color: #dc2626;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .flight-card {
          background: #f8fafc;
          border-radius: 12px;
          padding: 20px;
          margin-top: 20px;
        }

        .flight-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .flight-header h3 {
          margin: 0;
          font-size: 1.5rem;
        }

        .status-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          background: #dcfce7;
          color: #16a34a;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;
        }

        .detail-row .label {
          color: #6b7280;
        }

        .last-updated {
          margin-top: 12px;
          font-size: 0.75rem;
          color: #9ca3af;
        }

        .no-result {
          text-align: center;
          padding: 30px;
          color: #6b7280;
        }

        .probability-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin: 20px 0;
        }

        .prob-item {
          text-align: center;
          padding: 16px;
          border-radius: 12px;
        }

        .prob-item.on-time { background: #dcfce7; }
        .prob-item.slight { background: #fef3c7; }
        .prob-item.moderate { background: #fed7aa; }
        .prob-item.severe { background: #fecaca; }

        .prob-value {
          display: block;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .prob-label {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .factors-list {
          background: #f8fafc;
          padding: 16px;
          border-radius: 8px;
          margin: 16px 0;
        }

        .factors-list h5 {
          margin: 0 0 8px;
        }

        .factors-list ul {
          margin: 0;
          padding-left: 20px;
        }

        .recommendation {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #dbeafe;
          padding: 12px 16px;
          border-radius: 8px;
        }

        .flights-list {
          margin-top: 16px;
        }

        .route-flight-item {
          display: grid;
          grid-template-columns: 80px 1fr 150px 80px;
          align-items: center;
          padding: 12px;
          background: #f8fafc;
          border-radius: 8px;
          margin-bottom: 8px;
        }

        .flight-num {
          font-weight: 600;
          color: #1e88e5;
        }

        .flight-airline {
          color: #6b7280;
        }

        .flight-times {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .arrow {
          color: #9ca3af;
        }

        .flight-duration {
          text-align: right;
          font-size: 0.85rem;
          color: #6b7280;
        }

        .flight-tracker-footer {
          padding: 12px 24px;
          background: #f8fafc;
          text-align: center;
          color: #6b7280;
          border-top: 1px solid #e5e7eb;
        }

        @media (max-width: 640px) {
          .form-row {
            grid-template-columns: 1fr;
          }
          .probability-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .route-flight-item {
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
}
