import { useState, useEffect } from 'react';
import { getTrips, updateTrip, deleteTrip, isAuthenticated } from '../api';

interface SavedDestination {
  id: number;
  name: string;
  country: string;
  image: string;
  price: string;
  rating: number;
}

interface TravelDashboardProps {
  isVisible: boolean;
  onClose: () => void;
  onPlanNewTrip?: () => void;
  savedDestinations?: SavedDestination[];
  onRemoveDestination?: (id: number) => void;
}

interface Trip {
  id: number;
  destination: string;
  source: string;
  start_date: string;
  end_date: string;
  travelers: number;
  status: 'planned' | 'booked' | 'completed';
  trip_plan: string;
  user_request: string;
  created_at: string;
  rating: number | null;
}

export default function TravelDashboard({ isVisible, onClose, onPlanNewTrip, savedDestinations = [], onRemoveDestination }: TravelDashboardProps) {
  const [activeTab, setActiveTab] = useState<'current' | 'past' | 'saved'>('current');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isVisible && isAuthenticated()) {
      loadTrips();
    }
  }, [isVisible]);

  const loadTrips = async () => {
    setLoading(true);
    try {
      const result = await getTrips();
      if (result.status === 'success') {
        setTrips(result.trips);
      }
    } catch (error) {
      console.error('Failed to load trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentTrips = trips.filter(t => t.status === 'planned' || t.status === 'booked');
  const pastTrips = trips.filter(t => t.status === 'completed');

  const handleRateTrip = async (tripId: number, rating: number) => {
    try {
      await updateTrip(tripId, { rating, status: 'completed' });
      loadTrips();
    } catch (error) {
      console.error('Failed to rate trip:', error);
    }
  };

  const handleDeleteTrip = async (tripId: number) => {
    if (!confirm('Are you sure you want to delete this trip?')) return;
    try {
      await deleteTrip(tripId);
      loadTrips();
    } catch (error) {
      console.error('Failed to delete trip:', error);
    }
  };

  if (!isVisible) return null;

  const exportToPDF = (trip: Trip) => {
    // Create PDF content
    const pdfContent = `
AI Travel Planner - Itinerary
================================

Destination: ${trip.destination}
From: ${trip.source || 'N/A'}
Travel Dates: ${trip.start_date || 'Not specified'} - ${trip.end_date || 'Not specified'}
Travelers: ${trip.travelers}

Trip Plan:
${trip.trip_plan}

Status: ${trip.status.toUpperCase()}

Generated on: ${new Date().toLocaleDateString()}
    `.trim();

    // Create blob and download
    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${trip.destination.replace(/\s+/g, '_')}_Itinerary.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Not specified';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="dashboard-overlay" onClick={onClose}>
      <div className="dashboard-modal" onClick={(e) => e.stopPropagation()}>
        <div className="dashboard-header">
          <h2>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            My Travel Dashboard
          </h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="dashboard-tabs">
          <button
            className={`tab ${activeTab === 'current' ? 'active' : ''}`}
            onClick={() => setActiveTab('current')}
          >
            Current Plans ({currentTrips.length})
          </button>
          <button
            className={`tab ${activeTab === 'past' ? 'active' : ''}`}
            onClick={() => setActiveTab('past')}
          >
            Past Trips ({pastTrips.length})
          </button>
          <button
            className={`tab ${activeTab === 'saved' ? 'active' : ''}`}
            onClick={() => setActiveTab('saved')}
          >
            Saved Destinations ({savedDestinations.length})
          </button>
        </div>

        <div className="dashboard-content">
          {loading && <div className="loading">Loading trips...</div>}

          {activeTab === 'current' && (
            <div className="itinerary-grid">
              {currentTrips.length === 0 && !loading ? (
                <div className="empty-state">
                  <p>No current trips planned yet.</p>
                  <p>Plan your next adventure below!</p>
                </div>
              ) : (
                currentTrips.map((trip) => (
                  <div key={trip.id} className="itinerary-card">
                    <div className="itinerary-header">
                      <h3>{trip.destination}</h3>
                      <span className={`status-badge ${trip.status}`}>
                        {trip.status}
                      </span>
                    </div>

                    <div className="itinerary-body">
                      <div className="itinerary-meta">
                        <div className="meta-item">
                          <svg viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                        </div>
                        <div className="meta-item">
                          <svg viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                          </svg>
                          {trip.travelers} traveler(s)
                        </div>
                      </div>

                      <div className="trip-route">
                        {trip.source && <span>{trip.source} → </span>}
                        <strong>{trip.destination}</strong>
                      </div>
                    </div>

                    <div className="itinerary-actions">
                      <button className="btn-secondary" onClick={() => exportToPDF(trip)}>
                        <svg viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                        </svg>
                        Export PDF
                      </button>
                      <button className="btn-danger" onClick={() => handleDeleteTrip(trip.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}

              <div className="itinerary-card add-new">
                <div className="add-new-content" onClick={() => { onPlanNewTrip?.(); onClose(); }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  <h3>Plan New Trip</h3>
                  <p>Start planning your next adventure</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'past' && (
            <div className="past-trips-list">
              {pastTrips.length === 0 ? (
                <div className="empty-state">
                  <p>No completed trips yet.</p>
                </div>
              ) : (
                pastTrips.map((trip) => (
                  <div key={trip.id} className="past-trip-card">
                    <div className="past-trip-image">
                      <div className="past-trip-overlay">
                        {trip.rating ? '⭐'.repeat(trip.rating) : (
                          <div className="rate-trip">
                            {[1,2,3,4,5].map(star => (
                              <button key={star} onClick={() => handleRateTrip(trip.id, star)}>⭐</button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="past-trip-info">
                      <h3>{trip.destination}</h3>
                      <p>{formatDate(trip.start_date)} - {formatDate(trip.end_date)}</p>
                    </div>
                    <button className="btn-secondary">Book Again</button>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'saved' && (
            <div className="saved-destinations">
              {savedDestinations.length === 0 ? (
                <p className="empty-state">No saved destinations yet. Start exploring!</p>
              ) : (
                <div className="saved-destinations-grid">
                  {savedDestinations.map((dest) => (
                    <div key={dest.id} className="saved-destination-card">
                      <div className="saved-destination-image">
                        <img src={dest.image} alt={dest.name} loading="lazy" />
                        <button 
                          className="remove-saved-btn"
                          onClick={() => onRemoveDestination?.(dest.id)}
                          title="Remove from saved"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div className="saved-destination-info">
                        <h4>{dest.name}</h4>
                        <p>{dest.country}</p>
                        <div className="saved-destination-footer">
                          <span className="saved-price">{dest.price}</span>
                          <span className="saved-rating">⭐ {dest.rating}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
