import { useState, useEffect } from 'react';
import { searchFlights, searchHotels, getWeather } from '../api';

interface LiveTrackingProps {
  isVisible: boolean;
  onClose: () => void;
}

interface FlightData {
  route: string;
  price: string;
  change: number;
}

interface HotelData {
  city: string;
  avgPrice: string;
  change: number;
}

export default function LiveTracking({ isVisible, onClose }: LiveTrackingProps) {
  const [activeTab, setActiveTab] = useState<'flights' | 'hotels' | 'weather'>('flights');
  const [flights, setFlights] = useState<FlightData[]>([]);
  const [hotels, setHotels] = useState<HotelData[]>([]);
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isVisible) {
      loadLiveData();
    }
  }, [isVisible, activeTab]);

  const loadLiveData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'flights') {
        // Simulate live flight tracking
        setFlights([
          { route: 'DEL → GOA', price: '₹4,500', change: -5.2 },
          { route: 'BOM → BLR', price: '₹3,200', change: 2.1 },
          { route: 'DEL → BLR', price: '₹5,800', change: -1.5 },
          { route: 'BOM → GOA', price: '₹3,900', change: 3.4 },
        ]);
      } else if (activeTab === 'hotels') {
        setHotels([
          { city: 'Goa', avgPrice: '₹3,500/night', change: -2.1 },
          { city: 'Jaipur', avgPrice: '₹2,800/night', change: 1.5 },
          { city: 'Mumbai', avgPrice: '₹5,200/night', change: -0.8 },
          { city: 'Bangalore', avgPrice: '₹4,100/night', change: 2.3 },
        ]);
      } else if (activeTab === 'weather') {
        const result = await getWeather('Goa', 5);
        setWeather(result);
      }
    } catch (error) {
      console.error('Error loading live data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="live-tracking-overlay" onClick={onClose}>
      <div className="live-tracking-panel" onClick={(e) => e.stopPropagation()}>
        <div className="live-tracking-header">
          <h2>
            <span className="live-pulse"></span>
            Live Price Tracking
          </h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="live-tracking-tabs">
          <button
            className={`tab ${activeTab === 'flights' ? 'active' : ''}`}
            onClick={() => setActiveTab('flights')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Flights
          </button>
          <button
            className={`tab ${activeTab === 'hotels' ? 'active' : ''}`}
            onClick={() => setActiveTab('hotels')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M3 7v11m0-11l9-4 9 4m-18 0l9 4m0-4v11m0-11l9-4m-9 15l9-4" />
            </svg>
            Hotels
          </button>
          <button
            className={`tab ${activeTab === 'weather' ? 'active' : ''}`}
            onClick={() => setActiveTab('weather')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
            Weather
          </button>
        </div>

        <div className="live-tracking-content">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading live data...</p>
            </div>
          ) : (
            <>
              {activeTab === 'flights' && (
                <div className="tracking-list">
                  <div className="tracking-list-header">
                    <span>Route</span>
                    <span>Current Price</span>
                    <span>24h Change</span>
                  </div>
                  {flights.map((flight, idx) => (
                    <div key={idx} className="tracking-item">
                      <span className="tracking-route">{flight.route}</span>
                      <span className="tracking-price">{flight.price}</span>
                      <span className={`tracking-change ${flight.change < 0 ? 'down' : 'up'}`}>
                        {flight.change > 0 ? '+' : ''}{flight.change}%
                        {flight.change < 0 ? '↓' : '↑'}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'hotels' && (
                <div className="tracking-list">
                  <div className="tracking-list-header">
                    <span>City</span>
                    <span>Avg Price</span>
                    <span>24h Change</span>
                  </div>
                  {hotels.map((hotel, idx) => (
                    <div key={idx} className="tracking-item">
                      <span className="tracking-route">{hotel.city}</span>
                      <span className="tracking-price">{hotel.avgPrice}</span>
                      <span className={`tracking-change ${hotel.change < 0 ? 'down' : 'up'}`}>
                        {hotel.change > 0 ? '+' : ''}{hotel.change}%
                        {hotel.change < 0 ? '↓' : '↑'}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'weather' && weather && (
                <div className="weather-grid">
                  {weather.forecast?.map((day: any, idx: number) => (
                    <div key={idx} className="weather-card">
                      <div className="weather-date">{day.date}</div>
                      <div className="weather-icon">🌤️</div>
                      <div className="weather-temp">{day.max_temp_c}°C</div>
                      <div className="weather-condition">{day.condition}</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="live-tracking-footer">
          <small>Updates every 5 minutes • Last updated: {new Date().toLocaleTimeString()}</small>
        </div>
      </div>
    </div>
  );
}
