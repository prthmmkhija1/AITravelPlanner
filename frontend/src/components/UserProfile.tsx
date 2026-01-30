import { useState, useEffect } from 'react';

interface CustomerProfile {
  customerId: string;
  name: string;
  email: string;
  phone: string;
  picture?: string;
  provider?: string;
  preferences: {
    preferredClass: string;
    budgetCategory: string;
    travelType: string;
  };
  travelHistory: Array<{
    tripId: string;
    destination: string;
    travelDates: string[];
    totalCost: number;
    satisfactionRating: number;
  }>;
  loyaltyPoints: number;
}

interface UserProfileProps {
  isVisible: boolean;
  onClose: () => void;
  user?: {
    id?: number | string;
    username?: string;
    email?: string;
    phone?: string;
    picture?: string;
    provider?: string;
  } | null;
}

export default function UserProfile({ isVisible, onClose, user }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  // Initialize profile with user data or defaults
  const getInitialProfile = (): CustomerProfile => {
    const storedUser = user || JSON.parse(localStorage.getItem('user') || 'null');
    
    return {
      customerId: storedUser?.id ? `CUST_${storedUser.id}` : 'CUST_GUEST',
      name: storedUser?.username || 'Guest User',
      email: storedUser?.email || 'guest@example.com',
      phone: storedUser?.phone || '',
      picture: storedUser?.picture || '',
      provider: storedUser?.provider || 'email',
      preferences: {
        preferredClass: 'Economy',
        budgetCategory: 'Standard',
        travelType: 'Leisure'
      },
      travelHistory: [
        {
          tripId: 'TRIP_001',
          destination: 'Goa, India',
          travelDates: ['2025-12-15', '2025-12-20'],
          totalCost: 45000,
          satisfactionRating: 5
        },
        {
          tripId: 'TRIP_002',
          destination: 'Jaipur, India',
          travelDates: ['2025-10-10', '2025-10-14'],
          totalCost: 32000,
          satisfactionRating: 4
        }
      ],
      loyaltyPoints: 2500
    };
  };

  const [profile, setProfile] = useState<CustomerProfile>(getInitialProfile);

  // Update profile when user changes
  useEffect(() => {
    setProfile(getInitialProfile());
  }, [user]);

  if (!isVisible) return null;

  const getLoyaltyStatus = (points: number) => {
    if (points >= 10000) return { tier: 'Platinum', color: '#E5E4E2' };
    if (points >= 5000) return { tier: 'Gold', color: '#FFD700' };
    if (points >= 2000) return { tier: 'Silver', color: '#C0C0C0' };
    return { tier: 'Bronze', color: '#CD7F32' };
  };

  const loyaltyStatus = getLoyaltyStatus(profile.loyaltyPoints);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="profile-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="profile-modal-header">
          <h2>My Profile</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="profile-modal-content">
          {/* Profile Summary */}
          <div className="profile-summary">
            {profile.picture ? (
              <img 
                src={profile.picture} 
                alt={profile.name} 
                className="profile-avatar-large profile-avatar-img"
              />
            ) : (
              <div className="profile-avatar-large">
                {getInitials(profile.name)}
              </div>
            )}
            <div className="profile-info">
              <h3>{profile.name}</h3>
              <p>{profile.email}</p>
              {profile.phone && <p>{profile.phone}</p>}
              {profile.provider === 'google' && (
                <span className="provider-badge google-badge">
                  <svg viewBox="0 0 24 24" width="14" height="14">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Signed in with Google
                </span>
              )}
              <div className="loyalty-badge" style={{ backgroundColor: loyaltyStatus.color }}>
                {loyaltyStatus.tier} Member • {profile.loyaltyPoints} pts
              </div>
            </div>
            <button
              className="edit-profile-btn"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Save' : 'Edit Profile'}
            </button>
          </div>

          {/* Travel Preferences */}
          <div className="profile-section">
            <h4>Travel Preferences</h4>
            <div className="preference-grid">
              <div className="preference-item">
                <label>Preferred Class</label>
                {isEditing ? (
                  <select value={profile.preferences.preferredClass}>
                    <option>Economy</option>
                    <option>Premium Economy</option>
                    <option>Business</option>
                    <option>First Class</option>
                  </select>
                ) : (
                  <span>{profile.preferences.preferredClass}</span>
                )}
              </div>
              <div className="preference-item">
                <label>Budget Category</label>
                {isEditing ? (
                  <select value={profile.preferences.budgetCategory}>
                    <option>Budget</option>
                    <option>Standard</option>
                    <option>Premium</option>
                    <option>Luxury</option>
                  </select>
                ) : (
                  <span>{profile.preferences.budgetCategory}</span>
                )}
              </div>
              <div className="preference-item">
                <label>Travel Type</label>
                {isEditing ? (
                  <select value={profile.preferences.travelType}>
                    <option>Leisure</option>
                    <option>Business</option>
                    <option>Family</option>
                    <option>Adventure</option>
                  </select>
                ) : (
                  <span>{profile.preferences.travelType}</span>
                )}
              </div>
            </div>
          </div>

          {/* Travel History */}
          <div className="profile-section">
            <h4>Recent Trips</h4>
            <div className="trip-history">
              {profile.travelHistory.map((trip) => (
                <div key={trip.tripId} className="trip-history-item">
                  <div className="trip-icon">✈️</div>
                  <div className="trip-details">
                    <h5>{trip.destination}</h5>
                    <p className="trip-dates">
                      {new Date(trip.travelDates[0]).toLocaleDateString()} - {new Date(trip.travelDates[1]).toLocaleDateString()}
                    </p>
                    <div className="trip-meta">
                      <span className="trip-cost">₹{trip.totalCost.toLocaleString()}</span>
                      <span className="trip-rating">
                        {'⭐'.repeat(trip.satisfactionRating)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Statistics */}
          <div className="profile-section">
            <h4>Travel Statistics</h4>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{profile.travelHistory.length}</div>
                <div className="stat-label">Total Trips</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">
                  ₹{(profile.travelHistory.reduce((sum, t) => sum + t.totalCost, 0) / profile.travelHistory.length).toLocaleString()}
                </div>
                <div className="stat-label">Avg Trip Cost</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">
                  {(profile.travelHistory.reduce((sum, t) => sum + t.satisfactionRating, 0) / profile.travelHistory.length).toFixed(1)}
                </div>
                <div className="stat-label">Avg Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
