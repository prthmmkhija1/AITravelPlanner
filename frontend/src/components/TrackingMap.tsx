/**
 * Live Tracking Map Component
 * Uses Leaflet + OpenStreetMap (100% FREE)
 * 
 * Features:
 * - Real-time location tracking on map
 * - Path/trail visualization
 * - Multiple marker support
 * - Zoom to current location
 */

import { useEffect, useRef, useState, useCallback } from 'react';

// Leaflet types
declare global {
  interface Window {
    L: any;
  }
}

export interface TrackingPoint {
  lat: number;
  lng: number;
  timestamp: number;
  accuracy?: number;
}

interface TrackingMapProps {
  trackingPoints?: TrackingPoint[];
  currentPosition?: { lat: number; lng: number };
  showPath?: boolean;
  height?: string;
  zoom?: number;
  center?: { lat: number; lng: number };
  showControls?: boolean;
  onMapClick?: (lat: number, lng: number) => void;
}

export default function TrackingMap({
  trackingPoints = [],
  currentPosition,
  showPath = true,
  height = '400px',
  zoom = 13,
  center,
  showControls = true,
  onMapClick,
}: TrackingMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const pathRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  // Load Leaflet CSS and JS dynamically
  useEffect(() => {
    // Check if Leaflet is already loaded
    if (window.L) {
      setLeafletLoaded(true);
      return;
    }

    // Load Leaflet CSS
    const linkEl = document.createElement('link');
    linkEl.rel = 'stylesheet';
    linkEl.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    linkEl.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    linkEl.crossOrigin = '';
    document.head.appendChild(linkEl);

    // Load Leaflet JS
    const scriptEl = document.createElement('script');
    scriptEl.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    scriptEl.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    scriptEl.crossOrigin = '';
    scriptEl.onload = () => {
      setLeafletLoaded(true);
    };
    document.head.appendChild(scriptEl);

    return () => {
      // Cleanup is optional since Leaflet is reusable
    };
  }, []);

  // Initialize map
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current || mapRef.current) return;

    const L = window.L;
    const initialCenter = center || currentPosition || { lat: 20.5937, lng: 78.9629 }; // Default to India center

    // Create map
    const map = L.map(mapContainerRef.current, {
      center: [initialCenter.lat, initialCenter.lng],
      zoom: zoom,
      zoomControl: showControls,
    });

    // Add OpenStreetMap tiles (FREE)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Handle map clicks
    if (onMapClick) {
      map.on('click', (e: any) => {
        onMapClick(e.latlng.lat, e.latlng.lng);
      });
    }

    mapRef.current = map;
    setIsMapReady(true);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [leafletLoaded, showControls]);

  // Update current position marker
  useEffect(() => {
    if (!isMapReady || !currentPosition || !mapRef.current) return;

    const L = window.L;
    const map = mapRef.current;

    // Create custom icon for current location
    const currentLocationIcon = L.divIcon({
      className: 'current-location-marker',
      html: `
        <div class="location-marker-container">
          <div class="location-pulse"></div>
          <div class="location-dot">📍</div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    });

    // Update or create marker
    if (markerRef.current) {
      markerRef.current.setLatLng([currentPosition.lat, currentPosition.lng]);
    } else {
      markerRef.current = L.marker([currentPosition.lat, currentPosition.lng], {
        icon: currentLocationIcon,
      }).addTo(map);
      
      markerRef.current.bindPopup('📍 Your current location');
    }

    // Center map on current position
    map.setView([currentPosition.lat, currentPosition.lng], map.getZoom());
  }, [currentPosition, isMapReady]);

  // Update path/trail
  useEffect(() => {
    if (!isMapReady || !showPath || trackingPoints.length < 2 || !mapRef.current) return;

    const L = window.L;
    const map = mapRef.current;

    const coordinates: [number, number][] = trackingPoints.map((p) => [p.lat, p.lng]);

    if (pathRef.current) {
      pathRef.current.setLatLngs(coordinates);
    } else {
      pathRef.current = L.polyline(coordinates, {
        color: '#1e88e5',
        weight: 4,
        opacity: 0.8,
        smoothFactor: 1,
        dashArray: null,
      }).addTo(map);
    }

    // Fit map to path bounds
    if (coordinates.length > 1) {
      map.fitBounds(pathRef.current.getBounds(), { padding: [50, 50] });
    }
  }, [trackingPoints, showPath, isMapReady]);

  // Add markers for all tracking points (optional)
  const addTrackingMarkers = useCallback(() => {
    if (!isMapReady || !mapRef.current) return;

    const L = window.L;
    const map = mapRef.current;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Add markers for significant points (every 10th point to avoid clutter)
    trackingPoints.forEach((point, index) => {
      if (index % 10 === 0 && index !== trackingPoints.length - 1) {
        const marker = L.circleMarker([point.lat, point.lng], {
          radius: 4,
          fillColor: '#1e88e5',
          color: '#fff',
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8,
        }).addTo(map);

        marker.bindPopup(`
          <div class="tracking-popup">
            <strong>Point ${index + 1}</strong><br>
            Time: ${new Date(point.timestamp).toLocaleTimeString()}
          </div>
        `);

        markersRef.current.push(marker);
      }
    });
  }, [trackingPoints, isMapReady]);

  // Center on current location
  const centerOnLocation = () => {
    if (currentPosition && mapRef.current) {
      mapRef.current.setView([currentPosition.lat, currentPosition.lng], 15);
    }
  };

  // Zoom to fit all points
  const zoomToFit = () => {
    if (pathRef.current && mapRef.current) {
      mapRef.current.fitBounds(pathRef.current.getBounds(), { padding: [50, 50] });
    }
  };

  if (!leafletLoaded) {
    return (
      <div className="tracking-map-loading" style={{ height }}>
        <div className="loading-spinner">🗺️</div>
        <p>Loading map...</p>
      </div>
    );
  }

  return (
    <div className="tracking-map-wrapper">
      <div
        ref={mapContainerRef}
        className="tracking-map"
        style={{ height, width: '100%' }}
      />
      
      {showControls && (
        <div className="map-custom-controls">
          <button 
            className="map-control-btn" 
            onClick={centerOnLocation}
            title="Center on my location"
          >
            🎯
          </button>
          {trackingPoints.length > 1 && (
            <button 
              className="map-control-btn" 
              onClick={zoomToFit}
              title="Fit path to view"
            >
              📐
            </button>
          )}
        </div>
      )}

      <style>{`
        .tracking-map-wrapper {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .tracking-map {
          border-radius: 12px;
        }
        
        .tracking-map-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #f0f0f0;
          border-radius: 12px;
        }
        
        .loading-spinner {
          font-size: 3rem;
          animation: pulse 1.5s ease-in-out infinite;
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.7; }
        }
        
        .map-custom-controls {
          position: absolute;
          bottom: 20px;
          right: 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          z-index: 1000;
        }
        
        .map-control-btn {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          border: none;
          background: white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          cursor: pointer;
          font-size: 1.2rem;
          transition: all 0.2s;
        }
        
        .map-control-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        
        .location-marker-container {
          position: relative;
          width: 40px;
          height: 40px;
        }
        
        .location-pulse {
          position: absolute;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(30, 136, 229, 0.3);
          animation: location-pulse 2s ease-out infinite;
        }
        
        .location-dot {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 1.5rem;
        }
        
        @keyframes location-pulse {
          0% { transform: scale(0.5); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
        
        .tracking-popup {
          font-size: 12px;
          min-width: 100px;
        }
      `}</style>
    </div>
  );
}
