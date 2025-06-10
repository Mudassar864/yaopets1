import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Location = {
  lat: number;
  lng: number;
  address?: string;
};

type MapItem = {
  id: number;
  type: string;
  title?: string;
  name?: string;
  status?: string;
  location: Location;
  photos?: string[];
};

type MapViewProps = {
  items?: MapItem[];
  center?: Location;
  onItemClick?: (item: MapItem) => void;
  onBack?: () => void;
};

export default function MapView({ items = [], center, onItemClick, onBack }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);

  useEffect(() => {
    // Load Google Maps script
    if (!window.google && !document.getElementById('google-maps-script')) {
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_MAPS_API_KEY || ''}&libraries=places`;
      script.async = true;
      script.defer = true;

      script.onload = initMap;
      document.head.appendChild(script);
    } else if (window.google && !map) {
      initMap();
    }

    return () => {
      // Clean up markers when component unmounts
      if (markers.length > 0) {
        markers.forEach(marker => marker.setMap(null));
      }
    };
    // eslint-disable-next-line
  }, []);

  // Update markers when items change
  useEffect(() => {
    if (map && items.length > 0) {
      // Clear existing markers
      markers.forEach(marker => marker.setMap(null));

      // Create new markers
      const newMarkers = items.map(item => {
        const { lat, lng } = item.location;

        // Create marker
        const marker = new window.google.maps.Marker({
          position: { lat, lng },
          map,
          title: item.title || item.name || `Item #${item.id}`,
          icon: getMarkerIcon(item.status || item.type)
        });

        // Add click listener
        marker.addListener('click', () => {
          setSelectedItemId(item.id);
          if (onItemClick) {
            onItemClick(item);
          }
        });

        return marker;
      });

      setMarkers(newMarkers);

      // Fit bounds to show all markers
      if (newMarkers.length > 0) {
        const bounds = new window.google.maps.LatLngBounds();
        newMarkers.forEach(marker => bounds.extend(marker.getPosition()));
        map.fitBounds(bounds);
      }
    }
    // eslint-disable-next-line
  }, [map, items]);

  // Update center when it changes
  useEffect(() => {
    if (map && center) {
      map.setCenter({ lat: center.lat, lng: center.lng });
      map.setZoom(15);
    }
  }, [map, center]);

  const initMap = () => {
    if (!mapRef.current || map) return;

    // Default center (São Paulo)
    const defaultCenter = { lat: -23.550520, lng: -46.633308 };

    // Create map
    const googleMap = new window.google.maps.Map(mapRef.current, {
      center: center || defaultCenter,
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false
    });

    setMap(googleMap);
  };

  const getMarkerIcon = (type: string) => {
    // Return different marker icons based on type
    switch (type.toLowerCase()) {
      case 'lost':
      case 'perdido':
        return {
          url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
          scaledSize: new window.google.maps.Size(32, 32)
        };
      case 'found':
      case 'encontrado':
        return {
          url: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
          scaledSize: new window.google.maps.Size(32, 32)
        };
      case 'adoption':
      case 'adoção':
        return {
          url: 'https://maps.google.com/mapfiles/ms/icons/pink-dot.png',
          scaledSize: new window.google.maps.Size(32, 32)
        };
      case 'donation':
      case 'doação':
        return {
          url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
          scaledSize: new window.google.maps.Size(32, 32)
        };
      case 'vet_help':
      case 'ajuda vet':
        return {
          url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          scaledSize: new window.google.maps.Size(32, 32)
        };
      default:
        return {
          url: 'https://maps.google.com/mapfiles/ms/icons/purple-dot.png',
          scaledSize: new window.google.maps.Size(32, 32)
        };
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'lost':
        return 'LOST';
      case 'found':
        return 'FOUND';
      case 'adoption':
        return 'ADOPTION';
      case 'donation':
        return 'DONATION';
      case 'vet_help':
        return 'VET HELP';
      default:
        return status.toUpperCase();
    }
  };

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'lost':
      case 'perdido':
        return 'bg-destructive text-white';
      case 'found':
      case 'encontrado':
        return 'bg-warning text-white';
      case 'adoption':
      case 'adoção':
        return 'bg-secondary text-white';
      case 'donation':
      case 'doação':
        return 'bg-success text-white';
      case 'vet_help':
      case 'ajuda vet':
        return 'bg-primary text-white';
      default:
        return 'bg-neutral-500 text-white';
    }
  };

  return (
    <div className="h-full relative">
      {/* Map Container */}
      <div ref={mapRef} className="h-full bg-neutral-200 w-full">
        {!map && (
          <div className="flex items-center justify-center h-full">
            <div className="text-neutral-500 text-center">
              <span className="material-icons text-5xl">map</span>
              <p className="mt-2">Loading map...</p>
            </div>
          </div>
        )}
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
        <Button 
          variant="secondary" 
          size="icon" 
          className="bg-white hover:bg-white text-neutral-700 shadow-md rounded-full"
          onClick={onBack}
        >
          <span className="material-icons">arrow_back</span>
        </Button>

        <div className="bg-white px-4 py-2 rounded-full shadow-md">
          <p className="text-sm text-neutral-700">
            {items.length} results
          </p>
        </div>

        <Button 
          variant="secondary" 
          size="icon" 
          className="bg-white hover:bg-white text-neutral-700 shadow-md rounded-full"
        >
          <span className="material-icons">filter_list</span>
        </Button>
      </div>

      {/* Bottom Sheet with Cards */}
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-lg p-4">
        <div className="w-12 h-1 bg-neutral-300 rounded-full mx-auto mb-4"></div>

        {/* Filters */}
        <div className="mb-4 overflow-x-auto scrollbar-hide">
          <div className="flex space-x-2">
            <button className="px-3 py-1 text-xs font-medium rounded-full bg-primary text-white whitespace-nowrap">
              All ({items.length})
            </button>
            <button className="px-3 py-1 text-xs font-medium rounded-full bg-neutral-200 text-neutral-700 whitespace-nowrap">
              Lost ({items.filter(i => i.status === 'lost').length})
            </button>
            <button className="px-3 py-1 text-xs font-medium rounded-full bg-neutral-200 text-neutral-700 whitespace-nowrap">
              Found ({items.filter(i => i.status === 'found').length})
            </button>
            <button className="px-3 py-1 text-xs font-medium rounded-full bg-neutral-200 text-neutral-700 whitespace-nowrap">
              Adoption ({items.filter(i => i.status === 'adoption').length})
            </button>
          </div>
        </div>

        {/* Horizontal Scrollable Cards */}
        <div className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4">
          {items.map((item) => (
            <div 
              key={`${item.type}-${item.id}`} 
              className={`bg-white rounded-lg shadow-md min-w-[220px] overflow-hidden ${selectedItemId === item.id ? 'border-2 border-primary' : ''}`}
              onClick={() => {
                setSelectedItemId(item.id);
                if (onItemClick) onItemClick(item);
              }}
            >
              <div className="relative">
                {item.photos && item.photos.length > 0 ? (
                  <img 
                    src={item.photos[0]} 
                    alt={item.title || item.name} 
                    className="w-full h-32 object-cover"
                  />
                ) : (
                  <div className="w-full h-32 bg-neutral-200 flex items-center justify-center">
                    <span className="material-icons text-3xl text-neutral-400">
                      {item.type === 'pet' ? 'pets' : 'volunteer_activism'}
                    </span>
                  </div>
                )}
                <span className={`absolute top-2 right-2 text-xs font-medium px-2 py-0.5 rounded-full ${getStatusClass(item.status || item.type)}`}>
                  {getStatusLabel(item.status || item.type)}
                </span>
              </div>
              <div className="p-3">
                <h4 className="font-medium text-neutral-900">{item.name || item.title || 'No name'}</h4>
                <p className="text-xs text-neutral-600 mt-1">
                  {item.location.address || 'Location not available'}
                </p>
                <button className="mt-2 w-full py-1.5 text-xs bg-primary text-white rounded-full flex items-center justify-center gap-1">
                  <span className="material-icons text-xs">info</span>
                  View details
                </button>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="flex-1 text-center py-6 text-neutral-500">
              <span className="material-icons text-2xl mb-2">search_off</span>
              <p>No results found in this area</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}