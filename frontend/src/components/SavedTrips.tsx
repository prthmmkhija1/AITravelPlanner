import { useState, useEffect } from 'react';
import { getTrips, updateTrip, deleteTrip, saveTrip } from '../api';
import { useTranslation } from '../i18n';
import './SavedTrips.css';

interface SavedTripsProps {
  isVisible: boolean;
  onClose: () => void;
  onLoadTrip?: (tripPlan: string, userRequest: string) => void;
}

interface Trip {
  id: number;
  destination: string;
  source: string | null;
  start_date: string | null;
  end_date: string | null;
  travelers: number;
  status: 'planned' | 'ongoing' | 'completed' | 'cancelled';
  trip_plan: string;
  user_request: string;
  created_at: string;
  updated_at: string;
  rating: number | null;
}

const STATUS_OPTIONS = [
  { value: 'planned', label: 'Planned', icon: '📋', color: '#3182ce' },
  { value: 'ongoing', label: 'Ongoing', icon: '✈️', color: '#38a169' },
  { value: 'completed', label: 'Completed', icon: '✅', color: '#805ad5' },
  { value: 'cancelled', label: 'Cancelled', icon: '❌', color: '#e53e3e' },
];

export default function SavedTrips({ isVisible, onClose, onLoadTrip }: SavedTripsProps) {
  const { t } = useTranslation();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [editingRating, setEditingRating] = useState<number | null>(null);

  useEffect(() => {
    if (isVisible) {
      loadTrips();
    }
  }, [isVisible, activeFilter]);

  const loadTrips = async () => {
    setLoading(true);
    try {
      const result = await getTrips(activeFilter || undefined);
      if (result.status === 'success') {
        setTrips(result.trips);
      }
    } catch (error) {
      console.error('Failed to load trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (tripId: number, newStatus: string) => {
    try {
      await updateTrip(tripId, { status: newStatus });
      loadTrips();
    } catch (error) {
      console.error('Failed to update trip:', error);
    }
  };

  const handleRatingChange = async (tripId: number, rating: number) => {
    try {
      await updateTrip(tripId, { rating });
      setEditingRating(null);
      loadTrips();
    } catch (error) {
      console.error('Failed to update rating:', error);
    }
  };

  const handleDelete = async (tripId: number) => {
    try {
      await deleteTrip(tripId);
      setConfirmDelete(null);
      loadTrips();
    } catch (error) {
      console.error('Failed to delete trip:', error);
    }
  };

  const handleDuplicate = async (trip: Trip) => {
    try {
      await saveTrip({
        destination: trip.destination + ' (Copy)',
        trip_plan: trip.trip_plan,
        user_request: trip.user_request,
        source: trip.source || undefined,
        travelers: trip.travelers,
      });
      loadTrips();
    } catch (error) {
      console.error('Failed to duplicate trip:', error);
    }
  };

  const handleLoadTrip = (trip: Trip) => {
    if (onLoadTrip) {
      onLoadTrip(trip.trip_plan, trip.user_request);
      onClose();
    }
  };

  const handleExport = (trip: Trip) => {
    const exportData = {
      destination: trip.destination,
      source: trip.source,
      startDate: trip.start_date,
      endDate: trip.end_date,
      travelers: trip.travelers,
      tripPlan: trip.trip_plan,
      userRequest: trip.user_request,
      status: trip.status,
      rating: trip.rating,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trip-${trip.destination.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = async (trip: Trip) => {
    const shareText = `Check out my trip to ${trip.destination}!\n\n${trip.trip_plan.substring(0, 200)}...`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Trip to ${trip.destination}`,
          text: shareText,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText);
      alert('Trip details copied to clipboard!');
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Not set';
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusInfo = (status: string) => {
    return STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
  };

  if (!isVisible) return null;

  return (
    <div className="saved-trips-overlay">
      <div className="saved-trips-modal">
        <div className="saved-trips-header">
          <h2>{t('trips.saved')}</h2>
          <button className="close-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Filter tabs */}
        <div className="filter-tabs">
          <button
            className={`filter-tab ${activeFilter === null ? 'active' : ''}`}
            onClick={() => setActiveFilter(null)}
          >
            All Trips
          </button>
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status.value}
              className={`filter-tab ${activeFilter === status.value ? 'active' : ''}`}
              onClick={() => setActiveFilter(status.value)}
              style={{ '--status-color': status.color } as React.CSSProperties}
            >
              {status.icon} {status.label}
            </button>
          ))}
        </div>

        {/* Trips list */}
        <div className="trips-content">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>{t('common.loading')}</p>
            </div>
          ) : trips.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3>{t('trips.noTrips')}</h3>
              <p>Start planning your first trip!</p>
            </div>
          ) : (
            <div className="trips-grid">
              {trips.map((trip) => {
                const statusInfo = getStatusInfo(trip.status);
                return (
                  <div key={trip.id} className="trip-card">
                    <div className="trip-card-header">
                      <div className="destination-info">
                        <h3>{trip.destination}</h3>
                        {trip.source && <span className="source">From {trip.source}</span>}
                      </div>
                      <div 
                        className="status-badge"
                        style={{ background: statusInfo.color }}
                      >
                        {statusInfo.icon} {statusInfo.label}
                      </div>
                    </div>

                    <div className="trip-dates">
                      <div className="date-item">
                        <span className="label">Start</span>
                        <span className="value">{formatDate(trip.start_date)}</span>
                      </div>
                      <div className="date-divider">→</div>
                      <div className="date-item">
                        <span className="label">End</span>
                        <span className="value">{formatDate(trip.end_date)}</span>
                      </div>
                      <div className="travelers-badge">
                        👥 {trip.travelers}
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="trip-rating">
                      {editingRating === trip.id ? (
                        <div className="rating-edit">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => handleRatingChange(trip.id, star)}
                              className="star-btn"
                            >
                              ⭐
                            </button>
                          ))}
                          <button 
                            className="cancel-rating"
                            onClick={() => setEditingRating(null)}
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div 
                          className="rating-display"
                          onClick={() => setEditingRating(trip.id)}
                        >
                          {trip.rating ? (
                            <>{'⭐'.repeat(trip.rating)} ({trip.rating}/5)</>
                          ) : (
                            <span className="no-rating">Click to rate</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Trip preview */}
                    <p className="trip-preview">
                      {trip.trip_plan.substring(0, 150)}...
                    </p>

                    {/* Status selector */}
                    <div className="status-selector">
                      <label>Status:</label>
                      <select
                        value={trip.status}
                        onChange={(e) => handleStatusChange(trip.id, e.target.value)}
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Actions */}
                    <div className="trip-actions">
                      <button 
                        className="action-btn primary"
                        onClick={() => handleLoadTrip(trip)}
                        title="Load this trip"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Load
                      </button>
                      <button 
                        className="action-btn"
                        onClick={() => { setSelectedTrip(trip); setShowDetails(true); }}
                        title="View details"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button 
                        className="action-btn"
                        onClick={() => handleDuplicate(trip)}
                        title="Duplicate trip"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <button 
                        className="action-btn"
                        onClick={() => handleExport(trip)}
                        title="Export trip"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                      <button 
                        className="action-btn"
                        onClick={() => handleShare(trip)}
                        title="Share trip"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                      </button>
                      <button 
                        className="action-btn danger"
                        onClick={() => setConfirmDelete(trip.id)}
                        title="Delete trip"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    {/* Delete confirmation */}
                    {confirmDelete === trip.id && (
                      <div className="delete-confirm">
                        <p>Delete this trip?</p>
                        <div className="confirm-actions">
                          <button 
                            className="confirm-btn yes"
                            onClick={() => handleDelete(trip.id)}
                          >
                            Yes, delete
                          </button>
                          <button 
                            className="confirm-btn no"
                            onClick={() => setConfirmDelete(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="trip-meta">
                      Created {formatDate(trip.created_at)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Trip details modal */}
        {showDetails && selectedTrip && (
          <div className="details-overlay">
            <div className="details-modal">
              <div className="details-header">
                <h3>Trip to {selectedTrip.destination}</h3>
                <button onClick={() => setShowDetails(false)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="details-content">
                <div className="details-section">
                  <h4>Original Request</h4>
                  <p>{selectedTrip.user_request}</p>
                </div>
                <div className="details-section">
                  <h4>Trip Plan</h4>
                  <div className="trip-plan-content">
                    {selectedTrip.trip_plan}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
