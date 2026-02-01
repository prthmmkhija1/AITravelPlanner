import { useState, useEffect, useRef } from 'react';
import RegionSelector from './RegionSelector';
import { useTranslation } from '../i18n';
import './NavbarDark.css';

interface NavbarDarkProps {
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
  onPlanTrip?: () => void;
  onDestinationSelect?: (destination: string) => void;
  isLoggedIn: boolean;
  userName?: string;
}

const DISCOVER_DESTINATIONS = [
  { name: 'Indonesia', emoji: '🏝️', tagline: 'Tropical Paradise' },
  { name: 'Goa', emoji: '🏖️', tagline: 'Beach Vibes' },
  { name: 'Kerala', emoji: '🌴', tagline: 'God\'s Own Country' },
  { name: 'Thailand', emoji: '🛕', tagline: 'Land of Smiles' },
  { name: 'Greece', emoji: '🏛️', tagline: 'Ancient Wonders' },
  { name: 'Maldives', emoji: '🐚', tagline: 'Island Dreams' },
  { name: 'Bali', emoji: '🌺', tagline: 'Spiritual Escape' },
  { name: 'Dubai', emoji: '🏙️', tagline: 'Luxury Redefined' },
];

export default function NavbarDark({ 
  onProfileClick, 
  onDashboardClick, 
  onBudgetClick,
  onNotificationClick,
  onFlightTrackerClick,
  onAuthClick,
  onLogout,
  onSavedTripsClick,
  onDestinationSelect,
  isLoggedIn,
  userName 
}: NavbarDarkProps) {
  const { t } = useTranslation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showDiscoverMenu, setShowDiscoverMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const profileRef = useRef<HTMLDivElement>(null);
  const discoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (discoverRef.current && !discoverRef.current.contains(event.target as Node)) {
        setShowDiscoverMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleDestinationClick = (destination: string) => {
    setShowDiscoverMenu(false);
    onDestinationSelect?.(destination);
  };

  return (
    <nav className={`navbar-dark ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-dark-content">
        <div className="navbar-dark-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="brand-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M12 8l2.5 4-2.5 4-2.5-4L12 8z" fill="currentColor"/>
              <circle cx="12" cy="12" r="2" fill="white"/>
            </svg>
          </div>
          <span className="brand-text">Navigo</span>
        </div>

        <div className="navbar-dark-nav">
          <div className="nav-dropdown-wrapper" ref={discoverRef}>
            <button 
              className={`nav-link ${showDiscoverMenu ? 'active' : ''}`}
              onClick={() => setShowDiscoverMenu(!showDiscoverMenu)}
            >
              {t('nav.discover')}
              <svg className={`nav-chevron ${showDiscoverMenu ? 'open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            
            {showDiscoverMenu && (
              <div className="discover-dropdown">
                <div className="discover-dropdown-header">
                  <span>🌍 Popular Destinations</span>
                </div>
                <div className="discover-grid">
                  {DISCOVER_DESTINATIONS.map((dest) => (
                    <button key={dest.name} className="discover-item" onClick={() => handleDestinationClick(dest.name)}>
                      <span className="discover-emoji">{dest.emoji}</span>
                      <div className="discover-info">
                        <span className="discover-name">{dest.name}</span>
                        <span className="discover-tagline">{dest.tagline}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button className="nav-link" onClick={onDashboardClick}>{t('nav.myTrips')}</button>
          <button className="nav-link" onClick={onFlightTrackerClick}>{t('nav.flights')}</button>
          <button className="nav-link" onClick={onBudgetClick}>{t('nav.budget')}</button>
        </div>

        <div className="navbar-dark-right">
          <div className="navbar-dark-selectors">
            <RegionSelector />
          </div>

          {isLoggedIn && (
            <button className="icon-btn notification-icon" onClick={onNotificationClick}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span className="notification-dot"></span>
            </button>
          )}

          {isLoggedIn ? (
            <div className="profile-menu-wrapper" ref={profileRef}>
              <button className="profile-btn-dark" onClick={() => setShowProfileMenu(!showProfileMenu)}>
                <span className="user-name-display">{userName?.split(' ')[0] || 'Traveler'}</span>
                <div className="avatar-dark">{getInitials(userName)}</div>
              </button>

              {showProfileMenu && (
                <div className="profile-dropdown-dark">
                  <div className="profile-dropdown-header">
                    <div className="profile-header-avatar">{getInitials(userName)}</div>
                    <div className="profile-header-info">
                      <span className="profile-header-name">{userName || 'Traveler'}</span>
                      <span className="profile-header-status">✨ Premium Member</span>
                    </div>
                  </div>
                  <div className="profile-dropdown-items">
                    <button onClick={() => { onProfileClick(); setShowProfileMenu(false); }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/>
                      </svg>
                      <span>My Profile</span>
                      <span className="menu-arrow">→</span>
                    </button>
                    <button onClick={() => { onSavedTripsClick?.(); setShowProfileMenu(false); }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                      </svg>
                      <span>Saved Trips</span>
                      <span className="menu-badge">3</span>
                    </button>
                    <button onClick={() => { onBudgetClick?.(); setShowProfileMenu(false); }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/><path d="M12 6v12M9 9h6M9 15h6"/>
                      </svg>
                      <span>Budget</span>
                    </button>
                  </div>
                  <div className="profile-dropdown-footer">
                    <button onClick={() => { onLogout?.(); setShowProfileMenu(false); }} className="logout-btn">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
                      </svg>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button className="login-btn-dark" onClick={onAuthClick}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/>
              </svg>
              Sign In
            </button>
          )}

          <button className="mobile-menu-toggle" onClick={() => setShowMobileMenu(!showMobileMenu)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {showMobileMenu ? <path d="M6 18L18 6M6 6l12 12"/> : <path d="M4 6h16M4 12h16M4 18h16"/>}
            </svg>
          </button>
        </div>
      </div>

      {showMobileMenu && (
        <div className="mobile-menu-dark">
          <div className="mobile-menu-destinations">
            <span className="mobile-menu-label">🌍 Destinations</span>
            <div className="mobile-destinations-grid">
              {DISCOVER_DESTINATIONS.slice(0, 4).map((dest) => (
                <button key={dest.name} onClick={() => { handleDestinationClick(dest.name); setShowMobileMenu(false); }}>
                  {dest.emoji} {dest.name}
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => { onDashboardClick?.(); setShowMobileMenu(false); }}>My Trips</button>
          <button onClick={() => { onFlightTrackerClick?.(); setShowMobileMenu(false); }}>Flights</button>
          <button onClick={() => { onBudgetClick?.(); setShowMobileMenu(false); }}>Budget</button>
          {!isLoggedIn && (
            <button onClick={() => { onAuthClick?.(); setShowMobileMenu(false); }} className="mobile-login">Sign In</button>
          )}
        </div>
      )}
    </nav>
  );
}
