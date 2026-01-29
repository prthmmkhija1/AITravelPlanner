/**
 * Location Service - Uses Browser Geolocation API (FREE)
 * No external API required - built into all modern browsers
 */

export interface Position {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  speed: number | null;
  heading: number | null;
  timestamp: number;
}

export interface LocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export type LocationCallback = (position: Position) => void;
export type ErrorCallback = (error: GeolocationPositionError) => void;

class LocationService {
  private watchId: number | null = null;
  private listeners: Set<LocationCallback> = new Set();
  private errorListeners: Set<ErrorCallback> = new Set();
  private lastPosition: Position | null = null;

  /**
   * Check if geolocation is supported
   */
  isSupported(): boolean {
    return 'geolocation' in navigator;
  }

  /**
   * Check current permission status
   */
  async checkPermission(): Promise<PermissionState> {
    if (!navigator.permissions) {
      return 'prompt'; // Assume prompt if permissions API not supported
    }
    const result = await navigator.permissions.query({ name: 'geolocation' });
    return result.state;
  }

  /**
   * Get current position once
   */
  getCurrentPosition(options?: LocationOptions): Promise<Position> {
    return new Promise((resolve, reject) => {
      if (!this.isSupported()) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = this.parsePosition(position);
          this.lastPosition = pos;
          resolve(pos);
        },
        (error) => reject(this.parseError(error)),
        {
          enableHighAccuracy: options?.enableHighAccuracy ?? true,
          timeout: options?.timeout ?? 10000,
          maximumAge: options?.maximumAge ?? 0,
        }
      );
    });
  }

  /**
   * Start continuous location tracking
   */
  startTracking(options?: LocationOptions): void {
    if (!this.isSupported()) {
      console.error('Geolocation is not supported');
      return;
    }

    // Don't start multiple watchers
    if (this.watchId !== null) {
      return;
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const pos = this.parsePosition(position);
        this.lastPosition = pos;
        this.listeners.forEach((callback) => callback(pos));
      },
      (error) => {
        const parsedError = this.parseError(error);
        console.error('Location tracking error:', parsedError);
        this.errorListeners.forEach((callback) => callback(error));
      },
      {
        enableHighAccuracy: options?.enableHighAccuracy ?? true,
        timeout: options?.timeout ?? 10000,
        maximumAge: options?.maximumAge ?? 5000,
      }
    );
  }

  /**
   * Stop location tracking
   */
  stopTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  /**
   * Add a listener for location updates
   */
  addListener(callback: LocationCallback): () => void {
    this.listeners.add(callback);
    
    // If we have a last position, immediately call the callback
    if (this.lastPosition) {
      callback(this.lastPosition);
    }

    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Add error listener
   */
  addErrorListener(callback: ErrorCallback): () => void {
    this.errorListeners.add(callback);
    return () => {
      this.errorListeners.delete(callback);
    };
  }

  /**
   * Remove all listeners and stop tracking
   */
  cleanup(): void {
    this.stopTracking();
    this.listeners.clear();
    this.errorListeners.clear();
    this.lastPosition = null;
  }

  /**
   * Get last known position
   */
  getLastPosition(): Position | null {
    return this.lastPosition;
  }

  /**
   * Check if currently tracking
   */
  isTracking(): boolean {
    return this.watchId !== null;
  }

  /**
   * Calculate distance between two points (Haversine formula)
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private parsePosition(position: GeolocationPosition): Position {
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude,
      speed: position.coords.speed,
      heading: position.coords.heading,
      timestamp: position.timestamp,
    };
  }

  private parseError(error: GeolocationPositionError): Error {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return new Error('Location permission denied. Please enable location access in your browser settings.');
      case error.POSITION_UNAVAILABLE:
        return new Error('Location information is unavailable. Please check your device settings.');
      case error.TIMEOUT:
        return new Error('Location request timed out. Please try again.');
      default:
        return new Error('An unknown error occurred while getting location.');
    }
  }
}

// Export singleton instance
export const locationService = new LocationService();

// Also export the class for testing
export { LocationService };
