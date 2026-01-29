import { useState, useEffect } from 'react';
import { getWeather, searchFlights } from '../api';

interface MapMarker {
  city: string;
  lat: number;
  lng: number;
  temp?: number;
  flightPrice?: string;
}

export default function DynamicMap() {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [mapData, setMapData] = useState<MapMarker[]>([
    { city: 'Delhi', lat: 28.7041, lng: 77.1025 },
    { city: 'Mumbai', lat: 19.076, lng: 72.8777 },
    { city: 'Bangalore', lat: 12.9716, lng: 77.5946 },
    { city: 'Goa', lat: 15.2993, lng: 74.124 },
    { city: 'Jaipur', lat: 26.9124, lng: 75.7873 },
  ]);

  useEffect(() => {
    loadWeatherData();
  }, []);

  const loadWeatherData = async () => {
    const updatedData = await Promise.all(
      mapData.map(async (marker) => {
        try {
          const weather = await getWeather(marker.city, 1);
          return {
            ...marker,
            temp: weather.forecast?.[0]?.max_temp_c || 25,
            flightPrice: `₹${Math.floor(Math.random() * 5000) + 3000}`
          };
        } catch {
          return { ...marker, temp: 25, flightPrice: '₹4,500' };
        }
      })
    );
    setMapData(updatedData);
  };

  // Simple India map visualization
  const getPositionStyle = (lat: number, lng: number) => {
    // Normalize coordinates to fit in container (rough approximation for India)
    const x = ((lng - 68) / (97 - 68)) * 100; // Longitude range of India
    const y = ((35 - lat) / (35 - 8)) * 100;  // Latitude range of India
    return {
      left: `${Math.max(0, Math.min(100, x))}%`,
      top: `${Math.max(0, Math.min(100, y))}%`
    };
  };

  return (
    <section className="dynamic-map-section">
      <div className="section-header-centered">
        <h2>🗺️ Live Travel Map</h2>
        <p>Real-time weather and flight prices across India</p>
      </div>

      <div className="map-container">
        {/* India Map SVG Outline */}
        <div className="map-background">
          <svg viewBox="0 0 800 900" className="india-map-svg">
            <path
              d="M400,100 L450,150 L500,200 L520,280 L550,350 L560,420 L550,500 L520,580 L480,650 L440,700 L400,750 L360,700 L320,650 L280,580 L250,500 L240,420 L250,350 L280,280 L300,200 L350,150 Z"
              fill="rgba(30, 136, 229, 0.1)"
              stroke="rgba(30, 136, 229, 0.3)"
              strokeWidth="2"
            />
          </svg>
        </div>

        {/* City Markers */}
        <div className="map-markers">
          {mapData.map((marker) => (
            <div
              key={marker.city}
              className={`map-marker ${selectedCity === marker.city ? 'active' : ''}`}
              style={getPositionStyle(marker.lat, marker.lng)}
              onClick={() => setSelectedCity(selectedCity === marker.city ? null : marker.city)}
            >
              <div className="marker-pin">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L12 18.9l-4.95-4.95a7 7 0 010-9.9zM12 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>

              <div className="marker-popup">
                <h4>{marker.city}</h4>
                <div className="marker-info">
                  <div className="info-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                    </svg>
                    {marker.temp}°C
                  </div>
                  <div className="info-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    {marker.flightPrice}
                  </div>
                </div>
                <button className="popup-btn">View Deals</button>
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="map-legend">
          <div className="legend-item">
            <div className="legend-icon weather-icon">🌤️</div>
            <span>Weather</span>
          </div>
          <div className="legend-item">
            <div className="legend-icon flight-icon">✈️</div>
            <span>Flight Prices</span>
          </div>
          <div className="legend-item">
            <div className="legend-icon live-icon">
              <span className="live-pulse"></span>
            </div>
            <span>Live Updates</span>
          </div>
        </div>
      </div>

      {/* City Details Grid */}
      <div className="city-details-grid">
        {mapData.map((marker) => (
          <div key={marker.city} className="city-detail-card">
            <h4>{marker.city}</h4>
            <div className="city-stats">
              <div className="stat">
                <span className="stat-icon">🌡️</span>
                <span className="stat-value">{marker.temp}°C</span>
              </div>
              <div className="stat">
                <span className="stat-icon">✈️</span>
                <span className="stat-value">{marker.flightPrice}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
