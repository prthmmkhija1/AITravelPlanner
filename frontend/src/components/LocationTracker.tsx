import { useState, useEffect, useCallback } from 'react';
import { locationService, Position } from '../services/locationService';

interface LocationTrackerProps {
  tripId?: string;
  onLocationUpdate?: (lat: number, lng: number) => void;
  showControls?: boolean;
  isVisible?: boolean;
  onClose?: () => void;
}

export default function LocationTracker({ 
  tripId, 
  onLocationUpdate,
  showControls = true,
  isVisible = true,
  onClose
}: LocationTrackerProps) {
  const [tracking, setTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Position | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<PermissionState | null>(null);
  const [distance, setDistance] = useState<number>(0);
  const [startPosition, setStartPosition] = useState<Position | null>(null);

  // Check permission status on mount
  useEffect(() => {
    checkPermission();
    return () => {
      locationService.cleanup();
    };
  }, []);

  const checkPermission = async () => {
    const state = await locationService.checkPermission();
    setPermissionState(state);
  };

  const handleLocationUpdate = useCallback((pos: Position) => {
    setCurrentLocation(pos);
    onLocationUpdate?.(pos.latitude, pos.longitude);

    // Calculate distance from start
    if (startPosition) {
      const dist = locationService.calculateDistance(
        startPosition.latitude,
        startPosition.longitude,
        pos.latitude,
        pos.longitude
      );
      setDistance(dist);
    }

    // Send to backend if tripId provided
    if (tripId) {
      sendLocationToServer(pos);
    }
  }, [onLocationUpdate, startPosition, tripId]);

  const sendLocationToServer = async (pos: Position) => {
    try {
      await fetch('/api/trips/location', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        },
        body: JSON.stringify({
          trip_id: tripId,
          latitude: pos.latitude,
          longitude: pos.longitude,
          accuracy: pos.accuracy,
          altitude: pos.altitude,
          speed: pos.speed,
          heading: pos.heading,
          timestamp: pos.timestamp
        })
      });
    } catch (err) {
      console.error('Failed to send location to server:', err);
    }
  };

  const startTracking = async () => {
    setError(null);

    if (!locationService.isSupported()) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    try {
      // Get initial position
      const initialPos = await locationService.getCurrentPosition();
      setStartPosition(initialPos);
      setCurrentLocation(initialPos);
      onLocationUpdate?.(initialPos.latitude, initialPos.longitude);

      // Add listener for updates
      locationService.addListener(handleLocationUpdate);
      locationService.addErrorListener((err) => {
        setError(err.message);
      });

      // Start tracking
      locationService.startTracking({ enableHighAccuracy: true });
      setTracking(true);
      setPermissionState('granted');
    } catch (err: any) {
      setError(err.message || 'Failed to start location tracking');
      setPermissionState('denied');
    }
  };

  const stopTracking = () => {
    locationService.stopTracking();
    setTracking(false);
  };

  const formatCoordinate = (coord: number, type: 'lat' | 'lng'): string => {
    const direction = type === 'lat' 
      ? (coord >= 0 ? 'N' : 'S')
      : (coord >= 0 ? 'E' : 'W');
    return `${Math.abs(coord).toFixed(6)}° ${direction}`;
  };

  const formatSpeed = (speed: number | null): string => {
    if (speed === null) return 'N/A';
    const kmh = speed * 3.6; // m/s to km/h
    return `${kmh.toFixed(1)} km/h`;
  };

  const content = (
    <div className="location-tracker">
      <div className="tracker-header">
        <div className="tracker-title">
          <span className="tracker-icon">📍</span>
          <h3>Live Location</h3>
          {tracking && (
            <span className="tracking-badge pulse">
              <span className="dot"></span>
              Tracking
            </span>
          )}
        </div>

        {showControls && (
          <div className="tracker-controls">
            <button
              className={`tracker-btn ${tracking ? 'stop' : 'start'}`}
              onClick={tracking ? stopTracking : startTracking}
            >
              {tracking ? (
                <>⏹️ Stop Tracking</>
              ) : (
                <>▶️ Start Tracking</>
              )}
            </button>
          </div>
        )}
      </div>

      {permissionState === 'denied' && (
        <div className="tracker-warning">
          <span>⚠️</span>
          <p>Location permission denied. Please enable location access in your browser settings to use this feature.</p>
        </div>
      )}

      {error && (
        <div className="tracker-error">
          <span>❌</span>
          <p>{error}</p>
        </div>
      )}

      {currentLocation && (
        <div className="tracker-info">
          <div className="tracker-grid">
            <div className="tracker-stat">
              <span className="stat-label">Latitude</span>
              <span className="stat-value">{formatCoordinate(currentLocation.latitude, 'lat')}</span>
            </div>
            <div className="tracker-stat">
              <span className="stat-label">Longitude</span>
              <span className="stat-value">{formatCoordinate(currentLocation.longitude, 'lng')}</span>
            </div>
            <div className="tracker-stat">
              <span className="stat-label">Accuracy</span>
              <span className="stat-value">±{currentLocation.accuracy.toFixed(0)}m</span>
            </div>
            <div className="tracker-stat">
              <span className="stat-label">Speed</span>
              <span className="stat-value">{formatSpeed(currentLocation.speed)}</span>
            </div>
            {currentLocation.altitude !== null && (
              <div className="tracker-stat">
                <span className="stat-label">Altitude</span>
                <span className="stat-value">{currentLocation.altitude.toFixed(0)}m</span>
              </div>
            )}
            {distance > 0 && (
              <div className="tracker-stat">
                <span className="stat-label">Distance</span>
                <span className="stat-value">{distance.toFixed(2)} km</span>
              </div>
            )}
          </div>

          <div className="tracker-timestamp">
            Last updated: {new Date(currentLocation.timestamp).toLocaleTimeString()}
          </div>
        </div>
      )}

      {!currentLocation && !error && !tracking && (
        <div className="tracker-placeholder">
          <p>Click "Start Tracking" to begin monitoring your location</p>
          <small>Your location data stays on your device unless you're on an active trip</small>
        </div>
      )}
    </div>
  );

  // If used as modal
  if (onClose !== undefined) {
    if (!isVisible) return null;
    
    return (
      <div className="location-modal-overlay">
        <div className="location-modal">
          <div className="location-modal-header">
            <h2>🌍 My Location</h2>
            <span className="api-badge">Browser Geolocation API • FREE</span>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          {content}
          <div className="location-modal-footer">
            <small>✨ Uses Browser Geolocation API - completely FREE and private</small>
          </div>
        </div>

        <style>{`
          .location-modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
          }

          .location-modal {
            background: white;
            border-radius: 20px;
            width: 95%;
            max-width: 500px;
            max-height: 90vh;
            overflow: hidden;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          }

          .location-modal-header {
            padding: 20px 24px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .location-modal-header h2 {
            margin: 0;
            flex: 1;
          }

          .api-badge {
            font-size: 0.65rem;
            padding: 4px 8px;
            background: rgba(255,255,255,0.2);
            border-radius: 12px;
          }

          .close-btn {
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 1.4rem;
          }

          .location-modal .location-tracker {
            padding: 20px;
          }

          .location-modal-footer {
            padding: 12px 24px;
            background: #f8fafc;
            text-align: center;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
          }
        `}</style>
      </div>
    );
  }

  // Return as inline component
  return content;
}