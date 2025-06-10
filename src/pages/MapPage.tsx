import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import MapView from "@/components/map/MapView";
import { useGeoLocation } from "@/hooks/useGeoLocation";

// Demo/mock data for pets, donations, and vet help
const mockPets = [
  {
    id: 1,
    name: "Thor",
    status: "available",
    lastLocation: { lat: -23.561684, lng: -46.625378 },
    photos: ["https://yaopets-media-demo/1747882882851-714.jpg"],
    ownerId: 1,
    foundById: null,
  },
  {
    id: 2,
    name: "Luna",
    status: "adopted",
    lastLocation: { lat: -23.565684, lng: -46.629378 },
    photos: ["https://yaopets-media-demo/1747883030624-652.jpg"],
    ownerId: 2,
    foundById: null,
  },
];
const mockDonations = [
  {
    id: 10,
    title: "Premium Dog Food",
    location: { lat: -23.563684, lng: -46.623378 },
    photos: ["https://yaopets-media-demo/1747882882851-714.jpg"],
    donorId: 2,
  },
  {
    id: 11,
    title: "Cat Carrier Box",
    location: { lat: -23.562684, lng: -46.626378 },
    photos: ["https://yaopets-media-demo/1747883030624-652.jpg"],
    donorId: 3,
  },
];
const mockVetHelps = [
  {
    id: 100,
    title: "Dog injured on street",
    location: { lat: -23.560684, lng: -46.624378 },
    photos: [],
    requesterId: 4,
  },
];

export default function MapPage() {
  const [, setLocation] = useLocation();
  const { position, getCurrentPosition } = useGeoLocation();
  const [mapItems, setMapItems] = useState<any[]>([]);

  // Get current location when component mounts
  useEffect(() => {
    getCurrentPosition();
  }, []);

  // Process data for map (offline, using local/mock data)
  useEffect(() => {
    const items: any[] = [];

    // Pets
    mockPets.forEach(pet => {
      if (pet.lastLocation && pet.lastLocation.lat && pet.lastLocation.lng) {
        items.push({
          id: pet.id,
          type: 'pet',
          name: pet.name,
          status: pet.status,
          location: pet.lastLocation,
          photos: pet.photos,
          ownerId: pet.ownerId,
          foundById: pet.foundById
        });
      }
    });

    // Donations
    mockDonations.forEach(donation => {
      if (donation.location && donation.location.lat && donation.location.lng) {
        items.push({
          id: donation.id,
          type: 'donation',
          title: donation.title,
          status: 'donation',
          location: donation.location,
          photos: donation.photos,
          donorId: donation.donorId
        });
      }
    });

    // Vet Help
    mockVetHelps.forEach(vetHelp => {
      if (vetHelp.location && vetHelp.location.lat && vetHelp.location.lng) {
        items.push({
          id: vetHelp.id,
          type: 'vet_help',
          title: vetHelp.title,
          status: 'vet_help',
          location: vetHelp.location,
          photos: vetHelp.photos,
          requesterId: vetHelp.requesterId
        });
      }
    });

    setMapItems(items);
  }, []);

  // Handle back button click
  const handleBack = () => {
    setLocation('/');
  };

  // Handle map item click
  const handleItemClick = (item: any) => {
    if (item.type === 'pet') {
      setLocation(`/pets/${item.id}`);
    } else if (item.type === 'donation') {
      setLocation(`/donations/${item.id}`);
    } else if (item.type === 'vet_help') {
      setLocation(`/vet-help/${item.id}`);
    }
  };

  return (
    <div className="h-screen">
      <MapView
        items={mapItems}
        center={position || undefined}
        onItemClick={handleItemClick}
        onBack={handleBack}
      />
    </div>
  );
}