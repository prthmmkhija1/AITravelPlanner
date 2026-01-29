# Live Tracking Implementation Guide

This guide explains how to implement real-time tracking features for your AI Travel Planner application.

## Overview

Live tracking enables users to monitor real-time information about:

- ✈️ **Flight Status** - Real-time flight delays, gate changes, departures/arrivals
- 🚗 **Vehicle Tracking** - GPS location of hired vehicles or rental cars
- 📍 **User Location** - Track traveler's current position on a trip
- 🔔 **Price Monitoring** - Real-time price change alerts (already implemented)

---

## 1. Flight Status Tracking

### Option A: Using FlightAware API (Recommended)

FlightAware provides real-time flight tracking data.

#### Step 1: Get API Access

1. Sign up at [FlightAware](https://flightaware.com/aeroapi/)
2. Get your API key from the developer portal
3. Add to your `.env` file:
   ```
   FLIGHTAWARE_API_KEY=your_api_key_here
   ```

#### Step 2: Backend Implementation

Create `backend/flight_tracking.py`:

```python
import httpx
import asyncio
from datetime import datetime
from typing import Optional, Dict, Any

class FlightTracker:
    """Real-time flight tracking using FlightAware API"""

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://aeroapi.flightaware.com/aeroapi"

    async def get_flight_status(self, flight_id: str) -> Dict[str, Any]:
        """
        Get current status of a flight

        Args:
            flight_id: Flight identifier (e.g., "AI101" for Air India 101)

        Returns:
            Dict with flight status information
        """
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/flights/{flight_id}",
                headers={"x-apikey": self.api_key}
            )

            if response.status_code == 200:
                data = response.json()
                return self._parse_flight_data(data)
            return {"error": f"Flight not found: {flight_id}"}

    def _parse_flight_data(self, data: Dict) -> Dict[str, Any]:
        """Parse FlightAware response into user-friendly format"""
        flights = data.get("flights", [])
        if not flights:
            return {"error": "No flight data available"}

        flight = flights[0]
        return {
            "flight_number": flight.get("ident"),
            "airline": flight.get("operator"),
            "origin": {
                "code": flight.get("origin", {}).get("code"),
                "name": flight.get("origin", {}).get("name"),
                "city": flight.get("origin", {}).get("city")
            },
            "destination": {
                "code": flight.get("destination", {}).get("code"),
                "name": flight.get("destination", {}).get("name"),
                "city": flight.get("destination", {}).get("city")
            },
            "status": flight.get("status"),
            "departure": {
                "scheduled": flight.get("scheduled_out"),
                "estimated": flight.get("estimated_out"),
                "actual": flight.get("actual_out"),
                "gate": flight.get("gate_origin")
            },
            "arrival": {
                "scheduled": flight.get("scheduled_in"),
                "estimated": flight.get("estimated_in"),
                "actual": flight.get("actual_in"),
                "gate": flight.get("gate_destination")
            },
            "position": {
                "latitude": flight.get("last_position", {}).get("latitude"),
                "longitude": flight.get("last_position", {}).get("longitude"),
                "altitude": flight.get("last_position", {}).get("altitude"),
                "speed": flight.get("last_position", {}).get("groundspeed"),
                "heading": flight.get("last_position", {}).get("heading")
            },
            "progress_percent": flight.get("progress_percent", 0)
        }

    async def track_flight_updates(self, flight_id: str, callback, interval: int = 60):
        """
        Continuously track flight and call callback on updates

        Args:
            flight_id: Flight identifier
            callback: Function to call with updates
            interval: Seconds between checks (default 60)
        """
        last_status = None
        while True:
            current_status = await self.get_flight_status(flight_id)

            if current_status != last_status:
                await callback(current_status)
                last_status = current_status

            await asyncio.sleep(interval)
```

#### Step 3: Add API Endpoints

Add to `backend/api_server.py`:

```python
from flight_tracking import FlightTracker
import os

flight_tracker = FlightTracker(os.getenv("FLIGHTAWARE_API_KEY"))

@app.get("/api/flights/{flight_id}/status")
async def get_flight_status(flight_id: str):
    """Get real-time flight status"""
    status = await flight_tracker.get_flight_status(flight_id)
    return status

@app.websocket("/ws/flight/{flight_id}")
async def flight_websocket(websocket: WebSocket, flight_id: str):
    """WebSocket for real-time flight updates"""
    await websocket.accept()

    async def send_update(status):
        await websocket.send_json(status)

    try:
        await flight_tracker.track_flight_updates(flight_id, send_update)
    except WebSocketDisconnect:
        pass
```

### Option B: Using Free Aviation APIs

For a free alternative, use [AviationStack](https://aviationstack.com/):

```python
class AviationStackTracker:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "http://api.aviationstack.com/v1"

    async def get_flight_status(self, flight_iata: str):
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/flights",
                params={
                    "access_key": self.api_key,
                    "flight_iata": flight_iata
                }
            )
            return response.json()
```

---

## 2. User Location Tracking

### Frontend Implementation

The browser's Geolocation API enables tracking user location.

#### Step 1: Create Location Service

Create `frontend/src/services/locationService.ts`:

```typescript
interface Position {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

interface LocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

class LocationService {
  private watchId: number | null = null;
  private listeners: ((pos: Position) => void)[] = [];

  getCurrentPosition(options?: LocationOptions): Promise<Position> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          });
        },
        (error) => reject(error),
        {
          enableHighAccuracy: options?.enableHighAccuracy ?? true,
          timeout: options?.timeout ?? 10000,
          maximumAge: options?.maximumAge ?? 0,
        },
      );
    });
  }

  startTracking(
    callback: (pos: Position) => void,
    options?: LocationOptions,
  ): void {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported");
      return;
    }

    this.listeners.push(callback);

    if (this.watchId === null) {
      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          const pos: Position = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };
          this.listeners.forEach((listener) => listener(pos));
        },
        (error) => console.error("Location error:", error),
        {
          enableHighAccuracy: options?.enableHighAccuracy ?? true,
          timeout: options?.timeout ?? 10000,
          maximumAge: options?.maximumAge ?? 5000,
        },
      );
    }
  }

  stopTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      this.listeners = [];
    }
  }
}

export const locationService = new LocationService();
```

#### Step 2: Create Tracking Component

Create `frontend/src/components/LocationTracker.tsx`:

```tsx
import { useState, useEffect } from "react";
import { locationService } from "../services/locationService";

interface LocationTrackerProps {
  onLocationUpdate?: (lat: number, lng: number) => void;
  tripId?: string;
}

export default function LocationTracker({
  onLocationUpdate,
  tripId,
}: LocationTrackerProps) {
  const [tracking, setTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      locationService.stopTracking();
    };
  }, []);

  const startTracking = async () => {
    try {
      setError(null);

      // Request permission first
      const permission = await navigator.permissions.query({
        name: "geolocation",
      });
      if (permission.state === "denied") {
        setError(
          "Location permission denied. Please enable in browser settings.",
        );
        return;
      }

      locationService.startTracking((pos) => {
        setCurrentLocation({ lat: pos.latitude, lng: pos.longitude });
        onLocationUpdate?.(pos.latitude, pos.longitude);

        // Optionally send to backend
        if (tripId) {
          fetch("/api/trips/location", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              trip_id: tripId,
              latitude: pos.latitude,
              longitude: pos.longitude,
              timestamp: pos.timestamp,
            }),
          });
        }
      });

      setTracking(true);
    } catch (err) {
      setError("Failed to start location tracking");
    }
  };

  const stopTracking = () => {
    locationService.stopTracking();
    setTracking(false);
  };

  return (
    <div className="location-tracker">
      <div className="tracker-header">
        <h3>📍 Live Location</h3>
        <button
          className={`tracker-btn ${tracking ? "active" : ""}`}
          onClick={tracking ? stopTracking : startTracking}
        >
          {tracking ? "⏹️ Stop Tracking" : "▶️ Start Tracking"}
        </button>
      </div>

      {error && <p className="tracker-error">{error}</p>}

      {currentLocation && (
        <div className="tracker-info">
          <p>
            <strong>Latitude:</strong> {currentLocation.lat.toFixed(6)}
          </p>
          <p>
            <strong>Longitude:</strong> {currentLocation.lng.toFixed(6)}
          </p>
        </div>
      )}
    </div>
  );
}
```

---

## 3. Real-Time WebSocket Integration

For real-time updates, implement WebSocket connections.

### Backend WebSocket Setup

Add to `backend/api_server.py`:

```python
from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, Set
import json

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, channel: str):
        await websocket.accept()
        if channel not in self.active_connections:
            self.active_connections[channel] = set()
        self.active_connections[channel].add(websocket)

    def disconnect(self, websocket: WebSocket, channel: str):
        if channel in self.active_connections:
            self.active_connections[channel].discard(websocket)

    async def broadcast(self, channel: str, message: dict):
        if channel in self.active_connections:
            for connection in self.active_connections[channel]:
                await connection.send_json(message)

manager = ConnectionManager()

@app.websocket("/ws/trip/{trip_id}")
async def trip_websocket(websocket: WebSocket, trip_id: str):
    """WebSocket for trip updates (location, status changes)"""
    await manager.connect(websocket, f"trip_{trip_id}")
    try:
        while True:
            data = await websocket.receive_json()
            # Process incoming data (e.g., location updates)
            await manager.broadcast(f"trip_{trip_id}", {
                "type": "location_update",
                "data": data
            })
    except WebSocketDisconnect:
        manager.disconnect(websocket, f"trip_{trip_id}")

@app.websocket("/ws/price-alerts/{user_id}")
async def price_alerts_websocket(websocket: WebSocket, user_id: str):
    """WebSocket for real-time price alerts"""
    await manager.connect(websocket, f"alerts_{user_id}")
    try:
        while True:
            await websocket.receive_text()  # Keep connection alive
    except WebSocketDisconnect:
        manager.disconnect(websocket, f"alerts_{user_id}")
```

### Frontend WebSocket Hook

Create `frontend/src/hooks/useWebSocket.ts`:

```typescript
import { useEffect, useRef, useState, useCallback } from "react";

interface UseWebSocketOptions {
  onMessage?: (data: any) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  reconnect?: boolean;
  reconnectInterval?: number;
}

export function useWebSocket(url: string, options: UseWebSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        setIsConnected(true);
        options.onOpen?.();
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setLastMessage(data);
        options.onMessage?.(data);
      };

      ws.onclose = () => {
        setIsConnected(false);
        options.onClose?.();

        if (options.reconnect !== false) {
          reconnectTimeoutRef.current = window.setTimeout(() => {
            connect();
          }, options.reconnectInterval ?? 5000);
        }
      };

      ws.onerror = (error) => {
        options.onError?.(error);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error("WebSocket connection error:", error);
    }
  }, [url, options]);

  const send = useCallback((data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    wsRef.current?.close();
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return { isConnected, lastMessage, send, disconnect };
}
```

---

## 4. Map Integration for Visual Tracking

### Using Leaflet for Real-Time Map

Update `frontend/src/components/DynamicMap.tsx`:

```tsx
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface TrackingPoint {
  lat: number;
  lng: number;
  timestamp: number;
}

interface DynamicMapProps {
  trackingPoints?: TrackingPoint[];
  currentPosition?: { lat: number; lng: number };
  showPath?: boolean;
}

export default function DynamicMap({
  trackingPoints = [],
  currentPosition,
  showPath = true,
}: DynamicMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const pathRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    // Initialize map
    if (!mapRef.current) {
      mapRef.current = L.map("tracking-map").setView([20.5937, 78.9629], 5);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(mapRef.current);
    }
  }, []);

  useEffect(() => {
    if (!mapRef.current || !currentPosition) return;

    // Update or create marker
    if (markerRef.current) {
      markerRef.current.setLatLng([currentPosition.lat, currentPosition.lng]);
    } else {
      markerRef.current = L.marker([currentPosition.lat, currentPosition.lng], {
        icon: L.divIcon({
          className: "current-location-marker",
          html: '<div class="pulse-marker">📍</div>',
          iconSize: [30, 30],
        }),
      }).addTo(mapRef.current);
    }

    // Center map on current position
    mapRef.current.setView([currentPosition.lat, currentPosition.lng], 12);
  }, [currentPosition]);

  useEffect(() => {
    if (!mapRef.current || !showPath || trackingPoints.length < 2) return;

    const coordinates: [number, number][] = trackingPoints.map((p) => [
      p.lat,
      p.lng,
    ]);

    if (pathRef.current) {
      pathRef.current.setLatLngs(coordinates);
    } else {
      pathRef.current = L.polyline(coordinates, {
        color: "#1e88e5",
        weight: 3,
        opacity: 0.8,
      }).addTo(mapRef.current);
    }
  }, [trackingPoints, showPath]);

  return <div id="tracking-map" style={{ height: "400px", width: "100%" }} />;
}
```

---

## 5. Putting It All Together

### Integration Example

Here's how to integrate all tracking features in your main component:

```tsx
import { useState, useEffect } from "react";
import { useWebSocket } from "../hooks/useWebSocket";
import LocationTracker from "./LocationTracker";
import DynamicMap from "./DynamicMap";

export default function TripTracking({ tripId }: { tripId: string }) {
  const [trackingPoints, setTrackingPoints] = useState<any[]>([]);
  const [flightStatus, setFlightStatus] = useState<any>(null);

  // WebSocket for real-time updates
  const { isConnected, lastMessage } = useWebSocket(
    `ws://localhost:8000/ws/trip/${tripId}`,
    {
      onMessage: (data) => {
        if (data.type === "location_update") {
          setTrackingPoints((prev) => [...prev, data.data]);
        }
      },
    },
  );

  // Handle location updates from device
  const handleLocationUpdate = (lat: number, lng: number) => {
    setTrackingPoints((prev) => [...prev, { lat, lng, timestamp: Date.now() }]);
  };

  return (
    <div className="trip-tracking">
      <h2>🗺️ Trip Tracking</h2>

      <div className="connection-status">
        {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
      </div>

      <LocationTracker
        tripId={tripId}
        onLocationUpdate={handleLocationUpdate}
      />

      <DynamicMap
        trackingPoints={trackingPoints}
        currentPosition={trackingPoints[trackingPoints.length - 1]}
        showPath={true}
      />

      {flightStatus && (
        <div className="flight-status-card">
          <h3>✈️ Flight {flightStatus.flight_number}</h3>
          <p>Status: {flightStatus.status}</p>
          <p>Progress: {flightStatus.progress_percent}%</p>
        </div>
      )}
    </div>
  );
}
```

---

## API Keys Required

| Feature             | Provider          | Link                                                        | Free Tier       | Status         |
| ------------------- | ----------------- | ----------------------------------------------------------- | --------------- | -------------- |
| Flight Status       | **Amadeus**       | [developers.amadeus.com](https://developers.amadeus.com/)   | 2,000 req/month | ✅ YOU HAVE    |
| Flight Tracking     | FlightAware       | [aeroapi.flightaware.com](https://flightaware.com/aeroapi/) | ❌ NOT FREE     | Not needed     |
| Flight Status (Alt) | AviationStack     | [aviationstack.com](https://aviationstack.com/)             | 100 req/month   | Optional       |
| Maps                | **OpenStreetMap** | Free                                                        | ✅ Unlimited    | ✅ IMPLEMENTED |
| User Location       | **Browser API**   | Built-in                                                    | ✅ FREE         | ✅ IMPLEMENTED |
| WebSocket           | **FastAPI**       | Built-in                                                    | ✅ FREE         | ✅ IMPLEMENTED |

---

## Summary

To implement live tracking in your AI Travel Planner:

1. **Flight Tracking**: ✅ Use your existing **Amadeus API** (no need for FlightAware!)
2. **User Location**: ✅ Browser Geolocation API with permission handling
3. **Real-Time Updates**: ✅ WebSocket connections for instant notifications
4. **Visual Tracking**: ✅ Leaflet/OpenStreetMap for map visualization
5. **Price Monitoring**: ✅ Already implemented in `notification_service.py`

### Quick Start Checklist

- [x] ~~Sign up for FlightAware/AviationStack API~~ → Use existing Amadeus API
- [x] Add API key to `.env` → Already configured (AMADEUS_API_KEY)
- [x] Create `flight_tracking.py` backend module → Can use existing real_flight_api.py
- [x] Add WebSocket endpoints → ✅ IMPLEMENTED in api_server.py
- [x] Create frontend location service → ✅ IMPLEMENTED: `services/locationService.ts`
- [x] Implement tracking components → ✅ IMPLEMENTED: `LocationTracker.tsx`, `TripTracking.tsx`
- [x] Add map visualization → ✅ IMPLEMENTED: `TrackingMap.tsx`
- [ ] Test with real trip data

---

## Implemented Files

### Backend

- `backend/api_server.py` - Added WebSocket endpoints:
  - `/ws/trip/{trip_id}` - Real-time trip tracking
  - `/ws/alerts/{user_id}` - Price alert notifications
  - `/ws/global` - System-wide announcements
  - `/api/trips/location` - Store location updates
  - `/api/trips/{trip_id}/locations` - Get location history

### Frontend

- `frontend/src/services/locationService.ts` - Browser Geolocation wrapper
- `frontend/src/hooks/useWebSocket.ts` - WebSocket connection hook
- `frontend/src/components/LocationTracker.tsx` - Location tracking UI
- `frontend/src/components/TrackingMap.tsx` - Leaflet map with OpenStreetMap
- `frontend/src/components/TripTracking.tsx` - Complete tracking modal

---

## Need Help?

- Check the existing `LiveTracking.tsx` component for UI reference
- See `notification_service.py` for background task patterns
- Review `DynamicMap.tsx` for destination map examples
- See `TrackingMap.tsx` for live tracking map implementation
