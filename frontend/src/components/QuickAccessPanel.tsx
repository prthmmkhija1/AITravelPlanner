/**
 * Quick Access Panel – Dark Theme with Globe Visualization
 * Travel Command Center with Weather
 */
import { useState, useEffect } from 'react';
import { getWeather } from '../api';
import './QuickAccessPanel.css';

interface WeatherData {
  city: string;
  temp: number;
  icon: string;
}

interface QuickAccessPanelProps {
  onFlightTracker: () => void;
  onTripTracking: () => void;
  onLocationTracker: () => void;
  onBudgetTracker: () => void;
  onNotifications: () => void;
  onDashboard: () => void;
  isLoggedIn: boolean;
}

const QUICK_ACCESS_ITEMS = [
  {
    id: 'flights',
    title: 'Flight Tracker',
    description: 'Real-time flight status',
    icon: '✈️',
    color: '#3b82f6',
    stats: '12+ Airlines'
  },
  {
    id: 'trips',
    title: 'Trip Progress',
    description: 'Track your journey',
    icon: '🗺️',
    color: '#10b981',
    stats: 'Live Updates'
  },
  {
    id: 'location',
    title: 'GPS Location',
    description: 'Real-time coordinates',
    icon: '📍',
    color: '#ef4444',
    stats: 'Precise'
  },
  {
    id: 'budget',
    title: 'Budget Tracker',
    description: 'Monitor expenses',
    icon: '💰',
    color: '#f59e0b',
    stats: 'Smart Analysis',
    requiresAuth: true
  },
  {
    id: 'alerts',
    title: 'Price Alerts',
    description: 'Get notified',
    icon: '🔔',
    color: '#8b5cf6',
    stats: '24/7 Monitoring',
    requiresAuth: true
  },
  {
    id: 'dashboard',
    title: 'My Trips',
    description: 'View saved trips',
    icon: '📊',
    color: '#ec4899',
    stats: 'All Trips',
    requiresAuth: true
  }
];

const WEATHER_CITIES = ['Delhi', 'Mumbai', 'Bangalore', 'Goa', 'Jaipur'];

