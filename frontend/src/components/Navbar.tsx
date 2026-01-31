import { useEffect, useState } from 'react';
import LanguageSelector from './LanguageSelector';
import CurrencySelector from './CurrencySelector';
import { useTranslation } from '../i18n';

interface NavbarProps {
  onProfileClick: () => void;
  onDashboardClick: () => void;
  onBudgetClick?: () => void;
  onNotificationClick?: () => void;
  onFlightTrackerClick?: () => void;
  onTripTrackingClick?: () => void;
  onLocationTrackerClick?: () => void;
  onAuthClick?: () => void;
  onLogout?: () => void;
  onAdventureClick?: () => void;
  onSavedTripsClick?: () => void;
  onSearch?: (query: string) => void;
  isLoggedIn: boolean;
  userName?: string;
}

export default function Navbar({ 
  onProfileClick, 
  onDashboardClick, 
  onBudgetClick,
  onNotificationClick,
  onFlightTrackerClick,
  onTripTrackingClick,
  onLocationTrackerClick,
  onAuthClick,
  onLogout,
  onAdventureClick,
  onSavedTripsClick,
  onSearch,
  isLoggedIn,
  userName 
}: NavbarProps) {
  const { t } = useTranslation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showTrackingMenu, setShowTrackingMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState<{ type: string; name: string; description: string }[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Popular destinations and search suggestions
  const searchDatabase = [
    { type: 'destination', name: 'Paris, France', description: 'City of Lights - Eiffel Tower, Louvre Museum' },
    { type: 'destination', name: 'Tokyo, Japan', description: 'Ancient temples & modern skyscrapers' },
    { type: 'destination', name: 'New York, USA', description: 'The Big Apple - Times Square, Central Park' },
    { type: 'destination', name: 'Bali, Indonesia', description: 'Tropical paradise - beaches & temples' },
    { type: 'destination', name: 'Dubai, UAE', description: 'Luxury shopping & ultramodern architecture' },
    { type: 'destination', name: 'Rome, Italy', description: 'Ancient history - Colosseum, Vatican' },
    { type: 'destination', name: 'London, UK', description: 'Royal palaces & historic landmarks' },
    { type: 'destination', name: 'Sydney, Australia', description: 'Opera House & beautiful harbors' },
    { type: 'destination', name: 'Maldives', description: 'Crystal clear waters & overwater villas' },
    { type: 'destination', name: 'Barcelona, Spain', description: 'Gaudí architecture & Mediterranean beaches' },
    { type: 'hotel', name: 'Luxury Hotels', description: 'Find 5-star accommodations worldwide' },
    { type: 'hotel', name: 'Budget Hotels', description: 'Affordable stays without compromise' },
    { type: 'hotel', name: 'Beach Resorts', description: 'Oceanfront paradise destinations' },
    { type: 'flight', name: 'Direct Flights', description: 'Non-stop flight options' },
    { type: 'flight', name: 'Business Class', description: 'Premium flight experiences' },
    { type: 'activity', name: 'Adventure Tours', description: 'Hiking, diving & extreme sports' },
    { type: 'activity', name: 'City Tours', description: 'Guided cultural experiences' },
    { type: 'activity', name: 'Food Tours', description: 'Culinary adventures worldwide' },
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.length > 0) {
      const filtered = searchDatabase.filter(item =>
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase()) ||
        item.type.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered.slice(0, 6));
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery);
      setShowSearchResults(false);
    }
  };

  const handleResultClick = (result: { type: string; name: string }) => {
    setSearchQuery(result.name);
    setShowSearchResults(false);
    if (onSearch) {
      onSearch(`Plan a trip to ${result.name}`);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'destination': return '📍';
      case 'hotel': return '🏨';
      case 'flight': return '✈️';
      case 'activity': return '🎯';
      default: return '🔍';
    }
  };

  return (
    <nav className={`navbar${isScrolled ? ' navbar--scrolled' : ''}`}>
      <div className="navbar-content">
        <div className="navbar-brand">
          <svg className="navbar-logo" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="navbar-title">Adventure Travel Planner</span>
        </div>

        <div className="navbar-search" style={{ position: 'relative' }}>
          <form onSubmit={handleSearchSubmit}>
            <svg className="search-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
            <input
              type="text"
              placeholder="Search destinations, hotels, flights..."
              className="navbar-search-input"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchQuery && setShowSearchResults(true)}
              onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
            />
          </form>
          
          {/* Search Results Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="search-results-dropdown">
              {searchResults.map((result, index) => (
                <div 
                  key={index} 
                  className="search-result-item"
                  onClick={() => handleResultClick(result)}
                >
                  <span className="search-result-icon">{getTypeIcon(result.type)}</span>
                  <div className="search-result-content">
                    <div className="search-result-name">{result.name}</div>
                    <div className="search-result-description">{result.description}</div>
                  </div>
                  <span className="search-result-type">{result.type}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="navbar-actions">
          {/* Language & Currency Selectors */}
          <div className="navbar-selectors">
            <LanguageSelector />
            <CurrencySelector variant="compact" />
          </div>

          <button className="navbar-btn" onClick={onAdventureClick}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Adventure</span>
          </button>
          <button className="navbar-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>About</span>
          </button>
          <button className="navbar-btn" onClick={onDashboardClick}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>My Trips</span>
          </button>

          {/* Tracking Dropdown - Available for everyone */}
          <div className="tracking-menu-wrapper">
            <button 
              className="navbar-btn tracking-btn"
              onClick={() => setShowTrackingMenu(!showTrackingMenu)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <span>Track</span>
              <svg viewBox="0 0 20 20" fill="currentColor" className="tracking-chevron" style={{width: '12px', height: '12px', marginLeft: '4px'}}>
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            {showTrackingMenu && (
              <div className="tracking-dropdown">
                <button className="tracking-dropdown-item" onClick={() => { onFlightTrackerClick?.(); setShowTrackingMenu(false); }}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                  </svg>
                  ✈️ Flight Tracker
                </button>
                <button className="tracking-dropdown-item" onClick={() => { onTripTrackingClick?.(); setShowTrackingMenu(false); }}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  📍 Trip Progress
                </button>
                <button className="tracking-dropdown-item" onClick={() => { onLocationTrackerClick?.(); setShowTrackingMenu(false); }}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
                  </svg>
                  🌍 My Location
                </button>
              </div>
            )}
          </div>

          {isLoggedIn && (
            <>
              <button className="navbar-btn" onClick={onSavedTripsClick}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <span>{t('nav.myTrips')}</span>
              </button>
              <button className="navbar-btn" onClick={onBudgetClick}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{t('nav.budget')}</span>
              </button>
              <button className="navbar-btn notification-btn" onClick={onNotificationClick}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span>Alerts</span>
              </button>
            </>
          )}

          {isLoggedIn ? (
            <div className="navbar-profile-wrapper">
              <button
                className="navbar-profile-btn"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <div className="profile-avatar">{getInitials(userName)}</div>
                <span>{userName || 'User'}</span>
                <svg viewBox="0 0 20 20" fill="currentColor" className="profile-chevron">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {showProfileMenu && (
                <div className="profile-dropdown">
                  <button className="profile-dropdown-item" onClick={onProfileClick}>
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    My Profile
                  </button>
                  <button className="profile-dropdown-item" onClick={onDashboardClick}>
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                    Travel Dashboard
                  </button>
                  <button className="profile-dropdown-item" onClick={onBudgetClick}>
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                    </svg>
                    Budget Tracker
                  </button>
                  <button className="profile-dropdown-item" onClick={onNotificationClick}>
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                    </svg>
                    Notifications
                  </button>
                  <hr className="profile-dropdown-divider" />
                  <button className="profile-dropdown-item" onClick={onFlightTrackerClick}>
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path d="M17.5 12h-2.79l-1.01-4.53L9.95 5.76c-.63-.29-.63-1.2 0-1.49l3.75-1.71 1.01-4.53H17.5c.69 0 1.25.56 1.25 1.25v11.47c0 .69-.56 1.25-1.25 1.25z"/>
                    </svg>
                    Flight Tracker
                  </button>
                  <button className="profile-dropdown-item" onClick={onTripTrackingClick}>
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    Trip Progress
                  </button>
                  <button className="profile-dropdown-item" onClick={onLocationTrackerClick}>
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12zm0-10a1 1 0 011 1v3.586l2.707 2.707a1 1 0 01-1.414 1.414l-3-3A1 1 0 019 11V7a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    My Location
                  </button>
                  <hr className="profile-dropdown-divider" />
                  <button className="profile-dropdown-item" onClick={onLogout}>
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="navbar-btn-primary" onClick={onAuthClick}>
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              Login / Sign Up
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
