/**
 * Trip Tracking Component - Combines all live tracking features
 * 
 * Features:
 * - Live location tracking (Browser Geolocation - FREE)
 * - Real-time WebSocket updates (FastAPI built-in - FREE)
 * - Map visualization (OpenStreetMap + Leaflet - FREE)
 * 
 * NO PAID APIs REQUIRED!
 */

import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { locationService, Position } from '../services/locationService';
import LocationTracker from './LocationTracker';
import TrackingMap, { TrackingPoint } from './TrackingMap';

interface TripTrackingProps {
  tripId?: string;
  isVisible: boolean;
  onClose: () => void;
}

export default function TripTracking({ tripId = 'demo', isVisible, onClose }: TripTrackingProps) {
  const [trackingPoints, setTrackingPoints] = useState<TrackingPoint[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [stats, setStats] = useState({
    distance: 0,
    duration: 0,
    avgSpeed: 0,
  });

  // WebSocket for real-time updates
  const wsUrl = `ws://${window.location.hostname}:8000/ws/trip/${tripId}`;
  const { isConnected, lastMessage, send, connectionState } = useWebSocket(wsUrl, {
    onMessage: (data) => {
      if (data.type === 'location_update' && data.data) {
        const newPoint: TrackingPoint = {
          lat: data.data.latitude,
          lng: data.data.longitude,
          timestamp: data.data.timestamp || Date.now(),
          accuracy: data.data.accuracy,
        };
        setTrackingPoints((prev) => [...prev, newPoint]);
        setCurrentPosition({ lat: newPoint.lat, lng: newPoint.lng });
      } else if (data.type === 'history' && data.data) {
        // Load historical points
        const points = data.data.map((p: any) => ({
          lat: p.latitude,
          lng: p.longitude,
          timestamp: p.timestamp || Date.now(),
          accuracy: p.accuracy,
        }));
        setTrackingPoints(points);
        if (points.length > 0) {
          const last = points[points.length - 1];
          setCurrentPosition({ lat: last.lat, lng: last.lng });
        }
      }
    },
    onOpen: () => {
      console.log('Connected to trip tracking');
    },
    reconnect: true,
    reconnectAttempts: 10,
  });

  // Handle location updates from device
  const handleLocationUpdate = useCallback(
    (lat: number, lng: number) => {
      const newPoint: TrackingPoint = {
        lat,
        lng,
        timestamp: Date.now(),
      };

      setTrackingPoints((prev) => [...prev, newPoint]);
      setCurrentPosition({ lat, lng });

      // Send to WebSocket for other clients
      if (isConnected) {
        send({
          type: 'location_update',
          data: {
            latitude: lat,
            longitude: lng,
            timestamp: Date.now(),
          },
        });
      }
    },
    [isConnected, send]
  );

  // Calculate stats
  useEffect(() => {
    if (trackingPoints.length < 2) return;

    let totalDistance = 0;
    for (let i = 1; i < trackingPoints.length; i++) {
      const prev = trackingPoints[i - 1];
      const curr = trackingPoints[i];
      totalDistance += locationService.calculateDistance(
        prev.lat,
        prev.lng,
        curr.lat,
        curr.lng
      );
    }

    const startTime = trackingPoints[0].timestamp;
    const endTime = trackingPoints[trackingPoints.length - 1].timestamp;
    const durationMs = endTime - startTime;
    const durationHours = durationMs / (1000 * 60 * 60);

    setStats({
      distance: totalDistance,
      duration: durationMs / (1000 * 60), // in minutes
      avgSpeed: durationHours > 0 ? totalDistance / durationHours : 0,
    });
  }, [trackingPoints]);

  // Clear tracking data
  const clearTracking = () => {
    setTrackingPoints([]);
    setCurrentPosition(null);
    setStats({ distance: 0, duration: 0, avgSpeed: 0 });
  };

  // Export tracking data
  const exportData = () => {
    const data = {
      tripId,
      points: trackingPoints,
      stats,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trip-tracking-${tripId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isVisible) return null;

  return (
    <div className="trip-tracking-overlay">
      <div className="trip-tracking-modal">
        <div className="trip-tracking-header">
          <div className="header-left">
            <h2>🗺️ Live Trip Tracking</h2>
            <div className={`connection-badge ${isConnected ? 'connected' : 'disconnected'}`}>
              {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="trip-tracking-content">
          {/* Stats Bar */}
          <div className="tracking-stats">
            <div className="stat-item">
              <span className="stat-icon">📏</span>
              <div className="stat-details">
                <span className="stat-label">Distance</span>
                <span className="stat-value">{stats.distance.toFixed(2)} km</span>
              </div>
            </div>
            <div className="stat-item">
              <span className="stat-icon">⏱️</span>
              <div className="stat-details">
                <span className="stat-label">Duration</span>
                <span className="stat-value">{Math.floor(stats.duration)} min</span>
              </div>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🚀</span>
              <div className="stat-details">
                <span className="stat-label">Avg Speed</span>
                <span className="stat-value">{stats.avgSpeed.toFixed(1)} km/h</span>
              </div>
            </div>
            <div className="stat-item">
              <span className="stat-icon">📍</span>
              <div className="stat-details">
                <span className="stat-label">Points</span>
                <span className="stat-value">{trackingPoints.length}</span>
              </div>
            </div>
          </div>

          {/* Location Tracker */}
          <LocationTracker
            tripId={tripId}
            onLocationUpdate={handleLocationUpdate}
            showControls={true}
          />

          {/* Map */}
          <div className="tracking-map-section">
            <TrackingMap
              trackingPoints={trackingPoints}
              currentPosition={currentPosition || undefined}
              showPath={true}
              height="350px"
              showControls={true}
            />
          </div>

          {/* Actions */}
          <div className="tracking-actions">
            <button className="action-btn secondary" onClick={clearTracking}>
              🗑️ Clear Data
            </button>
            <button className="action-btn secondary" onClick={exportData}>
              📥 Export JSON
            </button>
          </div>
        </div>

        <div className="trip-tracking-footer">
          <small>
            💡 All tracking uses FREE APIs: Browser Geolocation, WebSocket, OpenStreetMap
          </small>
        </div>
      </div>

      <style>{`
        .trip-tracking-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .trip-tracking-modal {
          background: white;
          border-radius: 20px;
          width: 95%;
          max-width: 800px;
          max-height: 90vh;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          display: flex;
          flex-direction: column;
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .trip-tracking-header {
          padding: 20px 24px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(135deg, #1e88e5 0%, #1565c0 100%);
          color: white;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .trip-tracking-header h2 {
          margin: 0;
          font-size: 1.3rem;
        }

        .connection-badge {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .connection-badge.connected {
          background: rgba(255, 255, 255, 0.2);
        }

        .connection-badge.disconnected {
          background: rgba(220, 38, 38, 0.3);
        }

        .close-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1.4rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .trip-tracking-content {
          padding: 20px 24px;
          overflow-y: auto;
          flex: 1;
        }

        .tracking-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          background: #f8fafc;
          border-radius: 10px;
        }

        .stat-icon {
          font-size: 1.5rem;
        }

        .stat-details {
          display: flex;
          flex-direction: column;
        }

        .stat-label {
          font-size: 0.75rem;
          color: #6b7280;
          text-transform: uppercase;
        }

        .stat-value {
          font-size: 1rem;
          font-weight: 600;
          color: #111827;
        }

        .tracking-map-section {
          margin: 20px 0;
        }

        .tracking-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          margin-top: 16px;
        }

        .action-btn {
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .action-btn.secondary {
          background: white;
          border: 1px solid #e5e7eb;
          color: #374151;
        }

        .action-btn.secondary:hover {
          background: #f3f4f6;
        }

        .trip-tracking-footer {
          padding: 12px 24px;
          background: #f8fafc;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
        }

        /* Location Tracker Styles */
        .location-tracker {
          background: #f8fafc;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 16px;
        }

        .tracker-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .tracker-title {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .tracker-title h3 {
          margin: 0;
          font-size: 1rem;
        }

        .tracking-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          background: #dcfce7;
          color: #16a34a;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .tracking-badge .dot {
          width: 6px;
          height: 6px;
          background: #16a34a;
          border-radius: 50%;
          animation: blink 1s ease-in-out infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .tracker-btn {
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
        }

        .tracker-btn.start {
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
          color: white;
        }

        .tracker-btn.stop {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
        }

        .tracker-error, .tracker-warning {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 12px;
        }

        .tracker-error {
          background: #fee2e2;
          color: #dc2626;
        }

        .tracker-warning {
          background: #fef3c7;
          color: #d97706;
        }

        .tracker-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 12px;
        }

        .tracker-stat {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .tracker-stat .stat-label {
          font-size: 0.7rem;
          color: #6b7280;
          text-transform: uppercase;
        }

        .tracker-stat .stat-value {
          font-size: 0.9rem;
          font-weight: 600;
        }

        .tracker-timestamp {
          margin-top: 12px;
          font-size: 0.75rem;
          color: #9ca3af;
        }

        .tracker-placeholder {
          text-align: center;
          padding: 20px;
          color: #6b7280;
        }

        .tracker-placeholder small {
          display: block;
          margin-top: 8px;
          color: #9ca3af;
        }

        @media (max-width: 640px) {
          .tracking-stats {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .header-left {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
}
