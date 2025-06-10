import { useState } from "react";

type GeoLocationPosition = {
  lat: number;
  lng: number;
  address?: string;
  error?: string;
};

export function useGeoLocation() {
  const [position, setPosition] = useState<GeoLocationPosition | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentPosition = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocoding to get address from coordinates
          // This is a simplified implementation
          // In a real app, you'd use a geocoding service API
          const address = await getAddressFromCoords(latitude, longitude);
          
          setPosition({
            lat: latitude,
            lng: longitude,
            address,
          });
        } catch (error) {
          setPosition({
            lat: latitude,
            lng: longitude,
            error: "Could not get address",
          });
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        setError(getGeolocationErrorMessage(error));
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  // Simple mock function for geocoding (in a real app, use a service API)
  const getAddressFromCoords = async (lat: number, lng: number): Promise<string> => {
    // This is a placeholder. In a real app, you would call a geocoding API
    return "New York, NY";
  };

  const getGeolocationErrorMessage = (error: GeolocationPositionError): string => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return "Location permission denied by user";
      case error.POSITION_UNAVAILABLE:
        return "Location information is unavailable";
      case error.TIMEOUT:
        return "Timeout while getting location";
      default:
        return "Unknown error while getting location";
    }
  };

  return { position, loading, error, getCurrentPosition };
}