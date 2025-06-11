import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Heart, ArrowLeft, Map } from "lucide-react";
import NativeBottomNavigation from "@/components/mobile/NativeBottomNavigation";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

// Pet interface
interface Pet {
  id: string | number;
  name: string;
  species: string;
  size: string;
  age: string;
  address: string;
  description: string;
  status: string;
  contactPhone: string;
  breed?: string;
  color?: string;
  eyeColor?: string;
  ownerName?: string;
  ownerId?: string;
  photos?: string[];
  imageUrl?: string;
}

export default function PetDetailsPage() {
  const [pet, setPet] = useState<Pet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, navigate] = useLocation();
  const [match, params] = useRoute<{ id: string }>("/pet-details/:id");
  const { user } = useAuth();

  // Fetch pet data by ID from backend API
  useEffect(() => {
    const petId = params?.id;
    if (!match || !petId) {
      setIsLoading(false);
      return;
    }

    let isCancelled = false;
    const fetchPetDetails = async () => {
      try {
        setIsLoading(true);
        const { data } = await api.pet.getPetById(petId);
        if (!data) throw new Error("Pet not found");

        // Normalize/enrich properties
        const petDetails: Pet = {
          id: data._id || data.id,
          name: data.name || "Pet for adoption",
          species: data.species || "Not specified",
          size: data.size || "Medium",
          age: data.age || "Not specified",
          address: data.address || "Not informed",
          description: data.description || data.content || "New pet for adoption",
          status: (data.status === "adoption" || data.status === "Disponível") ? "Available"
            : data.status === "lost" ? "Lost"
            : data.status === "found" ? "Found"
            : "Available",
          contactPhone: data.contactPhone || "(xx) xxxxx-xxxx",
          breed: data.breed,
          color: data.color,
          eyeColor: data.eyeColor,
          ownerName: data.user?.name || data.ownerName,
          ownerId: data.user?._id || data.ownerId, // <-- Important for chat
          photos: data.photos,
          imageUrl: data.photos?.[0] || data.imageUrl,
        };

        if (!isCancelled) {
          setPet(petDetails);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Error loading pet details:', error);
          setPet(null);
        }
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };

    fetchPetDetails();
    return () => {
      isCancelled = true;
    };
  }, [params?.id, match]);

  const handleGoBack = () => {
    navigate("/pets");
  };

  // For "lost" and "found", show "Check location"; for "adoption", show "I want to adopt"
  const handleMainAction = async () => {
    if (!pet) return;
    if (pet.status === "Available") {
      // Adoption action: start chat with pet's owner
      if (!pet.ownerId) {
        alert("Could not start chat. Owner not found.");
        return;
      }
      // Do NOT redirect if the viewer is the owner themselves
      if (user && (pet.ownerId === user.id || pet.ownerId === user._id)) {
        alert("You are the owner of this pet.");
        return;
      }
      try {
        // Optionally: await api.chat.getOrCreateChat(pet.ownerId);
        navigate(`/chat/${pet.ownerId}`);
      } catch (err) {
        alert("Could not start chat with the owner.");
      }
    } else {
      // Lost or Found: Show location in Google Maps
      const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pet.address)}`;
      window.open(mapUrl, '_blank');
    }
  };

  const getActionButton = () => {
    if (!pet) return null;
    if (pet.status === "Available") {
      // Hide the button if the viewer is the owner
      if (user && (pet.ownerId === user.id || pet.ownerId === user._id)) {
        return (
          <div className="text-center text-green-700 font-medium mb-6">
            You are the owner of this pet.
          </div>
        );
      }
      return (
        <Button
          className="w-full bg-pink-500 hover:bg-pink-600 text-white py-6 rounded-md mb-6 h-12"
          onClick={handleMainAction}
        >
          <Heart className="h-5 w-5 mr-2" /> I want to adopt
        </Button>
      );
    }
    // Lost or Found
    return (
      <Button
        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-6 rounded-md mb-6 h-12"
        onClick={handleMainAction}
      >
        <Map className="h-5 w-5 mr-2" /> Check location
      </Button>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="container mx-auto p-4 pb-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Pet not found</h1>
          <p className="text-neutral-600 mb-6">The pet you are looking for is not available.</p>
          <Button onClick={handleGoBack}>Back to adoptions</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-16 bg-gray-100">
      {/* Hero image */}
      <div className="relative">
        <div className="w-full h-60 bg-gradient-to-b from-emerald-600 to-emerald-700 relative">
          {pet.imageUrl ? (
            <img
              src={pet.imageUrl}
              alt={pet.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="material-icons text-white/80 text-8xl">pets</span>
            </div>
          )}
          {/* Back button */}
          <Button
            variant="outline"
            size="icon"
            className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm rounded-full w-10 h-10 z-10"
            onClick={handleGoBack}
          >
            <ArrowLeft className="h-5 w-5 text-neutral-700" />
          </Button>
        </div>
      </div>
      {/* Main content */}
      <div className="px-4 -mt-3">
        <div className="bg-white rounded-t-xl p-6 shadow-sm">
          <div className="mb-2 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">{pet.name}</h1>
            <Badge className={
              pet.status === "Available"
                ? "bg-green-100 text-green-800 border-0 px-3 py-1"
                : pet.status === "Lost"
                  ? "bg-orange-100 text-orange-800 border-0 px-3 py-1"
                  : "bg-blue-100 text-blue-800 border-0 px-3 py-1"
            }>
              {pet.status}
            </Badge>
          </div>
          <div className="flex items-center mb-4 text-gray-600">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="text-sm">{pet.address}</span>
          </div>
          {getActionButton()}
          {/* Main details grid */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <span className="block text-sm font-medium text-gray-600">Species</span>
              <span className="block text-base font-semibold text-gray-800">{pet.species}</span>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <span className="block text-sm font-medium text-gray-600">Size</span>
              <span className="block text-base font-semibold text-gray-800">{pet.size}</span>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <span className="block text-sm font-medium text-gray-600">Age</span>
              <span className="block text-base font-semibold text-gray-800">{pet.age}</span>
            </div>
          </div>
          {/* Extended details grid - same design */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <span className="block text-sm font-medium text-gray-600">Breed</span>
              <span className="block text-base font-semibold text-gray-800">{pet.breed ?? "Not informed"}</span>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <span className="block text-sm font-medium text-gray-600">Color</span>
              <span className="block text-base font-semibold text-gray-800">{pet.color ?? "Not informed"}</span>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <span className="block text-sm font-medium text-gray-600">Eye Color</span>
              <span className="block text-base font-semibold text-gray-800">{pet.eyeColor ?? "Not informed"}</span>
            </div>
          </div>
          {/* Owner and contact, same design */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <span className="block text-sm font-medium text-gray-600">Owner</span>
              <span className="block text-base font-semibold text-gray-800">{pet.ownerName ?? "Not informed"}</span>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <span className="block text-sm font-medium text-gray-600">Phone</span>
              <span className="block text-base font-semibold text-gray-800">{pet.contactPhone ?? "Not informed"}</span>
            </div>
          </div>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2 text-gray-800">About {pet.name}</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              {pet.description}
            </p>
          </div>
          {pet.status === "Available" && (
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-semibold mb-3 text-gray-800">Adoption information</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-700 text-sm">
                    <span className="font-medium">Adoption process:</span> Interview with potential adopter, fill out a form, and sign a responsible adoption agreement.
                  </p>
                </div>
                <div>
                  <p className="text-gray-700 text-sm">
                    <span className="font-medium">Requirements:</span> Over 18 years old, commitment to the animal's well-being, suitable environment for the pet.
                  </p>
                </div>
                <div>
                  <p className="text-gray-700 text-sm">
                    <span className="font-medium">Contact:</span> Click the "I want to adopt" button above to start the adoption process.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <NativeBottomNavigation />
    </div>
  );
}