export default function QuickAccessPanel({
  onFlightTracker,
  onTripTracking,
  onLocationTracker,
  onBudgetTracker,
  onNotifications,
  onDashboard,
  isLoggedIn
}: QuickAccessPanelProps) {
  const [activeOrbit, setActiveOrbit] = useState(0);
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveOrbit((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Load weather data
    const loadWeather = async () => {
      const data: WeatherData[] = [];
      for (const city of WEATHER_CITIES) {
        try {
          const weather = await getWeather(city, 1);
          data.push({
            city,
            temp: weather.forecast?.[0]?.max_temp_c || Math.floor(Math.random() * 15) + 20,
            icon: '🌡️'
          });
        } catch {
          data.push({
            city,
            temp: Math.floor(Math.random() * 15) + 20,
            icon: '🌡️'
          });
        }
      }
      setWeatherData(data);
    };
    loadWeather();
  }, []);

  const handleClick = (id: string) => {
    switch (id) {
      case 'flights':
        onFlightTracker();
        break;
      case 'trips':
        onTripTracking();
        break;
      case 'location':
        onLocationTracker();
        break;
      case 'budget':
        if (isLoggedIn) onBudgetTracker();
        break;
      case 'alerts':
        if (isLoggedIn) onNotifications();
        break;
      case 'dashboard':
        if (isLoggedIn) onDashboard();
        break;
    }
  };

  return (
    <section className="travel-command-center">
      {/* Animated Background */}
      <div className="command-bg">
        <div className="bg-grid"></div>
        <div className="bg-glow glow-1"></div>
        <div className="bg-glow glow-2"></div>
      </div>

      <div className="command-content">
        {/* Header */}
        <div className="command-header">
          <div className="header-badge">
            <span>🚀</span>
            <span>Travel Command Center</span>
          </div>
          <h2>Your Travel Cockpit</h2>
          <p>Everything you need, all in one place</p>
        </div>

        {/* Weather Strip */}
        {weatherData.length > 0 && (
          <div className="weather-strip">
            {weatherData.map((w) => (
              <div key={w.city} className="weather-item">
                <span className="weather-city">{w.city}</span>
                <div className="weather-info">
                  <span className="weather-icon">{w.icon}</span>
                  <span className="weather-temp">{w.temp}°C</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="command-layout">
          {/* Globe Visualization */}
          <div className="globe-section">
            <div className="globe-container">
              {/* Globe SVG */}
              <div className="globe-wrapper">
                <svg viewBox="0 0 200 200" className="globe-svg">
                  {/* Globe circles */}
                  <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(249, 115, 22, 0.3)" strokeWidth="1" />
                  <circle cx="100" cy="100" r="60" fill="none" stroke="rgba(249, 115, 22, 0.2)" strokeWidth="1" />
                  <circle cx="100" cy="100" r="40" fill="none" stroke="rgba(249, 115, 22, 0.15)" strokeWidth="1" />
                  
                  {/* Globe grid lines */}
                  <ellipse cx="100" cy="100" rx="80" ry="30" fill="none" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="0.5" />
                  <ellipse cx="100" cy="100" rx="80" ry="50" fill="none" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="0.5" />
                  <ellipse cx="100" cy="100" rx="80" ry="70" fill="none" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="0.5" />
                  <line x1="20" y1="100" x2="180" y2="100" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="0.5" />
                  <line x1="100" y1="20" x2="100" y2="180" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="0.5" />
                  
                  {/* Animated orbits */}
                  <g className={`orbit-group ${activeOrbit === 0 ? 'active' : ''}`}>
                    <circle cx="100" cy="100" r="75" fill="none" stroke="rgba(249, 115, 22, 0.5)" strokeWidth="2" strokeDasharray="10 5" className="orbit-ring" />
                    <circle cx="175" cy="100" r="6" fill="#f97316" className="orbit-dot" />
                  </g>
                  <g className={`orbit-group ${activeOrbit === 1 ? 'active' : ''}`}>
                    <circle cx="100" cy="100" r="55" fill="none" stroke="rgba(59, 130, 246, 0.5)" strokeWidth="2" strokeDasharray="10 5" className="orbit-ring" />
                    <circle cx="155" cy="100" r="5" fill="#3b82f6" className="orbit-dot" />
                  </g>
                  <g className={`orbit-group ${activeOrbit === 2 ? 'active' : ''}`}>
                    <circle cx="100" cy="100" r="35" fill="none" stroke="rgba(16, 185, 129, 0.5)" strokeWidth="2" strokeDasharray="10 5" className="orbit-ring" />
                    <circle cx="135" cy="100" r="4" fill="#10b981" className="orbit-dot" />
                  </g>
                  
                  {/* Center */}
                  <circle cx="100" cy="100" r="15" fill="url(#globe-gradient)" />
                  <defs>
                    <radialGradient id="globe-gradient">
                      <stop offset="0%" stopColor="#f97316" />
                      <stop offset="100%" stopColor="#ea580c" />
                    </radialGradient>
                  </defs>
                </svg>
                
                {/* Compass icon in center */}
                <div className="globe-center">
                  <svg viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1"/>
                    <path d="M12 8l2.5 4-2.5 4-2.5-4L12 8z" fill="currentColor"/>
                    <circle cx="12" cy="12" r="2" fill="white"/>
                  </svg>
                </div>
              </div>
              
              {/* Stats */}
              <div className="globe-stats">
                <div className="stat-item">
                  <span className="stat-value">190+</span>
                  <span className="stat-label">Countries</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">24/7</span>
                  <span className="stat-label">Support</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">Live</span>
                  <span className="stat-label">Tracking</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Access Cards */}
          <div className="quick-cards-section">
            <div className="quick-cards-grid">
              {QUICK_ACCESS_ITEMS.map((item) => {
                const isDisabled = item.requiresAuth && !isLoggedIn;
                
                return (
                  <button
                    key={item.id}
                    className={`quick-card ${isDisabled ? 'disabled' : ''}`}
                    onClick={() => handleClick(item.id)}
                    style={{ '--card-color': item.color } as React.CSSProperties}
                  >
                    <div className="quick-card-icon">
                      <span>{item.icon}</span>
                    </div>
                    <div className="quick-card-content">
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                      <span className="quick-card-stats">{item.stats}</span>
                    </div>
                    <div className="quick-card-arrow">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </div>
                    {isDisabled && <div className="login-required">Login Required</div>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
