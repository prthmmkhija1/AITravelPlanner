import { useState, useEffect } from 'react';

interface TravelDashboardProps {
  isVisible: boolean;
  onClose: () => void;
}

interface Itinerary {
  id: string;
  destination: string;
  dates: string;
  status: 'planned' | 'booked' | 'completed';
  budget: number;
  activities: string[];
}

export default function TravelDashboard({ isVisible, onClose }: TravelDashboardProps) {
  const [activeTab, setActiveTab] = useState<'current' | 'past' | 'saved'>('current');
  const [itineraries, setItineraries] = useState<Itinerary[]>([
    {
      id: 'ITN_001',
      destination: 'Goa Beach Paradise',
      dates: 'Feb 15-20, 2026',
      status: 'planned',
      budget: 45000,
      activities: ['Beach hopping', 'Water sports', 'Portuguese forts']
    },
    {
      id: 'ITN_002',
      destination: 'Himalayan Trek Adventure',
      dates: 'Mar 10-17, 2026',
      status: 'planned',
      budget: 62000,
      activities: ['Mountain trekking', 'Camping', 'Local culture']
    }
  ]);

  const [pastTrips] = useState([
    {
      id: 'TRIP_001',
      destination: 'Rajasthan Heritage Tour',
      dates: 'Dec 15-20, 2025',
      status: 'completed',
      budget: 38000,
      rating: 5
    }
  ]);

  if (!isVisible) return null;

  const exportToPDF = (itinerary: Itinerary) => {
    // Create PDF content
    const pdfContent = `
AI Travel Planner - Itinerary
================================

Destination: ${itinerary.destination}
Travel Dates: ${itinerary.dates}
Budget: ₹${itinerary.budget.toLocaleString()}

Activities:
${itinerary.activities.map((activity, idx) => `${idx + 1}. ${activity}`).join('\n')}

Status: ${itinerary.status.toUpperCase()}

Generated on: ${new Date().toLocaleDateString()}
    `.trim();

    // Create blob and download
    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${itinerary.destination.replace(/\s+/g, '_')}_Itinerary.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
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
            Current Plans ({itineraries.length})
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
            Saved Destinations (3)
          </button>
        </div>

        <div className="dashboard-content">
          {activeTab === 'current' && (
            <div className="itinerary-grid">
              {itineraries.map((itinerary) => (
                <div key={itinerary.id} className="itinerary-card">
                  <div className="itinerary-header">
                    <h3>{itinerary.destination}</h3>
                    <span className={`status-badge ${itinerary.status}`}>
                      {itinerary.status}
                    </span>
                  </div>

                  <div className="itinerary-body">
                    <div className="itinerary-meta">
                      <div className="meta-item">
                        <svg viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        {itinerary.dates}
                      </div>
                      <div className="meta-item">
                        <svg viewBox="0 0 20 20" fill="currentColor">
                          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                        </svg>
                        ₹{itinerary.budget.toLocaleString()}
                      </div>
                    </div>

                    <div className="activity-tags">
                      {itinerary.activities.map((activity, idx) => (
                        <span key={idx} className="activity-tag">{activity}</span>
                      ))}
                    </div>
                  </div>

                  <div className="itinerary-actions">
                    <button className="btn-secondary" onClick={() => exportToPDF(itinerary)}>
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                      </svg>
                      Export PDF
                    </button>
                    <button className="btn-primary">
                      View Details
                    </button>
                  </div>
                </div>
              ))}

              <div className="itinerary-card add-new">
                <div className="add-new-content">
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
              {pastTrips.map((trip) => (
                <div key={trip.id} className="past-trip-card">
                  <div className="past-trip-image">
                    <div className="past-trip-overlay">
                      {'⭐'.repeat(trip.rating)}
                    </div>
                  </div>
                  <div className="past-trip-info">
                    <h3>{trip.destination}</h3>
                    <p>{trip.dates}</p>
                    <p className="trip-cost">Total Cost: ₹{trip.budget.toLocaleString()}</p>
                  </div>
                  <button className="btn-secondary">Book Again</button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'saved' && (
            <div className="saved-destinations">
              <p className="empty-state">No saved destinations yet. Start exploring!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
