import { useState } from 'react';

interface CustomerProfile {
  customerId: string;
  name: string;
  email: string;
  phone: string;
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
}

export default function UserProfile({ isVisible, onClose }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<CustomerProfile>({
    customerId: 'CUST_0001',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+91 98765 43210',
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
  });

  if (!isVisible) return null;

  const getLoyaltyStatus = (points: number) => {
    if (points >= 10000) return { tier: 'Platinum', color: '#E5E4E2' };
    if (points >= 5000) return { tier: 'Gold', color: '#FFD700' };
    if (points >= 2000) return { tier: 'Silver', color: '#C0C0C0' };
    return { tier: 'Bronze', color: '#CD7F32' };
  };

  const loyaltyStatus = getLoyaltyStatus(profile.loyaltyPoints);

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
            <div className="profile-avatar-large">
              {profile.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="profile-info">
              <h3>{profile.name}</h3>
              <p>{profile.email}</p>
              <p>{profile.phone}</p>
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
